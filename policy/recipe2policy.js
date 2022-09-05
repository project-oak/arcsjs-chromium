/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
const STRING = 'stringPayload';

class Attribute {
  constructor(name, type, value) {
    this.name = name;
    this.type = type;
    this.value = value;
  }

  json() {
    return {
      [this.name]: {
        [this.type]: this.value
      }
    }
  }
}

class Input {
  constructor(id) {
    this.id = id;
  }

  json() {
    return {
      "operationResultValue": {
        "operationId": this.id,
        "outputName": "out"
      }
    }
  }
}

class Operation {
  constructor(generator, name, inputs, attributes) {
    this.id = generator.nextId++;
    this.name = name;
    this.inputs = inputs;
    this.attributes = attributes;
    generator.addUsedOp(name);
  }

  json() {
    return {
      "id": this.id,
      "operation": {
        "operatorName": this.name,
        "inputs": this.inputs.map(input => input.json()),
        "attributes": {
          // merge all attributes into an object
          "attributes": this.attributes.map(
              attribute => attribute.json()).reduce(
              (obj, json) => Object.assign(obj, json), {})
        }
      }
    }
  }
}

class Store extends Operation {
  constructor(generator, storeName, $store) {
    super(generator, 'arcsjs.create_store', [], [
      new Attribute("name", STRING, `${generator.recipeName}.${storeName}`),
      new Attribute("type", STRING, $store.$type)
    ]);
    this.generator = generator;
    this.storeName = storeName;
    this.$store = $store;
  }

  isPublicStore() {
    return this.$store.$tags && this.$store.$tags.includes('public');
  }
}

class PublicOp extends Operation {
  constructor(generator, inputId) {
    super(generator, 'sql.tag_transform', [new Input(inputId)], [
          new Attribute('rule_name', STRING, "set_public")
        ]
    );
  }
}

class OutputOp extends Operation {
  constructor(generator, handleName, inputId) {
    super(generator, 'sql.sql_output', [new Input(inputId)],
        [
          new Attribute('handle_name', STRING, handleName)
        ]);
  }
}

class Binding {
  constructor(generator, bindingName, store, isOutput) {
    this.bindingName = bindingName;
    this.store = store;
    this.op = this.isPublic() ? new PublicOp(generator, store.id) : store;
    this.isOutput = isOutput;
  }

  get id() {
    return this.op.id;
  }

  isPublic() {
    return this.store.isPublicStore();
  }

  json() {
    return this.op.json();
  }
}

function mapBindings(generator, bindings, stores, isOutput) {
  return bindings
      .flatMap(x => typeof x === 'string' ? {[x]: x} : Object.entries(x))
      // ignore bindings that don't match a store
      // TODO: should omit warning?
      .filter(([bindingName, storeName]) => stores.has(storeName))
      .map(([bindingName, storeName]) => [bindingName,
        new Binding(generator, bindingName, stores.get(storeName), isOutput)])
}

class Particle extends Operation {
  constructor(generator, particleName, $particle, stores) {
    const bindingMap = new Map(
        mapBindings(generator, $particle.$inputs, stores, false).concat(
            mapBindings(generator, $particle.$outputs, stores, true)));

    const inputBindings = [...bindingMap.values()].filter(x => !x.isOutput);
    const inputs = inputBindings.map(binding => new Input(binding.id));
    const inputAttributes =  inputBindings.map(
        (binding, index) => new Attribute("input_" + index, STRING,
            binding.bindingName));

    super(generator, "arcsjs.particle", [...inputs], [
      new Attribute("name", STRING, `${generator.recipeName}.${particleName}`),
      ...inputAttributes
    ]);

    this.particleName = particleName;
    this.$particle = $particle;
    this.storeMap = stores;
    this.bindingMap = bindingMap;
    this.output = this.outputBindings().map(
        binding => new OutputOp(generator, binding.bindingName, this.id));
  }

  bindings() {
    return [...this.bindingMap.values()];
  }

  publicBindings() {
    return this.bindings().filter(binding => binding.isPublic());
  }

  nonPublicBindings() {
    return this.bindings().filter(binding => !binding.isPublic());
  }

  outputBindings() {
    return this.bindings().filter(binding => binding.isOutput);
  }
}

export class PolicyGenerator {
  constructor(recipe, name) {
    this.nextId = 0;
    this.recipeName = name;
    this.recipe = recipe;
    this.$particles = Object.entries(recipe)
        .filter(([key, value]) => !!value.$inputs);
    this.usedOps = new Set();

  }

  addUsedOp(name) {
    this.usedOps.add(name);
  }

  recipeToPolicy() {
    // Construct all create_store operations first
    const stores = Object.entries(this.recipe.$stores).map(
        ([storeName, storeConfig]) => new Store(this, storeName, storeConfig));

    // Map of storeName => store
    const storeMap = new Map(stores.map(store => [store.storeName, store]));

    const particles = this.$particles.map(
        ([particleName, $particle]) => new Particle(this, particleName,
            $particle, storeMap));

    // Uses a set to de-dup stores
    const allReferencedStores = [...new Set(particles.flatMap(
        particle => particle.bindings()).map(binding => binding.store))];

    // Collect all-public bindings which need set_public tag
    const allPublicOps = particles.flatMap(
        particle => particle.publicBindings()).map(binding => binding.op);
    const allOutputOps = particles.flatMap(particle => particle.output);

    const allOps = allReferencedStores.concat(allPublicOps).concat(
        particles).concat(allOutputOps).map(op => op.json());

    return {
      "topLevelModule": {
        "blocks": [
          {
            "id": this.nextId++,
            "block": {
              "operations": allOps
            }
          }]
      },
      "frontend": "Recipe2Policy.js",
      operators: [...this.usedOps].map(name => ({"name": name}))
    };
  }
}