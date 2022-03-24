var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key2, value) => key2 in obj ? __defProp(obj, key2, { enumerable: true, configurable: true, writable: true, value }) : obj[key2] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __publicField = (obj, key2, value) => {
  __defNormalProp(obj, typeof key2 !== "symbol" ? key2 + "" : key2, value);
  return value;
};

// pkg/js/core/EventEmitter.js
var EventEmitter = class {
  listeners = {};
  getEventListeners(eventName) {
    return this.listeners[eventName] || (this.listeners[eventName] = []);
  }
  fire(eventName, ...args) {
    const listeners = this.getEventListeners(eventName);
    if (listeners?.forEach) {
      listeners.forEach((listener) => listener(...args));
    }
  }
  listen(eventName, listener, listenerName) {
    const listeners = this.getEventListeners(eventName);
    listeners.push(listener);
    listener._name = listenerName || "(unnamed listener)";
    return listener;
  }
  unlisten(eventName, listener) {
    const list = this.getEventListeners(eventName);
    const index = typeof listener === "string" ? list.findIndex((l) => l._name === listener) : list.indexOf(listener);
    if (index >= 0) {
      list.splice(index, 1);
    } else {
      console.warn("failed to unlisten from", eventName);
    }
  }
};

// pkg/js/utils/log.js
var _logFactory = (enable, preamble, color, log11 = "log") => {
  if (!enable) {
    return () => {
    };
  }
  if (log11 === "dir") {
    return console.dir.bind(console);
  }
  const style = `background: ${color || "gray"}; color: white; padding: 1px 6px 2px 7px; border-radius: 6px 0 0 6px;`;
  return console[log11].bind(console, `%c${preamble}`, style);
};
var logKinds = ["log", "group", "groupCollapsed", "groupEnd", "dir"];
var errKinds = ["warn", "error"];
var logFactory = (enable, preamble, color = "") => {
  const loggers = {};
  logKinds.forEach((log12) => loggers[log12] = _logFactory(enable, `${preamble}`, color, log12));
  errKinds.forEach((log12) => loggers[log12] = _logFactory(true, `${preamble}`, color, log12));
  const log11 = loggers["log"];
  Object.assign(log11, loggers);
  return log11;
};
logFactory.flags = globalThis["logFlags"] || {};

// pkg/js/core/Arc.js
var customLogFactory = (id) => logFactory(logFactory.flags.arc, `Arc (${id})`, "slateblue");
var { keys, entries, values, create } = Object;
var nob = () => create(null);
var Arc = class extends EventEmitter {
  log;
  id;
  meta;
  stores;
  hosts;
  surface;
  composer;
  hostService;
  constructor(id, meta, surface) {
    super();
    this.id = id;
    this.meta = meta;
    this.surface = surface;
    this.hosts = nob();
    this.stores = nob();
    this.log = customLogFactory(id);
  }
  async addHost(host, surface) {
    await this.ensureComposer();
    this.hosts[host.id] = host;
    host.arc = this;
    this.updateHost(host);
    return host;
  }
  async ensureComposer() {
    if (!this.composer && this.surface) {
      this.composer = await this.surface.createComposer("root");
      this.composer.onevent = this.onevent.bind(this);
    }
  }
  removeHost(id) {
    this.hosts[id]?.detach();
    delete this.hosts[id];
  }
  addStore(storeId, store) {
    if (store && !this.stores[storeId]) {
      this.stores[storeId] = store;
      store.listen("change", () => this.storeChanged(storeId, store));
    }
  }
  removeStore(storeId) {
    if (this.stores[storeId]) {
    }
    delete this.stores[storeId];
  }
  storeChanged(storeId, store) {
    this.log(`storeChanged: "${storeId}"`);
    values(this.hosts).forEach((host) => {
      const bindings = host.meta?.bindings;
      const isBound = bindings && entries(bindings).some(([n, v]) => (v || n) === storeId);
      if (isBound) {
        this.log(`host "${host.id}" has interest in "${storeId}"`);
        this.updateHost(host);
      }
    });
  }
  updateHost(host) {
    host.inputs = this.computeInputs(host);
  }
  computeInputs(host) {
    const inputs = nob();
    const bindings = host.meta?.bindings;
    const staticInputs = host.meta?.inputs;
    if (bindings) {
      keys(bindings).forEach((name) => this.computeInput(name, bindings, staticInputs, inputs));
      this.log(`computeInputs(${host.id}) =`, inputs);
    }
    return inputs;
  }
  computeInput(name, bindings, staticInputs, inputs) {
    const storeName = bindings[name] || name;
    const store = this.stores[storeName];
    if (store) {
      inputs[name] = store.pojo;
    } else {
      this.log.error(`computeInputs: "${storeName}" (bound to "${name}") not found`);
    }
    if (!(inputs[name]?.length > 0) && staticInputs?.[name]) {
      inputs[name] = staticInputs[name];
    }
  }
  assignOutputs({ id, meta }, outputs) {
    const names = keys(outputs);
    if (meta?.bindings && names.length) {
      names.forEach((name) => this.assignOutput(name, this.stores, outputs[name], meta.bindings));
      this.log(`[end][${id}] assignOutputs:`, outputs);
    }
  }
  assignOutput(name, stores, output, bindings) {
    if (output !== void 0) {
      const binding = bindings[name] || name;
      const store = stores[binding];
      if (!store) {
        if (bindings[name]) {
          this.log.warn(`assignOutputs: no "${binding}" store for output "${name}"`);
        }
      } else {
        this.log(`assignOutputs: "${name}" is dirty, updating Store "${binding}"`, output);
        store.data = output;
      }
    }
  }
  async render(packet) {
    this.log("render", packet, Boolean(this.composer));
    if (this.composer) {
      this.composer.render(packet);
    }
  }
  onevent(pid, eventlet) {
    const host = this.hosts[pid];
    if (host) {
      host.handleEvent(eventlet);
    }
  }
  async service(host, request) {
    let result = await this.surface?.service(request);
    if (result === void 0) {
      result = this.hostService?.(host, request);
    }
    return result;
  }
};

// pkg/js/utils/object.js
var shallowUpdate = (obj, data) => {
  let result = data;
  if (!data) {
  } else if (Array.isArray(data)) {
    if (!Array.isArray(obj)) {
      obj = [];
    }
    for (let i = 0; i < data.length; i++) {
      const value = data[i];
      if (obj[i] !== value) {
        obj[i] = value;
      }
    }
    const overage = obj.length - data.length;
    if (overage > 0) {
      obj.splice(data.length, overage);
    }
  } else if (typeof data === "object") {
    result = obj && typeof obj === "object" ? obj : /* @__PURE__ */ Object.create(null);
    const seen = {};
    Object.keys(data).forEach((key2) => {
      result[key2] = data[key2];
      seen[key2] = true;
    });
    Object.keys(result).forEach((key2) => {
      if (!seen[key2]) {
        delete result[key2];
      }
    });
  }
  return result;
};
var shallowMerge = (obj, data) => {
  if (data == null) {
    return null;
  }
  if (typeof data === "object") {
    const result = obj && typeof obj === "object" ? obj : /* @__PURE__ */ Object.create(null);
    Object.keys(data).forEach((key2) => result[key2] = data[key2]);
    return result;
  }
  return data;
};
var deepCopy = (datum) => {
  if (!datum) {
    return datum;
  } else if (Array.isArray(datum)) {
    const clone = [];
    datum.forEach((element) => clone.push(deepCopy(element)));
    return clone;
  } else if (typeof datum === "object") {
    const clone = /* @__PURE__ */ Object.create(null);
    Object.entries(datum).forEach(([key2, value]) => {
      clone[key2] = deepCopy(value);
    });
    return clone;
  } else {
    return datum;
  }
};
var deepEqual = (a, b) => {
  const type = typeof a;
  if (type !== typeof b) {
    return false;
  }
  if (type === "object" && a && b) {
    const aProps = Object.getOwnPropertyNames(a);
    const bProps = Object.getOwnPropertyNames(b);
    return aProps.length == bProps.length && !aProps.some((name) => !deepEqual(a[name], b[name]));
  }
  return a === b;
};
var deepUndefinedToNull = (obj) => {
  if (obj === void 0) {
    return null;
  }
  if (obj && typeof obj === "object") {
    const props = Object.getOwnPropertyNames(obj);
    props.forEach((name) => {
      const prop = obj[name];
      if (prop === void 0) {
        delete obj[name];
      } else {
        deepUndefinedToNull(prop);
      }
    });
  }
  return obj;
};

// pkg/js/utils/rand.js
var { floor, pow, random } = Math;
var key = (digits) => floor((1 + random() * 9) * pow(10, digits - 1));
var irand = (range) => floor(random() * range);
var arand = (array) => array[irand(array.length)];
var prob = (probability) => Boolean(random() < probability);

// pkg/js/core/Decorator.js
var log = logFactory(logFactory.flags.decorator, "Decorator", "plum");
var { values: values2, entries: entries2 } = Object;
var opaqueData = {};
var Decorator = {
  setOpaqueData(name, data) {
    opaqueData[name] = data;
    return name;
  },
  getOpaqueData(name) {
    return opaqueData[name];
  },
  maybeDecorateModel(model, particle) {
    if (model && !Array.isArray(model)) {
      values2(model).forEach((item) => {
        if (item && typeof item === "object") {
          if (item["models"]) {
            log("applying decorator(s) to list:", item);
            this.maybeDecorateItem(item, particle);
          } else {
            if (model?.filter || model?.decorator || model?.collateBy) {
              log("scanning for lists in sub-model:", item);
              this.maybeDecorateModel(item, particle);
            }
          }
        }
      });
    }
    return model;
  },
  maybeDecorateItem(item, particle) {
    let models = typeof item.models === "string" ? this.getOpaqueData(item.models) : item.models;
    models = maybeDecorate(models, item.decorator, particle);
    models = maybeFilter(models, item.filter, particle.impl);
    models = maybeCollateBy(models, item);
    item.models = models;
  }
};
var maybeDecorate = (models, decorator, particle) => {
  decorator = particle.impl[decorator] ?? decorator;
  const { inputs, state } = particle.internal;
  if (decorator) {
    const immutableState = Object.freeze(deepCopy(state));
    models = models.map((model) => {
      model.privateData = model.privateData || {};
      const decorated = decorator(model, inputs, immutableState);
      model.privateData = decorated.privateData;
      return { ...decorated, ...model };
    });
    models.sort(sortByLc("sortKey"));
    log("decoration was performed");
  }
  return models;
};
var maybeFilter = (models, filter, impl) => {
  filter = impl[filter] ?? filter;
  if (filter && models) {
    models = models.filter(filter);
  }
  return models;
};
var maybeCollateBy = (models, item) => {
  entries2(item).forEach(([name, collator]) => {
    if (collator?.["collateBy"]) {
      const collation = collate(models, collator["collateBy"]);
      models = collationToRenderModels(collation, name, collator["$template"]);
    }
  });
  return models;
};
var sortByLc = (key2) => (a, b) => sort(String(a[key2]).toLowerCase(), String(b[key2]).toLowerCase());
var sort = (a, b) => a < b ? -1 : a > b ? 1 : 0;
var collate = (models, collateBy) => {
  const collation = {};
  models.forEach((model) => {
    const keyValue = model[collateBy];
    if (keyValue) {
      const category = collation[keyValue] || (collation[keyValue] = []);
      category.push(model);
    }
  });
  return collation;
};
var collationToRenderModels = (collation, name, $template) => {
  return entries2(collation).map(([key2, models]) => ({
    key: key2,
    [name]: { models, $template },
    single: !(models["length"] !== 1),
    ...models?.[0]
  }));
};

// pkg/js/core/Host.js
var { entries: entries3 } = Object;
var customLogFactory2 = (id) => logFactory(logFactory.flags.host, `Host (${id})`, arand(["#5a189a", "#51168b", "#48137b", "#6b2fa4", "#7b46ae", "#3f116c"]));
var Host = class {
  arc;
  composer;
  id;
  lastOutput;
  log;
  meta;
  particle;
  constructor(id) {
    this.log = customLogFactory2(id);
    this.id = id;
  }
  async bindToSurface(surface, rootSlot = "root") {
    this.composer = await surface.createComposer(rootSlot);
    this.composer.onevent = this.onevent.bind(this);
  }
  onevent(eventlet) {
    this.arc?.onevent(eventlet);
  }
  installParticle(particle, meta) {
    if (this.particle) {
      this.detachParticle();
    }
    if (particle) {
      this.attachParticle(particle);
      this.meta = meta || this.meta;
    }
  }
  get container() {
    return this.meta?.container || "root";
  }
  detach() {
    this.detachParticle();
    this.arc = null;
  }
  attachParticle(particle) {
    this.particle = particle;
  }
  detachParticle() {
    const { particle } = this;
    if (particle) {
      this.render({ $clear: true });
      this.particle = null;
      this.meta = null;
    }
  }
  async service(request) {
    if (request?.decorate) {
      return Decorator.maybeDecorateModel(request.model, this.particle);
    }
    return this.arc?.service(this, request);
  }
  output(outputModel, renderModel) {
    if (outputModel) {
      this.lastOutput = outputModel;
      this.arc?.assignOutputs(this, outputModel);
    }
    if (this.template) {
      Decorator.maybeDecorateModel(renderModel, this.particle);
      this.log(renderModel);
      this.render(renderModel);
    }
  }
  render(model) {
    const { id, container, template } = this;
    this.arc?.render({ id, container, content: { template, model } });
  }
  trap(func) {
    return func();
  }
  set inputs(inputs) {
    if (this.particle && inputs) {
      const lastInputs = this.particle.internal.inputs;
      const dirty = !lastInputs || this.dirtyCheck(inputs, lastInputs, this.lastOutput);
      if (dirty) {
        this.particle.inputs = { ...this.meta?.inputs, ...inputs };
      } else {
        this.log("inputs are not interesting, skipping update");
      }
    }
  }
  dirtyCheck(inputs, lastInputs, lastOutput) {
    return entries3(inputs).some(([n, v]) => lastOutput?.[n] && !deepEqual(lastOutput[n], v) || !deepEqual(lastInputs?.[n], v));
  }
  get config() {
    return this.particle?.config;
  }
  get template() {
    return this.config?.template;
  }
  invalidate() {
    this.particle?.invalidate();
  }
  handleEvent(eventlet) {
    return this.particle?.handleEvent(eventlet);
  }
};

// pkg/js/core/Store.js
var { values: values3, keys: keys2, entries: entries4 } = Object;
var { stringify } = JSON;
var RawStore = class extends EventEmitter {
  _data;
  constructor() {
    super();
    this._data = {};
  }
  get data() {
    return this._data;
  }
  set data(data) {
    this.change((doc) => doc._data = data);
  }
  get isObject() {
    return this.data && typeof this.data === "object";
  }
  get pojo() {
    return this.data;
  }
  get json() {
    return stringify(this.data);
  }
  get pretty() {
    const sorted = {};
    this.keys.sort().forEach((key2) => sorted[key2] = this.get(key2));
    return stringify(sorted, null, "  ");
  }
  get keys() {
    return keys2(this.data);
  }
  get length() {
    return keys2(this.data).length;
  }
  get values() {
    return values3(this.data);
  }
  get entries() {
    return entries4(this.data);
  }
  change(mutator) {
    mutator(this);
    this.doChange();
  }
  doChange() {
    this.fire("change", this);
    this.onChange(this);
  }
  set(key2, value) {
    if (value !== void 0) {
      this.change((doc) => doc.data[key2] = value);
    } else {
      this.delete(key2);
    }
  }
  push(...values5) {
    const keyString = () => `key_${key(12)}`;
    this.change((doc) => values5.forEach((value) => doc.data[keyString()] = value));
  }
  removeValue(value) {
    this.entries.find(([key2, entry]) => {
      if (entry === value) {
        this.delete(key2);
        return true;
      }
    });
  }
  has(key2) {
    return this.data[key2] !== void 0;
  }
  get(key2) {
    return this.data[key2];
  }
  getByIndex(index) {
    return this.data[this.keys[index]];
  }
  delete(key2) {
    this.change((doc) => doc.data?.[key2] && delete doc.data[key2]);
  }
  deleteByIndex(index) {
    this.delete(this.keys[index]);
  }
  assign(dictionary) {
    this.change((doc) => shallowMerge(doc.data, dictionary));
  }
  clear() {
    this.change((doc) => doc.data = {});
  }
  onChange(store) {
  }
};
var Store = class extends RawStore {
  meta;
  persistor;
  constructor(meta) {
    super();
    this.meta = meta || {};
  }
  isCollection() {
    return this.meta.type?.[0] === "[";
  }
  get tags() {
    return this.meta.tags || (this.meta.tags = []);
  }
  is(...tags) {
    return !tags.find((tag) => !this.tags.includes(tag));
  }
  async doChange() {
    super.doChange();
    this.persist();
  }
  async persist() {
    this.persistor?.persist(this);
  }
  async restore(value) {
    const restored = await this.persistor?.restore(this);
    if (!restored) {
      this.data = value !== void 0 ? value : this.getDefaultValue();
    }
  }
  getDefaultValue() {
    return this.isCollection() ? {} : "";
  }
  async remove() {
    this.persistor?.remove(this);
  }
  save() {
    return this.json;
  }
  load(value) {
    try {
      this.data = JSON.parse(value);
    } catch (x) {
    }
  }
};

// pkg/js/utils/id.js
var makeId = (pairs, digits, delim) => {
  pairs = pairs || 2;
  digits = digits || 2;
  delim = delim || "-";
  const min = Math.pow(10, digits - 1);
  const range = Math.pow(10, digits) - min;
  const result = [];
  for (let i = 0; i < pairs; i++) {
    result.push(`${irand(range - min) + min}`);
  }
  return result.join(delim);
};

// pkg/js/Runtime.js
var log2 = logFactory(logFactory.flags.runtime, "runtime", "forestgreen");
var particleFactoryCache = {};
var storeFactories = {};
var { keys: keys3 } = Object;
var _Runtime = class extends EventEmitter {
  log;
  uid;
  nid;
  arcs;
  peers;
  shares;
  stores;
  endpoint;
  network;
  surfaces;
  persistor;
  prettyUid;
  constructor(uid) {
    uid = uid || "user";
    super();
    this.arcs = {};
    this.surfaces = {};
    this.stores = {};
    this.peers = /* @__PURE__ */ new Set();
    this.shares = /* @__PURE__ */ new Set();
    this.log = logFactory(logFactory.flags.runtime, `runtime:[${this.prettyUid}]`, "forestgreen");
    this.setUid(uid);
    _Runtime.securityLockdown?.(_Runtime.particleOptions);
  }
  setUid(uid) {
    this.uid = uid;
    this.nid = `${uid}:${makeId(1, 2)}`;
    this.prettyUid = uid.substring(0, uid.indexOf("@") + 1);
  }
  async bootstrapArc(name, meta, surface, service) {
    const arc = new Arc(name, meta, surface);
    arc.hostService = this.serviceFactory(service);
    await this.addArc(arc);
    return arc;
  }
  serviceFactory(service) {
    return async (host, request) => await service.handle(this, host, request);
  }
  async bootstrapParticle(arc, id, meta) {
    const host = new Host(id);
    await this.marshalParticle(host, meta);
    const promise = arc.addHost(host);
    log2(host);
    return promise;
  }
  addSurface(id, surface) {
    this.surfaces[id] = surface;
  }
  getSurface(id) {
    return this.surfaces[id];
  }
  addArc(arc) {
    const { id } = arc;
    if (id && !this.arcs[id]) {
      return this.arcs[id] = arc;
    }
    throw `arc has no id, or id ["${id}"] is already in use `;
  }
  async marshalParticle(host, particleMeta) {
    const particle = await this.createParticle(host, particleMeta.kind);
    host.installParticle(particle, particleMeta);
  }
  addStore(storeId, store) {
    if (store.marshal) {
      store.marshal(store);
    }
    if (store.persistor) {
      store.persistor.persist = (store2) => this.persistor?.persist(storeId, store2);
    }
    store.listen("change", this.storeChanged.bind(this, storeId), `${storeId}-changed`);
    this.stores[storeId] = store;
    this.maybeShareStore(storeId);
    this.fire("store-added", store);
  }
  removeStore(storeId) {
    const store = this.stores[storeId];
    store?.unlisten("change", `${storeId}-changed`);
    delete this.stores[storeId];
  }
  maybeShareStore(storeId) {
    const store = this.stores[storeId];
    if (store.is("shared")) {
      this.shareStore(storeId);
    }
  }
  addPeer(peerId) {
    this.peers.add(peerId);
    [...this.shares].forEach((storeId) => this.maybeShareStoreWithPeer(storeId, peerId));
  }
  shareStore(storeId) {
    this.shares.add(storeId);
    [...this.peers].forEach((peerId) => this.maybeShareStoreWithPeer(storeId, peerId));
  }
  maybeShareStoreWithPeer(storeId, peerId) {
    const store = this.stores[storeId];
    const nid = this.uid.replace(/\./g, "_");
    if (!store.is("private") || peerId.startsWith(nid)) {
      this.shareStoreWithPeer(storeId, peerId);
    }
  }
  shareStoreWithPeer(storeId, peerId) {
    this.network?.shareStore(storeId, peerId);
  }
  storeChanged(storeId, store) {
    this.log("storeChanged", storeId);
    this.network?.invalidatePeers(storeId);
    this.onStoreChange(storeId, store);
    this.fire("store-changed", store);
  }
  onStoreChange(storeId, store) {
  }
  async createParticle(host, kind) {
    try {
      const factory = await this.marshalParticleFactory(kind);
      return factory(host);
    } catch (x) {
      log2.error(`createParticle(${kind}):`, x);
    }
  }
  async marshalParticleFactory(kind) {
    return particleFactoryCache[kind] ?? this.lateBindParticle(kind);
  }
  async lateBindParticle(kind) {
    return _Runtime.registerParticleFactory(kind, _Runtime?.particleIndustry(kind, _Runtime.particleOptions));
  }
  static registerParticleFactory(kind, factoryPromise) {
    return particleFactoryCache[kind] = factoryPromise;
  }
  requireStore(meta) {
    let store = this.stores[meta.name];
    if (!store) {
      store = this.createStore(meta);
      this.addStore(meta.name, store);
    }
    return store;
  }
  createStore(meta) {
    const key2 = keys3(storeFactories).find((tag) => meta.tags?.includes?.(tag));
    const storeClass = storeFactories[key2] || Store;
    return new storeClass(meta);
  }
  static registerStoreClass(tag, storeClass) {
    storeFactories[tag] = storeClass;
  }
};
var Runtime = _Runtime;
__publicField(Runtime, "securityLockdown");
__publicField(Runtime, "particleIndustry");
__publicField(Runtime, "particleOptions");

// pkg/js/recipe/RecipeParser.js
var log3 = logFactory(logFactory.flags.recipe, "flan", "violet");
var { entries: entries5, create: create2 } = Object;
var Parser = class {
  stores;
  particles;
  slots;
  meta;
  constructor(recipe) {
    this.stores = [];
    this.particles = [];
    this.slots = [];
    this.meta = create2(null);
    if (recipe) {
      this.parse(recipe);
    }
  }
  parse(recipe) {
    const normalized = this.normalize(recipe);
    this.parseSlotSpec(normalized, "root", "");
    return this;
  }
  normalize(recipe) {
    if (typeof recipe !== "object") {
      throw Error("recipe must be an Object");
    }
    return recipe;
  }
  parseSlotSpec(spec, slotName, parentName) {
    this.slots.push({ ...spec, $name: slotName, $parent: parentName });
    for (const key2 in spec) {
      const info = spec[key2];
      switch (key2) {
        case "$meta":
          this.meta = { ...this.meta, ...info };
          break;
        case "$stores":
          this.parseStoresNode(info);
          break;
        default: {
          const container = parentName ? `${parentName}#${slotName}` : slotName;
          this.parseParticleSpec(container, key2, info);
          break;
        }
      }
    }
  }
  parseStoresNode(stores) {
    for (const key2 in stores) {
      this.parseStoreSpec(key2, stores[key2]);
    }
  }
  parseStoreSpec(name, spec) {
    if (this.stores.find((s) => s.name === name)) {
      log3("duplicate store name");
      return;
    }
    const meta = {
      name,
      type: spec.$type,
      tags: spec.$tags,
      value: spec.$value
    };
    this.stores.push(meta);
  }
  parseParticleSpec(container, id, spec) {
    if (!spec.$kind) {
      log3.warn(`parseParticleSpec: malformed spec has no "kind":`, spec);
      throw Error();
    }
    if (this.particles.find((s) => s.id === id)) {
      log3("duplicate particle name");
      return;
    }
    this.particles.push({ id, container, spec });
    if (spec.$slots) {
      this.parseSlotsNode(spec.$slots, id);
    }
  }
  parseSlotsNode(slots, parent) {
    return Promise.all(entries5(slots).map(([key2, spec]) => {
      this.parseSlotSpec(spec, key2, parent);
    }));
  }
};

// pkg/js/recipe/StoreCook.js
var log4 = logFactory(logFactory.flags.recipe, "StoreCook", "#187e13");
var { values: values4 } = Object;
var matches = (storeMeta, targetMeta) => {
  for (const property in targetMeta) {
    if (storeMeta[property] !== targetMeta[property]) {
      return false;
    }
  }
  return true;
};
var findStores = (runtime, criteria) => {
  return values4(runtime.stores).filter((store) => matches(store.meta, criteria));
};
var mapStore = (runtime, { name, type }) => {
  return findStores(runtime, { name, type })?.[0];
};
var StoreCook = class {
  static async execute(runtime, arc, plan) {
    return StoreCook.forEachStore(runtime, arc, plan, StoreCook.realizeStore);
  }
  static async evacipate(runtime, arc, plan) {
    return StoreCook.forEachStore(runtime, arc, plan, StoreCook.derealizeStore);
  }
  static async forEachStore(runtime, arc, plan, func) {
    return Promise.all(plan.stores.map((store) => func(runtime, arc, store)));
  }
  static async realizeStore(runtime, arc, spec) {
    const meta = StoreCook.constructMeta(runtime, arc, spec);
    let store = mapStore(runtime, meta);
    if (!store) {
    } else {
      log4(`realizeStore: mapped "${spec.name}" to "${store.meta.name}"`);
    }
    if (!store) {
      store = runtime.createStore(meta);
      store.persistor = {
        restore: (store2) => runtime.persistor?.restore(meta.name, store2),
        persist: () => {
        }
      };
      runtime.addStore(meta.name, store);
      await store.restore(meta?.value);
      log4(`realizeStore: created "${meta.name}"`);
    }
    arc.addStore(meta.name, store);
  }
  static async derealizeStore(runtime, arc, spec) {
    runtime.removeStore(spec.name);
    arc.removeStore(spec.name);
  }
  static constructMeta(runtime, arc, spec) {
    const meta = {
      ...spec,
      arcid: arc.id,
      uid: runtime.uid
    };
    return {
      ...meta,
      owner: meta.uid,
      shareid: `${meta.name}:${meta.arcid}:${meta.uid}`
    };
  }
};

// pkg/js/recipe/ParticleCook.js
var log5 = logFactory(logFactory.flags.recipe, "ParticleCook", "#096f33");
var ParticleCook = class {
  static async execute(runtime, arc, plan) {
    for (const particle of plan.particles) {
      await this.realizeParticle(runtime, arc, particle);
    }
  }
  static async realizeParticle(runtime, arc, node) {
    const meta = this.specToMeta(node.spec);
    meta.container ||= node.container;
    return runtime.bootstrapParticle(arc, node.id, meta);
  }
  static specToMeta(spec) {
    const { $kind: kind, $container: container, $inputs: inputs, $bindings: bindings } = spec;
    return { kind, inputs, bindings, container };
  }
  static async evacipate(runtime, arc, plan) {
    return Promise.all(plan.particles.map((particle) => this.derealizeParticle(runtime, arc, particle)));
  }
  static async derealizeParticle(runtime, arc, node) {
    arc.removeHost(node.id);
  }
};

// pkg/js/recipe/Chef.js
var log6 = logFactory(logFactory.flags.recipe, "Chef", "#087f23");
var Chef = class {
  static async execute(recipe, runtime, arc) {
    if (arc instanceof Promise) {
      log6.error("`arc` must be an Arc, not a Promise. Make sure `boostrapArc` is awaited.");
      return;
    }
    log6("---> executing recipe: ", recipe.$meta);
    const plan = new Parser(recipe);
    await StoreCook.execute(runtime, arc, plan);
    await ParticleCook.execute(runtime, arc, plan);
    arc.meta = { ...arc.meta, ...plan.meta };
    log6("===| recipe complete: ", recipe.$meta);
  }
  static async evacipate(recipe, runtime, arc) {
    log6("---> evacipating recipe: ", recipe.$meta);
    const plan = new Parser(recipe);
    await ParticleCook.evacipate(runtime, arc, plan);
    log6("===| recipe evacipated: ", recipe.$meta);
  }
  static executeAll(recipes, runtime, arc) {
    return Promise.all(recipes?.map((recipe) => this.execute(recipe, runtime, arc)));
  }
  static evacipateAll(recipes, runtime, arc) {
    return Promise.all(recipes?.map((recipe) => this.evacipate(recipe, runtime, arc)));
  }
};

// pkg/js/render/Composer.js
var log7 = logFactory(logFactory.flags.composer, "composer", "red");
var Composer = class extends EventEmitter {
  slots;
  pendingPackets;
  constructor() {
    super();
    this.slots = {};
    this.pendingPackets = [];
  }
  activate() {
    this.fire("activate");
  }
  processPendingPackets() {
    const packets = this.pendingPackets;
    if (packets.length) {
      this.pendingPackets = [];
      packets.forEach((packet) => {
        packet.pendCount = (packet.pendCount || 0) + 1;
        this.render(packet);
      });
    }
  }
  render(packet) {
    const { id, container, content: { template, model } } = packet;
    log7({ id, container, model });
    let slot = this.slots[id];
    if (model?.$clear) {
      if (slot) {
        this.processPendingPackets();
        this.slots[id] = null;
        this.clearSlot(slot);
      }
      return;
    }
    if (!slot) {
      const parent = this.findContainer(container);
      if (!parent) {
        this.pendingPackets.push(packet);
        if (packet["pendCount"] % 100 === 0) {
          log7.warn(`container [${container}] unavailable for slot [${id}] (x100)`);
        }
        return;
      }
      slot = this.generateSlot(id, template, parent);
      this.slots[id] = slot;
    }
    if (slot && model) {
      slot.set(model);
      this.processPendingPackets();
    }
  }
  clearSlot(slot) {
  }
  findContainer(container) {
    return null;
  }
  generateSlot(id, template, parent) {
    return null;
  }
  onevent(pid, eventlet) {
    log7(`[${pid}] sent [${eventlet.handler}] event`);
  }
  requestFontFamily(fontFamily) {
    return false;
  }
};

// pkg/js/render/Surface.js
var log8 = logFactory(logFactory.flags.composer, "surface", "tomato");
var Surface = class {
  async createComposer(id) {
    const composer = await this.createComposerInstance(id);
    return composer;
  }
  async createComposerInstance(id) {
    return new Composer();
  }
  async service(msg) {
  }
};

// pkg/js/utils/paths.js
var PathMapper = class {
  map;
  constructor(root3) {
    this.map = {};
    this.setRoot(root3);
  }
  add(mappings) {
    Object.assign(this.map, mappings);
  }
  resolve(path) {
    const bits = path.split("/");
    const top = bits.shift();
    const prefix = this.map[top] || top;
    return [prefix, ...bits].join("/");
  }
  setRoot(root3) {
    if (root3.length && root3[root3.length - 1] === "/") {
      root3 = root3.slice(0, -1);
    }
    this.add({
      "$root": root3,
      "$arcs": root3
    });
  }
};
var root = import.meta.url.split("/").slice(0, -3).join("/");
var Paths = globalThis["Paths"] = new PathMapper(root);

// pkg/js/isolation/code.js
var log9 = logFactory(logFactory.flags.code, "code", "gold");
var defaultParticleBasePath = "$arcs/js/core/Particle.js";
var requireParticleBaseCode = async (sourcePath) => {
  if (!requireParticleBaseCode.source) {
    const path = Paths.resolve(sourcePath || defaultParticleBasePath);
    log9("particle base code path: ", path);
    const response = await fetch(path);
    const moduleText = await response.text() + "\n//# sourceURL=" + path + "\n";
    requireParticleBaseCode.source = moduleText.replace(/export /g, "");
  }
  return requireParticleBaseCode.source;
};
requireParticleBaseCode.source = null;
var requireParticleImplCode = async (kind, options) => {
  const code = options?.code || await fetchParticleCode(kind);
  return code.slice(code.indexOf("({"));
};
var fetchParticleCode = async (kind) => {
  if (kind) {
    return await maybeFetchParticleCode(kind);
  }
  log9.error(`fetchParticleCode: empty 'kind'`);
};
var maybeFetchParticleCode = async (kind) => {
  const path = pathForKind(Paths.resolve(kind));
  try {
    const response = await fetch(path);
    return await response.text();
  } catch (x) {
    log9.error(`could not locate implementation for particle "${kind}" [${path}]`);
  }
};
var pathForKind = (kind) => {
  if (kind) {
    if (!"$./".includes(kind[0]) && !kind.includes("://")) {
      kind = `$library/${kind}`;
    }
    if (!kind?.split("/").pop().includes(".")) {
      kind = `${kind}.js`;
    }
    return Paths.resolve(kind);
  }
  return "404";
};

// pkg/third_party/ses/ses.umd.min.js
((functors) => {
  function cell(name, value) {
    const observers = [];
    return { get: function() {
      return value;
    }, set: function(newValue) {
      value = newValue;
      for (const observe of observers)
        observe(value);
    }, observe: function(observe) {
      observers.push(observe), observe(value);
    }, enumerable: true };
  }
  const cells = [{ globalThis: cell(), Array: cell(), Date: cell(), Float32Array: cell(), JSON: cell(), Map: cell(), Math: cell(), Object: cell(), Promise: cell(), Proxy: cell(), Reflect: cell(), RegExp: cell(), Set: cell(), String: cell(), WeakMap: cell(), WeakSet: cell(), Error: cell(), RangeError: cell(), ReferenceError: cell(), SyntaxError: cell(), TypeError: cell(), assign: cell(), create: cell(), defineProperties: cell(), entries: cell(), freeze: cell(), getOwnPropertyDescriptor: cell(), getOwnPropertyDescriptors: cell(), getOwnPropertyNames: cell(), getPrototypeOf: cell(), is: cell(), isExtensible: cell(), keys: cell(), objectPrototype: cell(), seal: cell(), setPrototypeOf: cell(), values: cell(), speciesSymbol: cell(), toStringTagSymbol: cell(), iteratorSymbol: cell(), matchAllSymbol: cell(), stringifyJson: cell(), fromEntries: cell(), defineProperty: cell(), apply: cell(), construct: cell(), reflectGet: cell(), reflectGetOwnPropertyDescriptor: cell(), reflectHas: cell(), reflectIsExtensible: cell(), ownKeys: cell(), reflectPreventExtensions: cell(), reflectSet: cell(), isArray: cell(), arrayPrototype: cell(), mapPrototype: cell(), proxyRevocable: cell(), regexpPrototype: cell(), setPrototype: cell(), stringPrototype: cell(), weakmapPrototype: cell(), weaksetPrototype: cell(), functionPrototype: cell(), uncurryThis: cell(), objectHasOwnProperty: cell(), arrayForEach: cell(), arrayFilter: cell(), arrayJoin: cell(), arrayPush: cell(), arrayPop: cell(), arrayIncludes: cell(), mapSet: cell(), mapGet: cell(), mapHas: cell(), setAdd: cell(), setForEach: cell(), setHas: cell(), regexpTest: cell(), stringEndsWith: cell(), stringIncludes: cell(), stringMatch: cell(), stringSearch: cell(), stringSlice: cell(), stringSplit: cell(), stringStartsWith: cell(), weakmapGet: cell(), weakmapSet: cell(), weakmapHas: cell(), weaksetAdd: cell(), weaksetSet: cell(), weaksetHas: cell(), functionToString: cell(), getConstructorOf: cell(), immutableObject: cell(), isObject: cell(), FERAL_EVAL: cell(), FERAL_FUNCTION: cell() }, {}, { an: cell(), bestEffortStringify: cell() }, {}, { unredactedDetails: cell(), loggedErrorHandler: cell(), makeAssert: cell(), assert: cell() }, { makeEvaluateFactory: cell() }, { isValidIdentifierName: cell(), getScopeConstants: cell() }, { createScopeHandler: cell() }, { getSourceURL: cell() }, { rejectHtmlComments: cell(), evadeHtmlCommentTest: cell(), rejectImportExpressions: cell(), evadeImportExpressionTest: cell(), rejectSomeDirectEvalExpressions: cell(), mandatoryTransforms: cell(), applyTransforms: cell() }, { performEval: cell() }, { makeEvalFunction: cell() }, { makeFunctionConstructor: cell() }, { constantProperties: cell(), universalPropertyNames: cell(), initialGlobalPropertyNames: cell(), sharedGlobalPropertyNames: cell(), uniqueGlobalPropertyNames: cell(), NativeErrors: cell(), FunctionInstance: cell(), isAccessorPermit: cell(), whitelist: cell() }, { initGlobalObject: cell() }, { makeAlias: cell(), load: cell() }, { deferExports: cell(), getDeferredExports: cell() }, { makeThirdPartyModuleInstance: cell(), makeModuleInstance: cell() }, { link: cell(), instantiate: cell() }, { InertCompartment: cell(), CompartmentPrototype: cell(), makeCompartmentConstructor: cell() }, { getAnonymousIntrinsics: cell() }, { makeIntrinsicsCollector: cell(), getGlobalIntrinsics: cell() }, { minEnablements: cell(), moderateEnablements: cell(), severeEnablements: cell() }, { default: cell() }, { makeLoggingConsoleKit: cell(), makeCausalConsole: cell(), filterConsole: cell(), consoleWhitelist: cell(), BASE_CONSOLE_LEVEL: cell() }, { tameConsole: cell() }, { filterFileName: cell(), shortenCallSiteString: cell(), tameV8ErrorConstructor: cell() }, { default: cell() }, { makeHardener: cell() }, { default: cell() }, { default: cell() }, { tameFunctionToString: cell() }, { default: cell() }, { default: cell() }, { default: cell() }, { default: cell() }, { repairIntrinsics: cell(), makeLockdown: cell() }, {}], namespaces = cells.map((cells2) => Object.create(null, cells2));
  for (let index = 0; index < namespaces.length; index += 1)
    cells[index]["*"] = cell(0, namespaces[index]);
  functors[0]({ imports(entries6) {
    new Map(entries6);
  }, liveVar: {}, onceVar: { universalThis: cells[0].globalThis.set, Array: cells[0].Array.set, Date: cells[0].Date.set, Float32Array: cells[0].Float32Array.set, JSON: cells[0].JSON.set, Map: cells[0].Map.set, Math: cells[0].Math.set, Object: cells[0].Object.set, Promise: cells[0].Promise.set, Proxy: cells[0].Proxy.set, Reflect: cells[0].Reflect.set, RegExp: cells[0].RegExp.set, Set: cells[0].Set.set, String: cells[0].String.set, WeakMap: cells[0].WeakMap.set, WeakSet: cells[0].WeakSet.set, Error: cells[0].Error.set, RangeError: cells[0].RangeError.set, ReferenceError: cells[0].ReferenceError.set, SyntaxError: cells[0].SyntaxError.set, TypeError: cells[0].TypeError.set, assign: cells[0].assign.set, create: cells[0].create.set, defineProperties: cells[0].defineProperties.set, entries: cells[0].entries.set, freeze: cells[0].freeze.set, getOwnPropertyDescriptor: cells[0].getOwnPropertyDescriptor.set, getOwnPropertyDescriptors: cells[0].getOwnPropertyDescriptors.set, getOwnPropertyNames: cells[0].getOwnPropertyNames.set, getPrototypeOf: cells[0].getPrototypeOf.set, is: cells[0].is.set, isExtensible: cells[0].isExtensible.set, keys: cells[0].keys.set, objectPrototype: cells[0].objectPrototype.set, seal: cells[0].seal.set, setPrototypeOf: cells[0].setPrototypeOf.set, values: cells[0].values.set, speciesSymbol: cells[0].speciesSymbol.set, toStringTagSymbol: cells[0].toStringTagSymbol.set, iteratorSymbol: cells[0].iteratorSymbol.set, matchAllSymbol: cells[0].matchAllSymbol.set, stringifyJson: cells[0].stringifyJson.set, fromEntries: cells[0].fromEntries.set, defineProperty: cells[0].defineProperty.set, apply: cells[0].apply.set, construct: cells[0].construct.set, reflectGet: cells[0].reflectGet.set, reflectGetOwnPropertyDescriptor: cells[0].reflectGetOwnPropertyDescriptor.set, reflectHas: cells[0].reflectHas.set, reflectIsExtensible: cells[0].reflectIsExtensible.set, ownKeys: cells[0].ownKeys.set, reflectPreventExtensions: cells[0].reflectPreventExtensions.set, reflectSet: cells[0].reflectSet.set, isArray: cells[0].isArray.set, arrayPrototype: cells[0].arrayPrototype.set, mapPrototype: cells[0].mapPrototype.set, proxyRevocable: cells[0].proxyRevocable.set, regexpPrototype: cells[0].regexpPrototype.set, setPrototype: cells[0].setPrototype.set, stringPrototype: cells[0].stringPrototype.set, weakmapPrototype: cells[0].weakmapPrototype.set, weaksetPrototype: cells[0].weaksetPrototype.set, functionPrototype: cells[0].functionPrototype.set, uncurryThis: cells[0].uncurryThis.set, objectHasOwnProperty: cells[0].objectHasOwnProperty.set, arrayForEach: cells[0].arrayForEach.set, arrayFilter: cells[0].arrayFilter.set, arrayJoin: cells[0].arrayJoin.set, arrayPush: cells[0].arrayPush.set, arrayPop: cells[0].arrayPop.set, arrayIncludes: cells[0].arrayIncludes.set, mapSet: cells[0].mapSet.set, mapGet: cells[0].mapGet.set, mapHas: cells[0].mapHas.set, setAdd: cells[0].setAdd.set, setForEach: cells[0].setForEach.set, setHas: cells[0].setHas.set, regexpTest: cells[0].regexpTest.set, stringEndsWith: cells[0].stringEndsWith.set, stringIncludes: cells[0].stringIncludes.set, stringMatch: cells[0].stringMatch.set, stringSearch: cells[0].stringSearch.set, stringSlice: cells[0].stringSlice.set, stringSplit: cells[0].stringSplit.set, stringStartsWith: cells[0].stringStartsWith.set, weakmapGet: cells[0].weakmapGet.set, weakmapSet: cells[0].weakmapSet.set, weakmapHas: cells[0].weakmapHas.set, weaksetAdd: cells[0].weaksetAdd.set, weaksetSet: cells[0].weaksetSet.set, weaksetHas: cells[0].weaksetHas.set, functionToString: cells[0].functionToString.set, getConstructorOf: cells[0].getConstructorOf.set, immutableObject: cells[0].immutableObject.set, isObject: cells[0].isObject.set, FERAL_EVAL: cells[0].FERAL_EVAL.set, FERAL_FUNCTION: cells[0].FERAL_FUNCTION.set } }), functors[1]({ imports(entries6) {
    new Map(entries6);
  }, liveVar: {}, onceVar: {} }), functors[2]({ imports(entries6) {
    const map = new Map(entries6);
    for (const [name, observers] of map.get("../commons.js")) {
      const cell2 = cells[0][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
  }, liveVar: {}, onceVar: { an: cells[2].an.set, bestEffortStringify: cells[2].bestEffortStringify.set } }), functors[3]({ imports(entries6) {
    new Map(entries6);
  }, liveVar: {}, onceVar: {} }), functors[4]({ imports(entries6) {
    const map = new Map(entries6);
    for (const [name, observers] of map.get("../commons.js")) {
      const cell2 = cells[0][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./internal-types.js")) {
      const cell2 = cells[1][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./stringify-utils.js")) {
      const cell2 = cells[2][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./types.js")) {
      const cell2 = cells[3][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
  }, liveVar: {}, onceVar: { unredactedDetails: cells[4].unredactedDetails.set, loggedErrorHandler: cells[4].loggedErrorHandler.set, makeAssert: cells[4].makeAssert.set, assert: cells[4].assert.set } }), functors[5]({ imports(entries6) {
    const map = new Map(entries6);
    for (const [name, observers] of map.get("./commons.js")) {
      const cell2 = cells[0][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
  }, liveVar: {}, onceVar: { makeEvaluateFactory: cells[5].makeEvaluateFactory.set } }), functors[6]({ imports(entries6) {
    const map = new Map(entries6);
    for (const [name, observers] of map.get("./commons.js")) {
      const cell2 = cells[0][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
  }, liveVar: {}, onceVar: { isValidIdentifierName: cells[6].isValidIdentifierName.set, getScopeConstants: cells[6].getScopeConstants.set } }), functors[7]({ imports(entries6) {
    const map = new Map(entries6);
    for (const [name, observers] of map.get("./commons.js")) {
      const cell2 = cells[0][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./error/assert.js")) {
      const cell2 = cells[4][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
  }, liveVar: {}, onceVar: { createScopeHandler: cells[7].createScopeHandler.set } }), functors[8]({ imports(entries6) {
    const map = new Map(entries6);
    for (const [name, observers] of map.get("./commons.js")) {
      const cell2 = cells[0][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
  }, liveVar: {}, onceVar: { getSourceURL: cells[8].getSourceURL.set } }), functors[9]({ imports(entries6) {
    const map = new Map(entries6);
    for (const [name, observers] of map.get("./commons.js")) {
      const cell2 = cells[0][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./get-source-url.js")) {
      const cell2 = cells[8][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
  }, liveVar: {}, onceVar: { rejectHtmlComments: cells[9].rejectHtmlComments.set, evadeHtmlCommentTest: cells[9].evadeHtmlCommentTest.set, rejectImportExpressions: cells[9].rejectImportExpressions.set, evadeImportExpressionTest: cells[9].evadeImportExpressionTest.set, rejectSomeDirectEvalExpressions: cells[9].rejectSomeDirectEvalExpressions.set, mandatoryTransforms: cells[9].mandatoryTransforms.set, applyTransforms: cells[9].applyTransforms.set } }), functors[10]({ imports(entries6) {
    const map = new Map(entries6);
    for (const [name, observers] of map.get("./commons.js")) {
      const cell2 = cells[0][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./error/assert.js")) {
      const cell2 = cells[4][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./make-evaluate-factory.js")) {
      const cell2 = cells[5][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./scope-constants.js")) {
      const cell2 = cells[6][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./scope-handler.js")) {
      const cell2 = cells[7][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./transforms.js")) {
      const cell2 = cells[9][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
  }, liveVar: {}, onceVar: { performEval: cells[10].performEval.set } }), functors[11]({ imports(entries6) {
    const map = new Map(entries6);
    for (const [name, observers] of map.get("./evaluate.js")) {
      const cell2 = cells[10][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
  }, liveVar: {}, onceVar: { makeEvalFunction: cells[11].makeEvalFunction.set } }), functors[12]({ imports(entries6) {
    const map = new Map(entries6);
    for (const [name, observers] of map.get("./commons.js")) {
      const cell2 = cells[0][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./error/assert.js")) {
      const cell2 = cells[4][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./evaluate.js")) {
      const cell2 = cells[10][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
  }, liveVar: {}, onceVar: { makeFunctionConstructor: cells[12].makeFunctionConstructor.set } }), functors[13]({ imports(entries6) {
    new Map(entries6);
  }, liveVar: {}, onceVar: { constantProperties: cells[13].constantProperties.set, universalPropertyNames: cells[13].universalPropertyNames.set, initialGlobalPropertyNames: cells[13].initialGlobalPropertyNames.set, sharedGlobalPropertyNames: cells[13].sharedGlobalPropertyNames.set, uniqueGlobalPropertyNames: cells[13].uniqueGlobalPropertyNames.set, NativeErrors: cells[13].NativeErrors.set, FunctionInstance: cells[13].FunctionInstance.set, isAccessorPermit: cells[13].isAccessorPermit.set, whitelist: cells[13].whitelist.set } }), functors[14]({ imports(entries6) {
    const map = new Map(entries6);
    for (const [name, observers] of map.get("./commons.js")) {
      const cell2 = cells[0][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./make-eval-function.js")) {
      const cell2 = cells[11][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./make-function-constructor.js")) {
      const cell2 = cells[12][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./whitelist.js")) {
      const cell2 = cells[13][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
  }, liveVar: {}, onceVar: { initGlobalObject: cells[14].initGlobalObject.set } }), functors[15]({ imports(entries6) {
    const map = new Map(entries6);
    for (const [name, observers] of map.get("./commons.js")) {
      const cell2 = cells[0][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./error/assert.js")) {
      const cell2 = cells[4][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
  }, liveVar: {}, onceVar: { makeAlias: cells[15].makeAlias.set, load: cells[15].load.set } }), functors[16]({ imports(entries6) {
    const map = new Map(entries6);
    for (const [name, observers] of map.get("./commons.js")) {
      const cell2 = cells[0][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./error/assert.js")) {
      const cell2 = cells[4][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./module-load.js")) {
      const cell2 = cells[15][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
  }, liveVar: {}, onceVar: { deferExports: cells[16].deferExports.set, getDeferredExports: cells[16].getDeferredExports.set } }), functors[17]({ imports(entries6) {
    const map = new Map(entries6);
    for (const [name, observers] of map.get("./commons.js")) {
      const cell2 = cells[0][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./error/assert.js")) {
      const cell2 = cells[4][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./module-proxy.js")) {
      const cell2 = cells[16][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
  }, liveVar: {}, onceVar: { makeThirdPartyModuleInstance: cells[17].makeThirdPartyModuleInstance.set, makeModuleInstance: cells[17].makeModuleInstance.set } }), functors[18]({ imports(entries6) {
    const map = new Map(entries6);
    for (const [name, observers] of map.get("./commons.js")) {
      const cell2 = cells[0][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./error/assert.js")) {
      const cell2 = cells[4][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./module-instance.js")) {
      const cell2 = cells[17][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
  }, liveVar: {}, onceVar: { link: cells[18].link.set, instantiate: cells[18].instantiate.set } }), functors[19]({ imports(entries6) {
    const map = new Map(entries6);
    for (const [name, observers] of map.get("./commons.js")) {
      const cell2 = cells[0][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./error/assert.js")) {
      const cell2 = cells[4][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./evaluate.js")) {
      const cell2 = cells[10][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./global-object.js")) {
      const cell2 = cells[14][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./module-link.js")) {
      const cell2 = cells[18][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./module-load.js")) {
      const cell2 = cells[15][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./module-proxy.js")) {
      const cell2 = cells[16][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./scope-constants.js")) {
      const cell2 = cells[6][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./transforms.js")) {
      const cell2 = cells[9][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./whitelist.js")) {
      const cell2 = cells[13][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
  }, liveVar: {}, onceVar: { InertCompartment: cells[19].InertCompartment.set, CompartmentPrototype: cells[19].CompartmentPrototype.set, makeCompartmentConstructor: cells[19].makeCompartmentConstructor.set } }), functors[20]({ imports(entries6) {
    const map = new Map(entries6);
    for (const [name, observers] of map.get("./commons.js")) {
      const cell2 = cells[0][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./compartment-shim.js")) {
      const cell2 = cells[19][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
  }, liveVar: {}, onceVar: { getAnonymousIntrinsics: cells[20].getAnonymousIntrinsics.set } }), functors[21]({ imports(entries6) {
    const map = new Map(entries6);
    for (const [name, observers] of map.get("./commons.js")) {
      const cell2 = cells[0][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./whitelist.js")) {
      const cell2 = cells[13][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
  }, liveVar: {}, onceVar: { makeIntrinsicsCollector: cells[21].makeIntrinsicsCollector.set, getGlobalIntrinsics: cells[21].getGlobalIntrinsics.set } }), functors[22]({ imports(entries6) {
    new Map(entries6);
  }, liveVar: {}, onceVar: { minEnablements: cells[22].minEnablements.set, moderateEnablements: cells[22].moderateEnablements.set, severeEnablements: cells[22].severeEnablements.set } }), functors[23]({ imports(entries6) {
    const map = new Map(entries6);
    for (const [name, observers] of map.get("./commons.js")) {
      const cell2 = cells[0][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./enablements.js")) {
      const cell2 = cells[22][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
  }, liveVar: {}, onceVar: { default: cells[23].default.set } }), functors[24]({ imports(entries6) {
    const map = new Map(entries6);
    for (const [name, observers] of map.get("../commons.js")) {
      const cell2 = cells[0][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./internal-types.js")) {
      const cell2 = cells[1][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./types.js")) {
      const cell2 = cells[3][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
  }, liveVar: {}, onceVar: { makeLoggingConsoleKit: cells[24].makeLoggingConsoleKit.set, makeCausalConsole: cells[24].makeCausalConsole.set, filterConsole: cells[24].filterConsole.set, consoleWhitelist: cells[24].consoleWhitelist.set, BASE_CONSOLE_LEVEL: cells[24].BASE_CONSOLE_LEVEL.set } }), functors[25]({ imports(entries6) {
    const map = new Map(entries6);
    for (const [name, observers] of map.get("../commons.js")) {
      const cell2 = cells[0][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./assert.js")) {
      const cell2 = cells[4][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./console.js")) {
      const cell2 = cells[24][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./internal-types.js")) {
      const cell2 = cells[1][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./types.js")) {
      const cell2 = cells[3][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
  }, liveVar: {}, onceVar: { tameConsole: cells[25].tameConsole.set } }), functors[26]({ imports(entries6) {
    const map = new Map(entries6);
    for (const [name, observers] of map.get("../commons.js")) {
      const cell2 = cells[0][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
  }, liveVar: {}, onceVar: { filterFileName: cells[26].filterFileName.set, shortenCallSiteString: cells[26].shortenCallSiteString.set, tameV8ErrorConstructor: cells[26].tameV8ErrorConstructor.set } }), functors[27]({ imports(entries6) {
    const map = new Map(entries6);
    for (const [name, observers] of map.get("../commons.js")) {
      const cell2 = cells[0][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("../whitelist.js")) {
      const cell2 = cells[13][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./tame-v8-error-constructor.js")) {
      const cell2 = cells[26][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
  }, liveVar: {}, onceVar: { default: cells[27].default.set } }), functors[28]({ imports(entries6) {
    const map = new Map(entries6);
    for (const [name, observers] of map.get("./commons.js")) {
      const cell2 = cells[0][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
  }, liveVar: {}, onceVar: { makeHardener: cells[28].makeHardener.set } }), functors[29]({ imports(entries6) {
    const map = new Map(entries6);
    for (const [name, observers] of map.get("./commons.js")) {
      const cell2 = cells[0][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
  }, liveVar: {}, onceVar: { default: cells[29].default.set } }), functors[30]({ imports(entries6) {
    const map = new Map(entries6);
    for (const [name, observers] of map.get("./commons.js")) {
      const cell2 = cells[0][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
  }, liveVar: {}, onceVar: { default: cells[30].default.set } }), functors[31]({ imports(entries6) {
    const map = new Map(entries6);
    for (const [name, observers] of map.get("./commons.js")) {
      const cell2 = cells[0][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
  }, liveVar: {}, onceVar: { tameFunctionToString: cells[31].tameFunctionToString.set } }), functors[32]({ imports(entries6) {
    const map = new Map(entries6);
    for (const [name, observers] of map.get("./commons.js")) {
      const cell2 = cells[0][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./error/assert.js")) {
      const cell2 = cells[4][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
  }, liveVar: {}, onceVar: { default: cells[32].default.set } }), functors[33]({ imports(entries6) {
    const map = new Map(entries6);
    for (const [name, observers] of map.get("./commons.js")) {
      const cell2 = cells[0][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
  }, liveVar: {}, onceVar: { default: cells[33].default.set } }), functors[34]({ imports(entries6) {
    const map = new Map(entries6);
    for (const [name, observers] of map.get("./commons.js")) {
      const cell2 = cells[0][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
  }, liveVar: {}, onceVar: { default: cells[34].default.set } }), functors[35]({ imports(entries6) {
    const map = new Map(entries6);
    for (const [name, observers] of map.get("./commons.js")) {
      const cell2 = cells[0][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./whitelist.js")) {
      const cell2 = cells[13][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
  }, liveVar: {}, onceVar: { default: cells[35].default.set } }), functors[36]({ imports(entries6) {
    const map = new Map(entries6);
    for (const [name, observers] of map.get("./commons.js")) {
      const cell2 = cells[0][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./enable-property-overrides.js")) {
      const cell2 = cells[23][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./error/assert.js")) {
      const cell2 = cells[4][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./error/tame-console.js")) {
      const cell2 = cells[25][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./error/tame-error-constructor.js")) {
      const cell2 = cells[27][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./global-object.js")) {
      const cell2 = cells[14][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./intrinsics.js")) {
      const cell2 = cells[21][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./make-hardener.js")) {
      const cell2 = cells[28][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./tame-date-constructor.js")) {
      const cell2 = cells[29][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./tame-function-constructors.js")) {
      const cell2 = cells[30][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./tame-function-tostring.js")) {
      const cell2 = cells[31][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./tame-locale-methods.js")) {
      const cell2 = cells[32][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./tame-math-object.js")) {
      const cell2 = cells[33][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./tame-regexp-constructor.js")) {
      const cell2 = cells[34][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./whitelist-intrinsics.js")) {
      const cell2 = cells[35][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./whitelist.js")) {
      const cell2 = cells[13][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
  }, liveVar: {}, onceVar: { repairIntrinsics: cells[36].repairIntrinsics.set, makeLockdown: cells[36].makeLockdown.set } }), functors[37]({ imports(entries6) {
    const map = new Map(entries6);
    for (const [name, observers] of map.get("./src/commons.js")) {
      const cell2 = cells[0][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./src/compartment-shim.js")) {
      const cell2 = cells[19][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./src/error/assert.js")) {
      const cell2 = cells[4][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./src/get-anonymous-intrinsics.js")) {
      const cell2 = cells[20][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./src/intrinsics.js")) {
      const cell2 = cells[21][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./src/lockdown-shim.js")) {
      const cell2 = cells[36][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
    for (const [name, observers] of map.get("./src/tame-function-tostring.js")) {
      const cell2 = cells[31][name];
      if (cell2 === void 0)
        throw new ReferenceError("Cannot import name " + name);
      for (const observer of observers)
        cell2.observe(observer);
    }
  }, liveVar: {}, onceVar: {} });
})([({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  $h\u200D_imports([]);
  const universalThis = globalThis;
  $h\u200D_once.universalThis(universalThis);
  const { Array: Array2, Date, Float32Array, JSON: JSON2, Map: Map2, Math: Math2, Object: Object2, Promise: Promise2, Proxy: Proxy2, Reflect: Reflect2, RegExp, Set: Set2, String: String2, WeakMap: WeakMap2, WeakSet: WeakSet2 } = globalThis;
  $h\u200D_once.Array(Array2), $h\u200D_once.Date(Date), $h\u200D_once.Float32Array(Float32Array), $h\u200D_once.JSON(JSON2), $h\u200D_once.Map(Map2), $h\u200D_once.Math(Math2), $h\u200D_once.Object(Object2), $h\u200D_once.Promise(Promise2), $h\u200D_once.Proxy(Proxy2), $h\u200D_once.Reflect(Reflect2), $h\u200D_once.RegExp(RegExp), $h\u200D_once.Set(Set2), $h\u200D_once.String(String2), $h\u200D_once.WeakMap(WeakMap2), $h\u200D_once.WeakSet(WeakSet2);
  const { Error: Error2, RangeError: RangeError2, ReferenceError: ReferenceError2, SyntaxError: SyntaxError2, TypeError: TypeError2 } = globalThis;
  $h\u200D_once.Error(Error2), $h\u200D_once.RangeError(RangeError2), $h\u200D_once.ReferenceError(ReferenceError2), $h\u200D_once.SyntaxError(SyntaxError2), $h\u200D_once.TypeError(TypeError2);
  const { assign, create: create3, defineProperties, entries: entries6, freeze, getOwnPropertyDescriptor, getOwnPropertyDescriptors, getOwnPropertyNames, getPrototypeOf, is, isExtensible, keys: keys4, prototype: objectPrototype, seal, setPrototypeOf, values: values5 } = Object2;
  $h\u200D_once.assign(assign), $h\u200D_once.create(create3), $h\u200D_once.defineProperties(defineProperties), $h\u200D_once.entries(entries6), $h\u200D_once.freeze(freeze), $h\u200D_once.getOwnPropertyDescriptor(getOwnPropertyDescriptor), $h\u200D_once.getOwnPropertyDescriptors(getOwnPropertyDescriptors), $h\u200D_once.getOwnPropertyNames(getOwnPropertyNames), $h\u200D_once.getPrototypeOf(getPrototypeOf), $h\u200D_once.is(is), $h\u200D_once.isExtensible(isExtensible), $h\u200D_once.keys(keys4), $h\u200D_once.objectPrototype(objectPrototype), $h\u200D_once.seal(seal), $h\u200D_once.setPrototypeOf(setPrototypeOf), $h\u200D_once.values(values5);
  const { species: speciesSymbol, toStringTag: toStringTagSymbol, iterator: iteratorSymbol, matchAll: matchAllSymbol } = Symbol;
  $h\u200D_once.speciesSymbol(speciesSymbol), $h\u200D_once.toStringTagSymbol(toStringTagSymbol), $h\u200D_once.iteratorSymbol(iteratorSymbol), $h\u200D_once.matchAllSymbol(matchAllSymbol);
  const { stringify: stringifyJson } = JSON2;
  $h\u200D_once.stringifyJson(stringifyJson);
  const fromEntries = Object2.fromEntries || ((entryPairs) => {
    const result = {};
    for (const [prop, val] of entryPairs)
      result[prop] = val;
    return result;
  });
  $h\u200D_once.fromEntries(fromEntries);
  const { defineProperty: originalDefineProperty } = Object2;
  $h\u200D_once.defineProperty((object, prop, descriptor) => {
    const result = originalDefineProperty(object, prop, descriptor);
    if (result !== object)
      throw TypeError2(`Please report that the original defineProperty silently failed to set ${JSON2.stringify(String2(prop))}. (SES_DEFINE_PROPERTY_FAILED_SILENTLY)`);
    return result;
  });
  const { apply, construct, get: reflectGet, getOwnPropertyDescriptor: reflectGetOwnPropertyDescriptor, has: reflectHas, isExtensible: reflectIsExtensible, ownKeys, preventExtensions: reflectPreventExtensions, set: reflectSet } = Reflect2;
  $h\u200D_once.apply(apply), $h\u200D_once.construct(construct), $h\u200D_once.reflectGet(reflectGet), $h\u200D_once.reflectGetOwnPropertyDescriptor(reflectGetOwnPropertyDescriptor), $h\u200D_once.reflectHas(reflectHas), $h\u200D_once.reflectIsExtensible(reflectIsExtensible), $h\u200D_once.ownKeys(ownKeys), $h\u200D_once.reflectPreventExtensions(reflectPreventExtensions), $h\u200D_once.reflectSet(reflectSet);
  const { isArray, prototype: arrayPrototype } = Array2;
  $h\u200D_once.isArray(isArray), $h\u200D_once.arrayPrototype(arrayPrototype);
  const { prototype: mapPrototype } = Map2;
  $h\u200D_once.mapPrototype(mapPrototype);
  const { revocable: proxyRevocable } = Proxy2;
  $h\u200D_once.proxyRevocable(proxyRevocable);
  const { prototype: regexpPrototype } = RegExp;
  $h\u200D_once.regexpPrototype(regexpPrototype);
  const { prototype: setPrototype } = Set2;
  $h\u200D_once.setPrototype(setPrototype);
  const { prototype: stringPrototype } = String2;
  $h\u200D_once.stringPrototype(stringPrototype);
  const { prototype: weakmapPrototype } = WeakMap2;
  $h\u200D_once.weakmapPrototype(weakmapPrototype);
  const { prototype: weaksetPrototype } = WeakSet2;
  $h\u200D_once.weaksetPrototype(weaksetPrototype);
  const { prototype: functionPrototype } = Function;
  $h\u200D_once.functionPrototype(functionPrototype);
  const uncurryThis = (fn) => (thisArg, ...args) => apply(fn, thisArg, args);
  $h\u200D_once.uncurryThis(uncurryThis);
  const objectHasOwnProperty = uncurryThis(objectPrototype.hasOwnProperty);
  $h\u200D_once.objectHasOwnProperty(objectHasOwnProperty);
  const arrayForEach = uncurryThis(arrayPrototype.forEach);
  $h\u200D_once.arrayForEach(arrayForEach);
  const arrayFilter = uncurryThis(arrayPrototype.filter);
  $h\u200D_once.arrayFilter(arrayFilter);
  const arrayJoin = uncurryThis(arrayPrototype.join);
  $h\u200D_once.arrayJoin(arrayJoin);
  const arrayPush = uncurryThis(arrayPrototype.push);
  $h\u200D_once.arrayPush(arrayPush);
  const arrayPop = uncurryThis(arrayPrototype.pop);
  $h\u200D_once.arrayPop(arrayPop);
  const arrayIncludes = uncurryThis(arrayPrototype.includes);
  $h\u200D_once.arrayIncludes(arrayIncludes);
  const mapSet = uncurryThis(mapPrototype.set);
  $h\u200D_once.mapSet(mapSet);
  const mapGet = uncurryThis(mapPrototype.get);
  $h\u200D_once.mapGet(mapGet);
  const mapHas = uncurryThis(mapPrototype.has);
  $h\u200D_once.mapHas(mapHas);
  const setAdd = uncurryThis(setPrototype.add);
  $h\u200D_once.setAdd(setAdd);
  const setForEach = uncurryThis(setPrototype.forEach);
  $h\u200D_once.setForEach(setForEach);
  const setHas = uncurryThis(setPrototype.has);
  $h\u200D_once.setHas(setHas);
  const regexpTest = uncurryThis(regexpPrototype.test);
  $h\u200D_once.regexpTest(regexpTest);
  const stringEndsWith = uncurryThis(stringPrototype.endsWith);
  $h\u200D_once.stringEndsWith(stringEndsWith);
  const stringIncludes = uncurryThis(stringPrototype.includes);
  $h\u200D_once.stringIncludes(stringIncludes);
  const stringMatch = uncurryThis(stringPrototype.match);
  $h\u200D_once.stringMatch(stringMatch);
  const stringSearch = uncurryThis(stringPrototype.search);
  $h\u200D_once.stringSearch(stringSearch);
  const stringSlice = uncurryThis(stringPrototype.slice);
  $h\u200D_once.stringSlice(stringSlice);
  const stringSplit = uncurryThis(stringPrototype.split);
  $h\u200D_once.stringSplit(stringSplit);
  const stringStartsWith = uncurryThis(stringPrototype.startsWith);
  $h\u200D_once.stringStartsWith(stringStartsWith);
  const weakmapGet = uncurryThis(weakmapPrototype.get);
  $h\u200D_once.weakmapGet(weakmapGet);
  const weakmapSet = uncurryThis(weakmapPrototype.set);
  $h\u200D_once.weakmapSet(weakmapSet);
  const weakmapHas = uncurryThis(weakmapPrototype.has);
  $h\u200D_once.weakmapHas(weakmapHas);
  const weaksetAdd = uncurryThis(weaksetPrototype.add);
  $h\u200D_once.weaksetAdd(weaksetAdd);
  const weaksetSet = uncurryThis(weaksetPrototype.set);
  $h\u200D_once.weaksetSet(weaksetSet);
  const weaksetHas = uncurryThis(weaksetPrototype.has);
  $h\u200D_once.weaksetHas(weaksetHas);
  const functionToString = uncurryThis(functionPrototype.toString);
  $h\u200D_once.functionToString(functionToString);
  $h\u200D_once.getConstructorOf((fn) => reflectGet(getPrototypeOf(fn), "constructor"));
  const immutableObject = freeze(create3(null));
  $h\u200D_once.immutableObject(immutableObject);
  $h\u200D_once.isObject((value) => Object2(value) === value);
  const FERAL_EVAL = eval;
  $h\u200D_once.FERAL_EVAL(FERAL_EVAL);
  const FERAL_FUNCTION = Function;
  $h\u200D_once.FERAL_FUNCTION(FERAL_FUNCTION);
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  $h\u200D_imports([]);
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  let Error2, Set2, String2, freeze, is, setAdd, setHas, stringStartsWith, stringIncludes, stringifyJson, toStringTagSymbol;
  $h\u200D_imports([["../commons.js", [["Error", [($h\u200D_a) => Error2 = $h\u200D_a]], ["Set", [($h\u200D_a) => Set2 = $h\u200D_a]], ["String", [($h\u200D_a) => String2 = $h\u200D_a]], ["freeze", [($h\u200D_a) => freeze = $h\u200D_a]], ["is", [($h\u200D_a) => is = $h\u200D_a]], ["setAdd", [($h\u200D_a) => setAdd = $h\u200D_a]], ["setHas", [($h\u200D_a) => setHas = $h\u200D_a]], ["stringStartsWith", [($h\u200D_a) => stringStartsWith = $h\u200D_a]], ["stringIncludes", [($h\u200D_a) => stringIncludes = $h\u200D_a]], ["stringifyJson", [($h\u200D_a) => stringifyJson = $h\u200D_a]], ["toStringTagSymbol", [($h\u200D_a) => toStringTagSymbol = $h\u200D_a]]]]]);
  const an = (str) => (str = "" + str).length >= 1 && stringIncludes("aeiouAEIOU", str[0]) ? "an " + str : "a " + str;
  $h\u200D_once.an(an), freeze(an);
  const bestEffortStringify = (payload, spaces) => {
    const seenSet = new Set2(), replacer = (_, val) => {
      switch (typeof val) {
        case "object":
          return val === null ? null : setHas(seenSet, val) ? "[Seen]" : (setAdd(seenSet, val), val instanceof Error2 ? `[${val.name}: ${val.message}]` : toStringTagSymbol in val ? `[${val[toStringTagSymbol]}]` : val);
        case "function":
          return `[Function ${val.name || "<anon>"}]`;
        case "string":
          return stringStartsWith(val, "[") ? `[${val}]` : val;
        case "undefined":
        case "symbol":
          return `[${String2(val)}]`;
        case "bigint":
          return `[${val}n]`;
        case "number":
          return is(val, NaN) ? "[NaN]" : val === 1 / 0 ? "[Infinity]" : val === -1 / 0 ? "[-Infinity]" : val;
        default:
          return val;
      }
    };
    try {
      return stringifyJson(payload, replacer, spaces);
    } catch (_err) {
      return "[Something that failed to stringify]";
    }
  };
  $h\u200D_once.bestEffortStringify(bestEffortStringify), freeze(bestEffortStringify);
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  $h\u200D_imports([]);
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  let Error2, RangeError2, TypeError2, WeakMap2, assign, freeze, globalThis2, is, weakmapGet, weakmapSet, an, bestEffortStringify;
  $h\u200D_imports([["../commons.js", [["Error", [($h\u200D_a) => Error2 = $h\u200D_a]], ["RangeError", [($h\u200D_a) => RangeError2 = $h\u200D_a]], ["TypeError", [($h\u200D_a) => TypeError2 = $h\u200D_a]], ["WeakMap", [($h\u200D_a) => WeakMap2 = $h\u200D_a]], ["assign", [($h\u200D_a) => assign = $h\u200D_a]], ["freeze", [($h\u200D_a) => freeze = $h\u200D_a]], ["globalThis", [($h\u200D_a) => globalThis2 = $h\u200D_a]], ["is", [($h\u200D_a) => is = $h\u200D_a]], ["weakmapGet", [($h\u200D_a) => weakmapGet = $h\u200D_a]], ["weakmapSet", [($h\u200D_a) => weakmapSet = $h\u200D_a]]]], ["./stringify-utils.js", [["an", [($h\u200D_a) => an = $h\u200D_a]], ["bestEffortStringify", [($h\u200D_a) => bestEffortStringify = $h\u200D_a]]]], ["./types.js", []], ["./internal-types.js", []]]);
  const declassifiers = new WeakMap2(), quote = (payload, spaces) => {
    const result = freeze({ toString: freeze(() => bestEffortStringify(payload, spaces)) });
    return declassifiers.set(result, payload), result;
  };
  freeze(quote);
  const hiddenDetailsMap = new WeakMap2(), getMessageString = ({ template, args }) => {
    const parts = [template[0]];
    for (let i = 0; i < args.length; i += 1) {
      const arg = args[i];
      let argStr;
      argStr = declassifiers.has(arg) ? "" + arg : arg instanceof Error2 ? `(${an(arg.name)})` : `(${an(typeof arg)})`, parts.push(argStr, template[i + 1]);
    }
    return parts.join("");
  }, DetailsTokenProto = freeze({ toString() {
    const hiddenDetails = hiddenDetailsMap.get(this);
    return hiddenDetails === void 0 ? "[Not a DetailsToken]" : getMessageString(hiddenDetails);
  } });
  freeze(DetailsTokenProto.toString);
  const redactedDetails = (template, ...args) => {
    const detailsToken = freeze({ __proto__: DetailsTokenProto });
    return hiddenDetailsMap.set(detailsToken, { template, args }), detailsToken;
  };
  freeze(redactedDetails);
  const unredactedDetails = (template, ...args) => (args = args.map((arg) => declassifiers.has(arg) ? arg : quote(arg)), redactedDetails(template, ...args));
  $h\u200D_once.unredactedDetails(unredactedDetails), freeze(unredactedDetails);
  const getLogArgs = ({ template, args }) => {
    const logArgs = [template[0]];
    for (let i = 0; i < args.length; i += 1) {
      let arg = args[i];
      declassifiers.has(arg) && (arg = declassifiers.get(arg));
      const priorWithoutSpace = (logArgs.pop() || "").replace(/ $/, "");
      priorWithoutSpace !== "" && logArgs.push(priorWithoutSpace);
      const nextWithoutSpace = template[i + 1].replace(/^ /, "");
      logArgs.push(arg, nextWithoutSpace);
    }
    return logArgs[logArgs.length - 1] === "" && logArgs.pop(), logArgs;
  }, hiddenMessageLogArgs = new WeakMap2();
  let errorTagNum = 0;
  const errorTags = new WeakMap2(), tagError = (err, optErrorName = err.name) => {
    let errorTag = weakmapGet(errorTags, err);
    return errorTag !== void 0 || (errorTagNum += 1, errorTag = `${optErrorName}#${errorTagNum}`, weakmapSet(errorTags, err, errorTag)), errorTag;
  }, makeError = (optDetails = redactedDetails`Assert failed`, ErrorConstructor = Error2, { errorName } = {}) => {
    typeof optDetails == "string" && (optDetails = redactedDetails([optDetails]));
    const hiddenDetails = hiddenDetailsMap.get(optDetails);
    if (hiddenDetails === void 0)
      throw new Error2("unrecognized details " + quote(optDetails));
    const error = new ErrorConstructor(getMessageString(hiddenDetails));
    return hiddenMessageLogArgs.set(error, getLogArgs(hiddenDetails)), errorName !== void 0 && tagError(error, errorName), error;
  };
  freeze(makeError);
  const hiddenNoteLogArgsArrays = new WeakMap2(), hiddenNoteCallbackArrays = new WeakMap2(), note = (error, detailsNote) => {
    typeof detailsNote == "string" && (detailsNote = redactedDetails([detailsNote]));
    const hiddenDetails = hiddenDetailsMap.get(detailsNote);
    if (hiddenDetails === void 0)
      throw new Error2("unrecognized details " + quote(detailsNote));
    const logArgs = getLogArgs(hiddenDetails), callbacks = hiddenNoteCallbackArrays.get(error);
    if (callbacks !== void 0)
      for (const callback of callbacks)
        callback(error, logArgs);
    else {
      const logArgsArray = hiddenNoteLogArgsArrays.get(error);
      logArgsArray !== void 0 ? logArgsArray.push(logArgs) : hiddenNoteLogArgsArrays.set(error, [logArgs]);
    }
  };
  freeze(note);
  const loggedErrorHandler = { getStackString: globalThis2.getStackString || ((error) => {
    if (!("stack" in error))
      return "";
    const stackString = "" + error.stack, pos = stackString.indexOf("\n");
    return stackString.startsWith(" ") || pos === -1 ? stackString : stackString.slice(pos + 1);
  }), tagError: (error) => tagError(error), resetErrorTagNum: () => {
    errorTagNum = 0;
  }, getMessageLogArgs: (error) => hiddenMessageLogArgs.get(error), takeMessageLogArgs: (error) => {
    const result = hiddenMessageLogArgs.get(error);
    return hiddenMessageLogArgs.delete(error), result;
  }, takeNoteLogArgsArray: (error, callback) => {
    const result = hiddenNoteLogArgsArrays.get(error);
    if (hiddenNoteLogArgsArrays.delete(error), callback !== void 0) {
      const callbacks = hiddenNoteCallbackArrays.get(error);
      callbacks ? callbacks.push(callback) : hiddenNoteCallbackArrays.set(error, [callback]);
    }
    return result || [];
  } };
  $h\u200D_once.loggedErrorHandler(loggedErrorHandler), freeze(loggedErrorHandler);
  const makeAssert = (optRaise, unredacted = false) => {
    const details = unredacted ? unredactedDetails : redactedDetails, fail = (optDetails = details`Assert failed`, ErrorConstructor = Error2) => {
      const reason = makeError(optDetails, ErrorConstructor);
      throw optRaise !== void 0 && optRaise(reason), reason;
    };
    function baseAssert(flag, optDetails = details`Check failed`, ErrorConstructor = Error2) {
      if (!flag)
        throw fail(optDetails, ErrorConstructor);
    }
    freeze(fail);
    const equal = (actual, expected, optDetails = details`Expected ${actual} is same as ${expected}`, ErrorConstructor = RangeError2) => {
      baseAssert(is(actual, expected), optDetails, ErrorConstructor);
    };
    freeze(equal);
    const assertTypeof = (specimen, typename, optDetails) => {
      baseAssert(typeof typename == "string", details`${quote(typename)} must be a string`), optDetails === void 0 && (optDetails = details(["", " must be " + an(typename)], specimen)), equal(typeof specimen, typename, optDetails, TypeError2);
    };
    freeze(assertTypeof);
    const assert2 = assign(baseAssert, { error: makeError, fail, equal, typeof: assertTypeof, string: (specimen, optDetails) => assertTypeof(specimen, "string", optDetails), note, details, quote, makeAssert });
    return freeze(assert2);
  };
  $h\u200D_once.makeAssert(makeAssert), freeze(makeAssert);
  const assert = makeAssert();
  $h\u200D_once.assert(assert);
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  let FERAL_FUNCTION, arrayJoin;
  $h\u200D_imports([["./commons.js", [["FERAL_FUNCTION", [($h\u200D_a) => FERAL_FUNCTION = $h\u200D_a]], ["arrayJoin", [($h\u200D_a) => arrayJoin = $h\u200D_a]]]]]);
  $h\u200D_once.makeEvaluateFactory((constants = []) => {
    const optimizer = function(constants2) {
      return constants2.length === 0 ? "" : `const {${arrayJoin(constants2, ",")}} = this;`;
    }(constants);
    return FERAL_FUNCTION(`
    with (this) {
      ${optimizer}
      return function() {
        'use strict';
        return eval(arguments[0]);
      };
    }
  `);
  });
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  let arrayIncludes, getOwnPropertyDescriptor, getOwnPropertyNames, objectHasOwnProperty, regexpTest;
  $h\u200D_imports([["./commons.js", [["arrayIncludes", [($h\u200D_a) => arrayIncludes = $h\u200D_a]], ["getOwnPropertyDescriptor", [($h\u200D_a) => getOwnPropertyDescriptor = $h\u200D_a]], ["getOwnPropertyNames", [($h\u200D_a) => getOwnPropertyNames = $h\u200D_a]], ["objectHasOwnProperty", [($h\u200D_a) => objectHasOwnProperty = $h\u200D_a]], ["regexpTest", [($h\u200D_a) => regexpTest = $h\u200D_a]]]]]);
  const keywords = ["await", "break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete", "do", "else", "export", "extends", "finally", "for", "function", "if", "import", "in", "instanceof", "new", "return", "super", "switch", "this", "throw", "try", "typeof", "var", "void", "while", "with", "yield", "let", "static", "enum", "implements", "package", "protected", "interface", "private", "public", "await", "null", "true", "false", "this", "arguments"], identifierPattern = /^[a-zA-Z_$][\w$]*$/, isValidIdentifierName = (name) => name !== "eval" && !arrayIncludes(keywords, name) && regexpTest(identifierPattern, name);
  function isImmutableDataProperty(obj, name) {
    const desc = getOwnPropertyDescriptor(obj, name);
    return desc.configurable === false && desc.writable === false && objectHasOwnProperty(desc, "value");
  }
  $h\u200D_once.isValidIdentifierName(isValidIdentifierName);
  $h\u200D_once.getScopeConstants((globalObject, localObject = {}) => {
    const globalNames = getOwnPropertyNames(globalObject), localNames = getOwnPropertyNames(localObject), localConstants = localNames.filter((name) => isValidIdentifierName(name) && isImmutableDataProperty(localObject, name));
    return [...globalNames.filter((name) => !localNames.includes(name) && isValidIdentifierName(name) && isImmutableDataProperty(globalObject, name)), ...localConstants];
  });
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  let Error2, FERAL_EVAL, Proxy2, String2, freeze, getOwnPropertyDescriptor, globalThis2, immutableObject, objectHasOwnProperty, reflectGet, reflectSet, assert;
  $h\u200D_imports([["./commons.js", [["Error", [($h\u200D_a) => Error2 = $h\u200D_a]], ["FERAL_EVAL", [($h\u200D_a) => FERAL_EVAL = $h\u200D_a]], ["Proxy", [($h\u200D_a) => Proxy2 = $h\u200D_a]], ["String", [($h\u200D_a) => String2 = $h\u200D_a]], ["freeze", [($h\u200D_a) => freeze = $h\u200D_a]], ["getOwnPropertyDescriptor", [($h\u200D_a) => getOwnPropertyDescriptor = $h\u200D_a]], ["globalThis", [($h\u200D_a) => globalThis2 = $h\u200D_a]], ["immutableObject", [($h\u200D_a) => immutableObject = $h\u200D_a]], ["objectHasOwnProperty", [($h\u200D_a) => objectHasOwnProperty = $h\u200D_a]], ["reflectGet", [($h\u200D_a) => reflectGet = $h\u200D_a]], ["reflectSet", [($h\u200D_a) => reflectSet = $h\u200D_a]]]], ["./error/assert.js", [["assert", [($h\u200D_a) => assert = $h\u200D_a]]]]]);
  const { details: d, quote: q } = assert, alwaysThrowHandler = new Proxy2(immutableObject, { get(_shadow, prop) {
    assert.fail(d`Please report unexpected scope handler trap: ${q(String2(prop))}`);
  } });
  $h\u200D_once.createScopeHandler((globalObject, localObject = {}, { sloppyGlobalsMode = false } = {}) => {
    let allowNextEvalToBeUnsafe = false;
    return { admitOneUnsafeEvalNext: () => {
      allowNextEvalToBeUnsafe = true;
    }, resetOneUnsafeEvalNext: () => {
      const wasSet = allowNextEvalToBeUnsafe;
      return allowNextEvalToBeUnsafe = false, wasSet;
    }, scopeHandler: freeze({ __proto__: alwaysThrowHandler, get(_shadow, prop) {
      if (typeof prop != "symbol")
        return prop === "eval" && allowNextEvalToBeUnsafe === true ? (allowNextEvalToBeUnsafe = false, FERAL_EVAL) : prop in localObject ? reflectGet(localObject, prop, globalObject) : reflectGet(globalObject, prop);
    }, set(_shadow, prop, value) {
      if (prop in localObject) {
        const desc = getOwnPropertyDescriptor(localObject, prop);
        return objectHasOwnProperty(desc, "value") ? reflectSet(localObject, prop, value) : reflectSet(localObject, prop, value, globalObject);
      }
      return reflectSet(globalObject, prop, value);
    }, has: (_shadow, prop) => sloppyGlobalsMode || prop === "eval" || prop in localObject || prop in globalObject || prop in globalThis2, getPrototypeOf: () => null, getOwnPropertyDescriptor(_target, prop) {
      const quotedProp = q(String2(prop));
      console.warn("getOwnPropertyDescriptor trap on scopeHandler for " + quotedProp, new Error2().stack);
    } }) };
  });
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  let RegExp;
  $h\u200D_imports([["./commons.js", [["RegExp", [($h\u200D_a) => RegExp = $h\u200D_a]]]]]);
  const sourceMetaEntriesRegExp = new RegExp("(?:\\s*//\\s*[@#]\\s*([a-zA-Z][a-zA-Z0-9]*)\\s*=\\s*([^\\s\\*]*)|/\\*\\s*[@#]\\s*([a-zA-Z][a-zA-Z0-9]*)\\s*=\\s*([^\\s\\*]*)\\s*\\*/)\\s*$");
  $h\u200D_once.getSourceURL((src) => {
    let sourceURL = "<unknown>";
    for (; src.length > 0; ) {
      const match = sourceMetaEntriesRegExp.exec(src);
      if (match === null)
        break;
      src = src.slice(0, src.length - match[0].length), match[3] === "sourceURL" ? sourceURL = match[4] : match[1] === "sourceURL" && (sourceURL = match[2]);
    }
    return sourceURL;
  });
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  let RegExp, SyntaxError2, stringSearch, stringSlice, stringSplit, getSourceURL;
  function getLineNumber(src, pattern) {
    const index = stringSearch(src, pattern);
    if (index < 0)
      return -1;
    const adjustment = src[index] === "\n" ? 1 : 0;
    return stringSplit(stringSlice(src, 0, index), "\n").length + adjustment;
  }
  $h\u200D_imports([["./commons.js", [["RegExp", [($h\u200D_a) => RegExp = $h\u200D_a]], ["SyntaxError", [($h\u200D_a) => SyntaxError2 = $h\u200D_a]], ["stringSearch", [($h\u200D_a) => stringSearch = $h\u200D_a]], ["stringSlice", [($h\u200D_a) => stringSlice = $h\u200D_a]], ["stringSplit", [($h\u200D_a) => stringSplit = $h\u200D_a]]]], ["./get-source-url.js", [["getSourceURL", [($h\u200D_a) => getSourceURL = $h\u200D_a]]]]]);
  const htmlCommentPattern = new RegExp("(?:<!--|-->)", "g"), rejectHtmlComments = (src) => {
    const lineNumber = getLineNumber(src, htmlCommentPattern);
    if (lineNumber < 0 || true)
      return src;
    const name = getSourceURL(src);
    throw new SyntaxError2(`Possible HTML comment rejected at ${name}:${lineNumber}. (SES_HTML_COMMENT_REJECTED)`);
  };
  $h\u200D_once.rejectHtmlComments(rejectHtmlComments);
  $h\u200D_once.evadeHtmlCommentTest((src) => src.replace(htmlCommentPattern, (match) => match[0] === "<" ? "< ! --" : "-- >"));
  const importPattern = new RegExp("(^|[^.])\\bimport(\\s*(?:\\(|/[/*]))", "g"), rejectImportExpressions = (src) => {
    const lineNumber = getLineNumber(src, importPattern);
    if (lineNumber < 0)
      return src;
    const name = getSourceURL(src);
    throw new SyntaxError2(`Possible import expression rejected at ${name}:${lineNumber}. (SES_IMPORT_REJECTED)`);
  };
  $h\u200D_once.rejectImportExpressions(rejectImportExpressions);
  $h\u200D_once.evadeImportExpressionTest((src) => src.replace(importPattern, (_, p1, p2) => `${p1}__import__${p2}`));
  const someDirectEvalPattern = new RegExp("(^|[^.])\\beval(\\s*\\()", "g");
  $h\u200D_once.rejectSomeDirectEvalExpressions((src) => {
    const lineNumber = getLineNumber(src, someDirectEvalPattern);
    if (lineNumber < 0)
      return src;
    const name = getSourceURL(src);
    throw new SyntaxError2(`Possible direct eval expression rejected at ${name}:${lineNumber}. (SES_EVAL_REJECTED)`);
  });
  $h\u200D_once.mandatoryTransforms((source) => (source = rejectHtmlComments(source), source = rejectImportExpressions(source)));
  $h\u200D_once.applyTransforms((source, transforms) => {
    for (const transform of transforms)
      source = transform(source);
    return source;
  });
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  let WeakSet2, apply, immutableObject, proxyRevocable, weaksetAdd, getScopeConstants, createScopeHandler, applyTransforms, mandatoryTransforms, makeEvaluateFactory, assert;
  $h\u200D_imports([["./commons.js", [["WeakSet", [($h\u200D_a) => WeakSet2 = $h\u200D_a]], ["apply", [($h\u200D_a) => apply = $h\u200D_a]], ["immutableObject", [($h\u200D_a) => immutableObject = $h\u200D_a]], ["proxyRevocable", [($h\u200D_a) => proxyRevocable = $h\u200D_a]], ["weaksetAdd", [($h\u200D_a) => weaksetAdd = $h\u200D_a]]]], ["./scope-constants.js", [["getScopeConstants", [($h\u200D_a) => getScopeConstants = $h\u200D_a]]]], ["./scope-handler.js", [["createScopeHandler", [($h\u200D_a) => createScopeHandler = $h\u200D_a]]]], ["./transforms.js", [["applyTransforms", [($h\u200D_a) => applyTransforms = $h\u200D_a]], ["mandatoryTransforms", [($h\u200D_a) => mandatoryTransforms = $h\u200D_a]]]], ["./make-evaluate-factory.js", [["makeEvaluateFactory", [($h\u200D_a) => makeEvaluateFactory = $h\u200D_a]]]], ["./error/assert.js", [["assert", [($h\u200D_a) => assert = $h\u200D_a]]]]]);
  const { details: d } = assert;
  $h\u200D_once.performEval((source, globalObject, localObject = {}, { localTransforms = [], globalTransforms = [], sloppyGlobalsMode = false, knownScopeProxies = new WeakSet2() } = {}) => {
    source = applyTransforms(source, [...localTransforms, ...globalTransforms, mandatoryTransforms]);
    const { scopeHandler, admitOneUnsafeEvalNext, resetOneUnsafeEvalNext } = createScopeHandler(globalObject, localObject, { sloppyGlobalsMode }), scopeProxyRevocable = proxyRevocable(immutableObject, scopeHandler), constants = getScopeConstants(globalObject, localObject), evaluateFactory = makeEvaluateFactory(constants), evaluate = apply(evaluateFactory, scopeProxyRevocable.proxy, []);
    let err;
    admitOneUnsafeEvalNext();
    try {
      return weaksetAdd(knownScopeProxies, scopeProxyRevocable.proxy), apply(evaluate, globalObject, [source]);
    } catch (e) {
      throw err = e, e;
    } finally {
      resetOneUnsafeEvalNext() && (scopeProxyRevocable.revoke(), assert.fail(d`handler did not reset allowNextEvalToBeUnsafe ${err}`));
    }
  });
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  let performEval;
  $h\u200D_imports([["./evaluate.js", [["performEval", [($h\u200D_a) => performEval = $h\u200D_a]]]]]);
  $h\u200D_once.makeEvalFunction((globalObject, options = {}) => (source) => typeof source != "string" ? source : performEval(source, globalObject, {}, options));
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  let FERAL_FUNCTION, arrayJoin, arrayPop, defineProperties, getPrototypeOf, performEval, assert;
  $h\u200D_imports([["./commons.js", [["FERAL_FUNCTION", [($h\u200D_a) => FERAL_FUNCTION = $h\u200D_a]], ["arrayJoin", [($h\u200D_a) => arrayJoin = $h\u200D_a]], ["arrayPop", [($h\u200D_a) => arrayPop = $h\u200D_a]], ["defineProperties", [($h\u200D_a) => defineProperties = $h\u200D_a]], ["getPrototypeOf", [($h\u200D_a) => getPrototypeOf = $h\u200D_a]]]], ["./evaluate.js", [["performEval", [($h\u200D_a) => performEval = $h\u200D_a]]]], ["./error/assert.js", [["assert", [($h\u200D_a) => assert = $h\u200D_a]]]]]);
  $h\u200D_once.makeFunctionConstructor((globaObject, options = {}) => {
    const newFunction = function(_body) {
      const bodyText = "" + (arrayPop(arguments) || ""), parameters = "" + arrayJoin(arguments, ",");
      new FERAL_FUNCTION(parameters, ""), new FERAL_FUNCTION(bodyText);
      const src = `(function anonymous(${parameters}
) {
${bodyText}
})`;
      return performEval(src, globaObject, {}, options);
    };
    return defineProperties(newFunction, { prototype: { value: FERAL_FUNCTION.prototype, writable: false, enumerable: false, configurable: false } }), assert(getPrototypeOf(FERAL_FUNCTION) === FERAL_FUNCTION.prototype, "Function prototype is the same accross compartments"), assert(getPrototypeOf(newFunction) === FERAL_FUNCTION.prototype, "Function constructor prototype is the same accross compartments"), newFunction;
  });
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  $h\u200D_imports([]);
  const constantProperties = { Infinity: 1 / 0, NaN: NaN, undefined: void 0 };
  $h\u200D_once.constantProperties(constantProperties);
  $h\u200D_once.universalPropertyNames({ isFinite: "isFinite", isNaN: "isNaN", parseFloat: "parseFloat", parseInt: "parseInt", decodeURI: "decodeURI", decodeURIComponent: "decodeURIComponent", encodeURI: "encodeURI", encodeURIComponent: "encodeURIComponent", Array: "Array", ArrayBuffer: "ArrayBuffer", BigInt: "BigInt", BigInt64Array: "BigInt64Array", BigUint64Array: "BigUint64Array", Boolean: "Boolean", DataView: "DataView", EvalError: "EvalError", Float32Array: "Float32Array", Float64Array: "Float64Array", Int8Array: "Int8Array", Int16Array: "Int16Array", Int32Array: "Int32Array", Map: "Map", Number: "Number", Object: "Object", Promise: "Promise", Proxy: "Proxy", RangeError: "RangeError", ReferenceError: "ReferenceError", Set: "Set", String: "String", Symbol: "Symbol", SyntaxError: "SyntaxError", TypeError: "TypeError", Uint8Array: "Uint8Array", Uint8ClampedArray: "Uint8ClampedArray", Uint16Array: "Uint16Array", Uint32Array: "Uint32Array", URIError: "URIError", WeakMap: "WeakMap", WeakSet: "WeakSet", JSON: "JSON", Reflect: "Reflect", escape: "escape", unescape: "unescape", lockdown: "lockdown", harden: "harden", HandledPromise: "HandledPromise" });
  $h\u200D_once.initialGlobalPropertyNames({ Date: "%InitialDate%", Error: "%InitialError%", RegExp: "%InitialRegExp%", Math: "%InitialMath%", getStackString: "%InitialGetStackString%" });
  $h\u200D_once.sharedGlobalPropertyNames({ Date: "%SharedDate%", Error: "%SharedError%", RegExp: "%SharedRegExp%", Math: "%SharedMath%" });
  $h\u200D_once.uniqueGlobalPropertyNames({ globalThis: "%UniqueGlobalThis%", eval: "%UniqueEval%", Function: "%UniqueFunction%", Compartment: "%UniqueCompartment%" });
  const NativeErrors = [EvalError, RangeError, ReferenceError, SyntaxError, TypeError, URIError];
  $h\u200D_once.NativeErrors(NativeErrors);
  const FunctionInstance = { "[[Proto]]": "%FunctionPrototype%", length: "number", name: "string" };
  $h\u200D_once.FunctionInstance(FunctionInstance);
  const fn = FunctionInstance, asyncFn = { "[[Proto]]": "%AsyncFunctionPrototype%" }, getter = { get: fn, set: "undefined" }, accessor = { get: fn, set: fn };
  function NativeError(prototype) {
    return { "[[Proto]]": "%SharedError%", prototype };
  }
  function NativeErrorPrototype(constructor) {
    return { "[[Proto]]": "%ErrorPrototype%", constructor, message: "string", name: "string", toString: false };
  }
  function TypedArray(prototype) {
    return { "[[Proto]]": "%TypedArray%", BYTES_PER_ELEMENT: "number", prototype };
  }
  function TypedArrayPrototype(constructor) {
    return { "[[Proto]]": "%TypedArrayPrototype%", BYTES_PER_ELEMENT: "number", constructor };
  }
  $h\u200D_once.isAccessorPermit((permit) => permit === getter || permit === accessor);
  const SharedMath = { E: "number", LN10: "number", LN2: "number", LOG10E: "number", LOG2E: "number", PI: "number", SQRT1_2: "number", SQRT2: "number", "@@toStringTag": "string", abs: fn, acos: fn, acosh: fn, asin: fn, asinh: fn, atan: fn, atanh: fn, atan2: fn, cbrt: fn, ceil: fn, clz32: fn, cos: fn, cosh: fn, exp: fn, expm1: fn, floor: fn, fround: fn, hypot: fn, imul: fn, log: fn, log1p: fn, log10: fn, log2: fn, max: fn, min: fn, pow: fn, round: fn, sign: fn, sin: fn, sinh: fn, sqrt: fn, tan: fn, tanh: fn, trunc: fn, idiv: false, idivmod: false, imod: false, imuldiv: false, irem: false, mod: false }, whitelist = { "[[Proto]]": null, "%ThrowTypeError%": fn, Infinity: "number", NaN: "number", undefined: "undefined", "%UniqueEval%": fn, isFinite: fn, isNaN: fn, parseFloat: fn, parseInt: fn, decodeURI: fn, decodeURIComponent: fn, encodeURI: fn, encodeURIComponent: fn, Object: { "[[Proto]]": "%FunctionPrototype%", assign: fn, create: fn, defineProperties: fn, defineProperty: fn, entries: fn, freeze: fn, fromEntries: fn, getOwnPropertyDescriptor: fn, getOwnPropertyDescriptors: fn, getOwnPropertyNames: fn, getOwnPropertySymbols: fn, getPrototypeOf: fn, is: fn, isExtensible: fn, isFrozen: fn, isSealed: fn, keys: fn, preventExtensions: fn, prototype: "%ObjectPrototype%", seal: fn, setPrototypeOf: fn, values: fn }, "%ObjectPrototype%": { "[[Proto]]": null, constructor: "Object", hasOwnProperty: fn, isPrototypeOf: fn, propertyIsEnumerable: fn, toLocaleString: fn, toString: fn, valueOf: fn, "--proto--": accessor, __defineGetter__: fn, __defineSetter__: fn, __lookupGetter__: fn, __lookupSetter__: fn }, "%UniqueFunction%": { "[[Proto]]": "%FunctionPrototype%", prototype: "%FunctionPrototype%" }, "%InertFunction%": { "[[Proto]]": "%FunctionPrototype%", prototype: "%FunctionPrototype%" }, "%FunctionPrototype%": { apply: fn, bind: fn, call: fn, constructor: "%InertFunction%", toString: fn, "@@hasInstance": fn, caller: false, arguments: false }, Boolean: { "[[Proto]]": "%FunctionPrototype%", prototype: "%BooleanPrototype%" }, "%BooleanPrototype%": { constructor: "Boolean", toString: fn, valueOf: fn }, Symbol: { "[[Proto]]": "%FunctionPrototype%", asyncIterator: "symbol", for: fn, hasInstance: "symbol", isConcatSpreadable: "symbol", iterator: "symbol", keyFor: fn, match: "symbol", matchAll: "symbol", prototype: "%SymbolPrototype%", replace: "symbol", search: "symbol", species: "symbol", split: "symbol", toPrimitive: "symbol", toStringTag: "symbol", unscopables: "symbol" }, "%SymbolPrototype%": { constructor: "Symbol", description: getter, toString: fn, valueOf: fn, "@@toPrimitive": fn, "@@toStringTag": "string" }, "%InitialError%": { "[[Proto]]": "%FunctionPrototype%", prototype: "%ErrorPrototype%", captureStackTrace: fn, stackTraceLimit: accessor, prepareStackTrace: accessor }, "%SharedError%": { "[[Proto]]": "%FunctionPrototype%", prototype: "%ErrorPrototype%", captureStackTrace: fn, stackTraceLimit: accessor, prepareStackTrace: accessor }, "%ErrorPrototype%": { constructor: "%SharedError%", message: "string", name: "string", toString: fn, at: false, stack: false }, EvalError: NativeError("%EvalErrorPrototype%"), RangeError: NativeError("%RangeErrorPrototype%"), ReferenceError: NativeError("%ReferenceErrorPrototype%"), SyntaxError: NativeError("%SyntaxErrorPrototype%"), TypeError: NativeError("%TypeErrorPrototype%"), URIError: NativeError("%URIErrorPrototype%"), "%EvalErrorPrototype%": NativeErrorPrototype("EvalError"), "%RangeErrorPrototype%": NativeErrorPrototype("RangeError"), "%ReferenceErrorPrototype%": NativeErrorPrototype("ReferenceError"), "%SyntaxErrorPrototype%": NativeErrorPrototype("SyntaxError"), "%TypeErrorPrototype%": NativeErrorPrototype("TypeError"), "%URIErrorPrototype%": NativeErrorPrototype("URIError"), Number: { "[[Proto]]": "%FunctionPrototype%", EPSILON: "number", isFinite: fn, isInteger: fn, isNaN: fn, isSafeInteger: fn, MAX_SAFE_INTEGER: "number", MAX_VALUE: "number", MIN_SAFE_INTEGER: "number", MIN_VALUE: "number", NaN: "number", NEGATIVE_INFINITY: "number", parseFloat: fn, parseInt: fn, POSITIVE_INFINITY: "number", prototype: "%NumberPrototype%" }, "%NumberPrototype%": { constructor: "Number", toExponential: fn, toFixed: fn, toLocaleString: fn, toPrecision: fn, toString: fn, valueOf: fn }, BigInt: { "[[Proto]]": "%FunctionPrototype%", asIntN: fn, asUintN: fn, prototype: "%BigIntPrototype%", bitLength: false, fromArrayBuffer: false }, "%BigIntPrototype%": { constructor: "BigInt", toLocaleString: fn, toString: fn, valueOf: fn, "@@toStringTag": "string" }, "%InitialMath%": { ...SharedMath, random: fn }, "%SharedMath%": SharedMath, "%InitialDate%": { "[[Proto]]": "%FunctionPrototype%", now: fn, parse: fn, prototype: "%DatePrototype%", UTC: fn }, "%SharedDate%": { "[[Proto]]": "%FunctionPrototype%", now: fn, parse: fn, prototype: "%DatePrototype%", UTC: fn }, "%DatePrototype%": { constructor: "%SharedDate%", getDate: fn, getDay: fn, getFullYear: fn, getHours: fn, getMilliseconds: fn, getMinutes: fn, getMonth: fn, getSeconds: fn, getTime: fn, getTimezoneOffset: fn, getUTCDate: fn, getUTCDay: fn, getUTCFullYear: fn, getUTCHours: fn, getUTCMilliseconds: fn, getUTCMinutes: fn, getUTCMonth: fn, getUTCSeconds: fn, setDate: fn, setFullYear: fn, setHours: fn, setMilliseconds: fn, setMinutes: fn, setMonth: fn, setSeconds: fn, setTime: fn, setUTCDate: fn, setUTCFullYear: fn, setUTCHours: fn, setUTCMilliseconds: fn, setUTCMinutes: fn, setUTCMonth: fn, setUTCSeconds: fn, toDateString: fn, toISOString: fn, toJSON: fn, toLocaleDateString: fn, toLocaleString: fn, toLocaleTimeString: fn, toString: fn, toTimeString: fn, toUTCString: fn, valueOf: fn, "@@toPrimitive": fn, getYear: fn, setYear: fn, toGMTString: fn }, String: { "[[Proto]]": "%FunctionPrototype%", fromCharCode: fn, fromCodePoint: fn, prototype: "%StringPrototype%", raw: fn, fromArrayBuffer: false }, "%StringPrototype%": { length: "number", charAt: fn, charCodeAt: fn, codePointAt: fn, concat: fn, constructor: "String", endsWith: fn, includes: fn, indexOf: fn, lastIndexOf: fn, localeCompare: fn, match: fn, matchAll: fn, normalize: fn, padEnd: fn, padStart: fn, repeat: fn, replace: fn, replaceAll: fn, search: fn, slice: fn, split: fn, startsWith: fn, substring: fn, toLocaleLowerCase: fn, toLocaleUpperCase: fn, toLowerCase: fn, toString: fn, toUpperCase: fn, trim: fn, trimEnd: fn, trimStart: fn, valueOf: fn, "@@iterator": fn, substr: fn, anchor: fn, big: fn, blink: fn, bold: fn, fixed: fn, fontcolor: fn, fontsize: fn, italics: fn, link: fn, small: fn, strike: fn, sub: fn, sup: fn, trimLeft: fn, trimRight: fn, compare: false, at: fn }, "%StringIteratorPrototype%": { "[[Proto]]": "%IteratorPrototype%", next: fn, "@@toStringTag": "string" }, "%InitialRegExp%": { "[[Proto]]": "%FunctionPrototype%", prototype: "%RegExpPrototype%", "@@species": getter, input: false, $_: false, lastMatch: false, "$&": false, lastParen: false, "$+": false, leftContext: false, "$`": false, rightContext: false, "$'": false, $1: false, $2: false, $3: false, $4: false, $5: false, $6: false, $7: false, $8: false, $9: false }, "%SharedRegExp%": { "[[Proto]]": "%FunctionPrototype%", prototype: "%RegExpPrototype%", "@@species": getter }, "%RegExpPrototype%": { constructor: "%SharedRegExp%", exec: fn, dotAll: getter, flags: getter, global: getter, ignoreCase: getter, "@@match": fn, "@@matchAll": fn, multiline: getter, "@@replace": fn, "@@search": fn, source: getter, "@@split": fn, sticky: getter, test: fn, toString: fn, unicode: getter, compile: false, hasIndices: false }, "%RegExpStringIteratorPrototype%": { "[[Proto]]": "%IteratorPrototype%", next: fn, "@@toStringTag": "string" }, Array: { "[[Proto]]": "%FunctionPrototype%", from: fn, isArray: fn, of: fn, prototype: "%ArrayPrototype%", "@@species": getter, at: fn }, "%ArrayPrototype%": { length: "number", concat: fn, constructor: "Array", copyWithin: fn, entries: fn, every: fn, fill: fn, filter: fn, find: fn, findIndex: fn, flat: fn, flatMap: fn, forEach: fn, includes: fn, indexOf: fn, join: fn, keys: fn, lastIndexOf: fn, map: fn, pop: fn, push: fn, reduce: fn, reduceRight: fn, reverse: fn, shift: fn, slice: fn, some: fn, sort: fn, splice: fn, toLocaleString: fn, toString: fn, unshift: fn, values: fn, "@@iterator": fn, "@@unscopables": { "[[Proto]]": null, copyWithin: "boolean", entries: "boolean", fill: "boolean", find: "boolean", findIndex: "boolean", flat: "boolean", flatMap: "boolean", includes: "boolean", keys: "boolean", values: "boolean", at: false }, at: false }, "%ArrayIteratorPrototype%": { "[[Proto]]": "%IteratorPrototype%", next: fn, "@@toStringTag": "string" }, "%TypedArray%": { "[[Proto]]": "%FunctionPrototype%", from: fn, of: fn, prototype: "%TypedArrayPrototype%", "@@species": getter }, "%TypedArrayPrototype%": { buffer: getter, byteLength: getter, byteOffset: getter, constructor: "%TypedArray%", copyWithin: fn, entries: fn, every: fn, fill: fn, filter: fn, find: fn, findIndex: fn, forEach: fn, includes: fn, indexOf: fn, join: fn, keys: fn, lastIndexOf: fn, length: getter, map: fn, reduce: fn, reduceRight: fn, reverse: fn, set: fn, slice: fn, some: fn, sort: fn, subarray: fn, toLocaleString: fn, toString: fn, values: fn, "@@iterator": fn, "@@toStringTag": getter, at: false }, BigInt64Array: TypedArray("%BigInt64ArrayPrototype%"), BigUint64Array: TypedArray("%BigUint64ArrayPrototype%"), Float32Array: TypedArray("%Float32ArrayPrototype%"), Float64Array: TypedArray("%Float64ArrayPrototype%"), Int16Array: TypedArray("%Int16ArrayPrototype%"), Int32Array: TypedArray("%Int32ArrayPrototype%"), Int8Array: TypedArray("%Int8ArrayPrototype%"), Uint16Array: TypedArray("%Uint16ArrayPrototype%"), Uint32Array: TypedArray("%Uint32ArrayPrototype%"), Uint8Array: TypedArray("%Uint8ArrayPrototype%"), Uint8ClampedArray: TypedArray("%Uint8ClampedArrayPrototype%"), "%BigInt64ArrayPrototype%": TypedArrayPrototype("BigInt64Array"), "%BigUint64ArrayPrototype%": TypedArrayPrototype("BigUint64Array"), "%Float32ArrayPrototype%": TypedArrayPrototype("Float32Array"), "%Float64ArrayPrototype%": TypedArrayPrototype("Float64Array"), "%Int16ArrayPrototype%": TypedArrayPrototype("Int16Array"), "%Int32ArrayPrototype%": TypedArrayPrototype("Int32Array"), "%Int8ArrayPrototype%": TypedArrayPrototype("Int8Array"), "%Uint16ArrayPrototype%": TypedArrayPrototype("Uint16Array"), "%Uint32ArrayPrototype%": TypedArrayPrototype("Uint32Array"), "%Uint8ArrayPrototype%": TypedArrayPrototype("Uint8Array"), "%Uint8ClampedArrayPrototype%": TypedArrayPrototype("Uint8ClampedArray"), Map: { "[[Proto]]": "%FunctionPrototype%", "@@species": getter, prototype: "%MapPrototype%" }, "%MapPrototype%": { clear: fn, constructor: "Map", delete: fn, entries: fn, forEach: fn, get: fn, has: fn, keys: fn, set: fn, size: getter, values: fn, "@@iterator": fn, "@@toStringTag": "string" }, "%MapIteratorPrototype%": { "[[Proto]]": "%IteratorPrototype%", next: fn, "@@toStringTag": "string" }, Set: { "[[Proto]]": "%FunctionPrototype%", prototype: "%SetPrototype%", "@@species": getter }, "%SetPrototype%": { add: fn, clear: fn, constructor: "Set", delete: fn, entries: fn, forEach: fn, has: fn, keys: fn, size: getter, values: fn, "@@iterator": fn, "@@toStringTag": "string" }, "%SetIteratorPrototype%": { "[[Proto]]": "%IteratorPrototype%", next: fn, "@@toStringTag": "string" }, WeakMap: { "[[Proto]]": "%FunctionPrototype%", prototype: "%WeakMapPrototype%" }, "%WeakMapPrototype%": { constructor: "WeakMap", delete: fn, get: fn, has: fn, set: fn, "@@toStringTag": "string" }, WeakSet: { "[[Proto]]": "%FunctionPrototype%", prototype: "%WeakSetPrototype%" }, "%WeakSetPrototype%": { add: fn, constructor: "WeakSet", delete: fn, has: fn, "@@toStringTag": "string" }, ArrayBuffer: { "[[Proto]]": "%FunctionPrototype%", isView: fn, prototype: "%ArrayBufferPrototype%", "@@species": getter, fromString: false, fromBigInt: false }, "%ArrayBufferPrototype%": { byteLength: getter, constructor: "ArrayBuffer", slice: fn, "@@toStringTag": "string", concat: false }, SharedArrayBuffer: false, "%SharedArrayBufferPrototype%": false, DataView: { "[[Proto]]": "%FunctionPrototype%", BYTES_PER_ELEMENT: "number", prototype: "%DataViewPrototype%" }, "%DataViewPrototype%": { buffer: getter, byteLength: getter, byteOffset: getter, constructor: "DataView", getBigInt64: fn, getBigUint64: fn, getFloat32: fn, getFloat64: fn, getInt8: fn, getInt16: fn, getInt32: fn, getUint8: fn, getUint16: fn, getUint32: fn, setBigInt64: fn, setBigUint64: fn, setFloat32: fn, setFloat64: fn, setInt8: fn, setInt16: fn, setInt32: fn, setUint8: fn, setUint16: fn, setUint32: fn, "@@toStringTag": "string" }, Atomics: false, JSON: { parse: fn, stringify: fn, "@@toStringTag": "string" }, "%IteratorPrototype%": { "@@iterator": fn }, "%AsyncIteratorPrototype%": { "@@asyncIterator": fn }, "%InertGeneratorFunction%": { "[[Proto]]": "%InertFunction%", prototype: "%Generator%" }, "%Generator%": { "[[Proto]]": "%FunctionPrototype%", constructor: "%InertGeneratorFunction%", prototype: "%GeneratorPrototype%", "@@toStringTag": "string" }, "%InertAsyncGeneratorFunction%": { "[[Proto]]": "%InertFunction%", prototype: "%AsyncGenerator%" }, "%AsyncGenerator%": { "[[Proto]]": "%FunctionPrototype%", constructor: "%InertAsyncGeneratorFunction%", prototype: "%AsyncGeneratorPrototype%", "@@toStringTag": "string" }, "%GeneratorPrototype%": { "[[Proto]]": "%IteratorPrototype%", constructor: "%Generator%", next: fn, return: fn, throw: fn, "@@toStringTag": "string" }, "%AsyncGeneratorPrototype%": { "[[Proto]]": "%AsyncIteratorPrototype%", constructor: "%AsyncGenerator%", next: fn, return: fn, throw: fn, "@@toStringTag": "string" }, HandledPromise: { "[[Proto]]": "Promise", applyFunction: fn, applyFunctionSendOnly: fn, applyMethod: fn, applyMethodSendOnly: fn, get: fn, getSendOnly: fn, prototype: "%PromisePrototype%", resolve: fn }, Promise: { "[[Proto]]": "%FunctionPrototype%", all: fn, allSettled: fn, any: false, prototype: "%PromisePrototype%", race: fn, reject: fn, resolve: fn, "@@species": getter }, "%PromisePrototype%": { catch: fn, constructor: "Promise", finally: fn, then: fn, "@@toStringTag": "string" }, "%InertAsyncFunction%": { "[[Proto]]": "%InertFunction%", prototype: "%AsyncFunctionPrototype%" }, "%AsyncFunctionPrototype%": { "[[Proto]]": "%FunctionPrototype%", constructor: "%InertAsyncFunction%", "@@toStringTag": "string" }, Reflect: { apply: fn, construct: fn, defineProperty: fn, deleteProperty: fn, get: fn, getOwnPropertyDescriptor: fn, getPrototypeOf: fn, has: fn, isExtensible: fn, ownKeys: fn, preventExtensions: fn, set: fn, setPrototypeOf: fn, "@@toStringTag": "string" }, Proxy: { "[[Proto]]": "%FunctionPrototype%", revocable: fn }, escape: fn, unescape: fn, "%UniqueCompartment%": { "[[Proto]]": "%FunctionPrototype%", prototype: "%CompartmentPrototype%", toString: fn }, "%InertCompartment%": { "[[Proto]]": "%FunctionPrototype%", prototype: "%CompartmentPrototype%", toString: fn }, "%CompartmentPrototype%": { constructor: "%InertCompartment%", evaluate: fn, globalThis: getter, name: getter, toString: fn, __isKnownScopeProxy__: fn, import: asyncFn, load: asyncFn, importNow: fn, module: fn }, lockdown: fn, harden: fn, "%InitialGetStackString%": fn };
  $h\u200D_once.whitelist(whitelist);
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  let defineProperty, objectHasOwnProperty, entries6, makeEvalFunction, makeFunctionConstructor, constantProperties, universalPropertyNames;
  $h\u200D_imports([["./commons.js", [["defineProperty", [($h\u200D_a) => defineProperty = $h\u200D_a]], ["objectHasOwnProperty", [($h\u200D_a) => objectHasOwnProperty = $h\u200D_a]], ["entries", [($h\u200D_a) => entries6 = $h\u200D_a]]]], ["./make-eval-function.js", [["makeEvalFunction", [($h\u200D_a) => makeEvalFunction = $h\u200D_a]]]], ["./make-function-constructor.js", [["makeFunctionConstructor", [($h\u200D_a) => makeFunctionConstructor = $h\u200D_a]]]], ["./whitelist.js", [["constantProperties", [($h\u200D_a) => constantProperties = $h\u200D_a]], ["universalPropertyNames", [($h\u200D_a) => universalPropertyNames = $h\u200D_a]]]]]);
  $h\u200D_once.initGlobalObject((globalObject, intrinsics, newGlobalPropertyNames, makeCompartmentConstructor, compartmentPrototype, { globalTransforms, markVirtualizedNativeFunction }) => {
    for (const [name, constant] of entries6(constantProperties))
      defineProperty(globalObject, name, { value: constant, writable: false, enumerable: false, configurable: false });
    for (const [name, intrinsicName] of entries6(universalPropertyNames))
      objectHasOwnProperty(intrinsics, intrinsicName) && defineProperty(globalObject, name, { value: intrinsics[intrinsicName], writable: true, enumerable: false, configurable: true });
    for (const [name, intrinsicName] of entries6(newGlobalPropertyNames))
      objectHasOwnProperty(intrinsics, intrinsicName) && defineProperty(globalObject, name, { value: intrinsics[intrinsicName], writable: true, enumerable: false, configurable: true });
    const perCompartmentGlobals = { globalThis: globalObject, eval: makeEvalFunction(globalObject, { globalTransforms }), Function: makeFunctionConstructor(globalObject, { globalTransforms }) };
    perCompartmentGlobals.Compartment = makeCompartmentConstructor(makeCompartmentConstructor, intrinsics, markVirtualizedNativeFunction);
    for (const [name, value] of entries6(perCompartmentGlobals))
      defineProperty(globalObject, name, { value, writable: true, enumerable: false, configurable: true }), typeof value == "function" && markVirtualizedNativeFunction(value);
  });
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  let Promise2, TypeError2, ReferenceError2, create3, values5, freeze, assert;
  $h\u200D_imports([["./commons.js", [["Promise", [($h\u200D_a) => Promise2 = $h\u200D_a]], ["TypeError", [($h\u200D_a) => TypeError2 = $h\u200D_a]], ["ReferenceError", [($h\u200D_a) => ReferenceError2 = $h\u200D_a]], ["create", [($h\u200D_a) => create3 = $h\u200D_a]], ["values", [($h\u200D_a) => values5 = $h\u200D_a]], ["freeze", [($h\u200D_a) => freeze = $h\u200D_a]]]], ["./error/assert.js", [["assert", [($h\u200D_a) => assert = $h\u200D_a]]]]]);
  const { details: d, quote: q } = assert;
  $h\u200D_once.makeAlias((compartment, specifier) => freeze({ compartment, specifier }));
  const loadRecord = async (compartmentPrivateFields, moduleAliases, compartment, moduleSpecifier, staticModuleRecord) => {
    const { resolveHook, moduleRecords } = compartmentPrivateFields.get(compartment), resolvedImports = ((imports, resolveHook2, fullReferrerSpecifier) => {
      const resolvedImports2 = create3(null);
      for (const importSpecifier of imports) {
        const fullSpecifier = resolveHook2(importSpecifier, fullReferrerSpecifier);
        resolvedImports2[importSpecifier] = fullSpecifier;
      }
      return freeze(resolvedImports2);
    })(staticModuleRecord.imports, resolveHook, moduleSpecifier), moduleRecord = freeze({ compartment, staticModuleRecord, moduleSpecifier, resolvedImports });
    return moduleRecords.set(moduleSpecifier, moduleRecord), await Promise2.all(values5(resolvedImports).map((fullSpecifier) => load(compartmentPrivateFields, moduleAliases, compartment, fullSpecifier))), moduleRecord;
  }, load = async (compartmentPrivateFields, moduleAliases, compartment, moduleSpecifier) => (async (compartmentPrivateFields2, moduleAliases2, compartment2, moduleSpecifier2) => {
    const { importHook, moduleMap, moduleMapHook, moduleRecords } = compartmentPrivateFields2.get(compartment2);
    let aliasNamespace = moduleMap[moduleSpecifier2];
    if (aliasNamespace === void 0 && moduleMapHook !== void 0 && (aliasNamespace = moduleMapHook(moduleSpecifier2)), typeof aliasNamespace == "string")
      assert.fail(d`Cannot map module ${q(moduleSpecifier2)} to ${q(aliasNamespace)} in parent compartment, not yet implemented`, TypeError2);
    else if (aliasNamespace !== void 0) {
      const alias = moduleAliases2.get(aliasNamespace);
      alias === void 0 && assert.fail(d`Cannot map module ${q(moduleSpecifier2)} because the value is not a module exports namespace, or is from another realm`, ReferenceError2);
      const aliasRecord = await load(compartmentPrivateFields2, moduleAliases2, alias.compartment, alias.specifier);
      return moduleRecords.set(moduleSpecifier2, aliasRecord), aliasRecord;
    }
    if (moduleRecords.has(moduleSpecifier2))
      return moduleRecords.get(moduleSpecifier2);
    const staticModuleRecord = await importHook(moduleSpecifier2);
    if (staticModuleRecord !== null && typeof staticModuleRecord == "object" || assert.fail(d`importHook must return a promise for an object, for module ${q(moduleSpecifier2)} in compartment ${q(compartment2.name)}`), staticModuleRecord.record !== void 0) {
      const { compartment: aliasCompartment = compartment2, specifier: aliasSpecifier = moduleSpecifier2, record: aliasModuleRecord } = staticModuleRecord, aliasRecord = await loadRecord(compartmentPrivateFields2, moduleAliases2, aliasCompartment, aliasSpecifier, aliasModuleRecord);
      return moduleRecords.set(moduleSpecifier2, aliasRecord), aliasRecord;
    }
    return loadRecord(compartmentPrivateFields2, moduleAliases2, compartment2, moduleSpecifier2, staticModuleRecord);
  })(compartmentPrivateFields, moduleAliases, compartment, moduleSpecifier).catch((error) => {
    const { name } = compartmentPrivateFields.get(compartment);
    throw assert.note(error, d`${error.message}, loading ${q(moduleSpecifier)} in compartment ${q(name)}`), error;
  });
  $h\u200D_once.load(load);
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  let makeAlias, Proxy2, TypeError2, create3, freeze, ownKeys, reflectGet, reflectGetOwnPropertyDescriptor, reflectHas, reflectIsExtensible, reflectPreventExtensions, assert;
  $h\u200D_imports([["./module-load.js", [["makeAlias", [($h\u200D_a) => makeAlias = $h\u200D_a]]]], ["./commons.js", [["Proxy", [($h\u200D_a) => Proxy2 = $h\u200D_a]], ["TypeError", [($h\u200D_a) => TypeError2 = $h\u200D_a]], ["create", [($h\u200D_a) => create3 = $h\u200D_a]], ["freeze", [($h\u200D_a) => freeze = $h\u200D_a]], ["ownKeys", [($h\u200D_a) => ownKeys = $h\u200D_a]], ["reflectGet", [($h\u200D_a) => reflectGet = $h\u200D_a]], ["reflectGetOwnPropertyDescriptor", [($h\u200D_a) => reflectGetOwnPropertyDescriptor = $h\u200D_a]], ["reflectHas", [($h\u200D_a) => reflectHas = $h\u200D_a]], ["reflectIsExtensible", [($h\u200D_a) => reflectIsExtensible = $h\u200D_a]], ["reflectPreventExtensions", [($h\u200D_a) => reflectPreventExtensions = $h\u200D_a]]]], ["./error/assert.js", [["assert", [($h\u200D_a) => assert = $h\u200D_a]]]]]);
  const { quote: q } = assert, deferExports = () => {
    let active = false;
    const proxiedExports = create3(null);
    return freeze({ activate() {
      active = true;
    }, proxiedExports, exportsProxy: new Proxy2(proxiedExports, { get(_target, name, receiver) {
      if (!active)
        throw new TypeError2(`Cannot get property ${q(name)} of module exports namespace, the module has not yet begun to execute`);
      return reflectGet(proxiedExports, name, receiver);
    }, set(_target, name, _value) {
      throw new TypeError2(`Cannot set property ${q(name)} of module exports namespace`);
    }, has(_target, name) {
      if (!active)
        throw new TypeError2(`Cannot check property ${q(name)}, the module has not yet begun to execute`);
      return reflectHas(proxiedExports, name);
    }, deleteProperty(_target, name) {
      throw new TypeError2(`Cannot delete property ${q(name)}s of module exports namespace`);
    }, ownKeys(_target) {
      if (!active)
        throw new TypeError2("Cannot enumerate keys, the module has not yet begun to execute");
      return ownKeys(proxiedExports);
    }, getOwnPropertyDescriptor(_target, name) {
      if (!active)
        throw new TypeError2(`Cannot get own property descriptor ${q(name)}, the module has not yet begun to execute`);
      return reflectGetOwnPropertyDescriptor(proxiedExports, name);
    }, preventExtensions(_target) {
      if (!active)
        throw new TypeError2("Cannot prevent extensions of module exports namespace, the module has not yet begun to execute");
      return reflectPreventExtensions(proxiedExports);
    }, isExtensible() {
      if (!active)
        throw new TypeError2("Cannot check extensibility of module exports namespace, the module has not yet begun to execute");
      return reflectIsExtensible(proxiedExports);
    }, getPrototypeOf: (_target) => null, setPrototypeOf(_target, _proto) {
      throw new TypeError2("Cannot set prototype of module exports namespace");
    }, defineProperty(_target, name, _descriptor) {
      throw new TypeError2(`Cannot define property ${q(name)} of module exports namespace`);
    }, apply(_target, _thisArg, _args) {
      throw new TypeError2("Cannot call module exports namespace, it is not a function");
    }, construct(_target, _args) {
      throw new TypeError2("Cannot construct module exports namespace, it is not a constructor");
    } }) });
  };
  $h\u200D_once.deferExports(deferExports);
  $h\u200D_once.getDeferredExports((compartment, compartmentPrivateFields, moduleAliases, specifier) => {
    const { deferredExports } = compartmentPrivateFields;
    if (!deferredExports.has(specifier)) {
      const deferred = deferExports();
      moduleAliases.set(deferred.exportsProxy, makeAlias(compartment, specifier)), deferredExports.set(specifier, deferred);
    }
    return deferredExports.get(specifier);
  });
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  let assert, getDeferredExports, Error2, ReferenceError2, SyntaxError2, TypeError2, create3, defineProperty, entries6, freeze, isArray, keys4;
  $h\u200D_imports([["./error/assert.js", [["assert", [($h\u200D_a) => assert = $h\u200D_a]]]], ["./module-proxy.js", [["getDeferredExports", [($h\u200D_a) => getDeferredExports = $h\u200D_a]]]], ["./commons.js", [["Error", [($h\u200D_a) => Error2 = $h\u200D_a]], ["ReferenceError", [($h\u200D_a) => ReferenceError2 = $h\u200D_a]], ["SyntaxError", [($h\u200D_a) => SyntaxError2 = $h\u200D_a]], ["TypeError", [($h\u200D_a) => TypeError2 = $h\u200D_a]], ["create", [($h\u200D_a) => create3 = $h\u200D_a]], ["defineProperty", [($h\u200D_a) => defineProperty = $h\u200D_a]], ["entries", [($h\u200D_a) => entries6 = $h\u200D_a]], ["freeze", [($h\u200D_a) => freeze = $h\u200D_a]], ["isArray", [($h\u200D_a) => isArray = $h\u200D_a]], ["keys", [($h\u200D_a) => keys4 = $h\u200D_a]]]]]);
  const { quote: q } = assert;
  $h\u200D_once.makeThirdPartyModuleInstance((compartmentPrivateFields, staticModuleRecord, compartment, moduleAliases, moduleSpecifier, resolvedImports) => {
    const { exportsProxy, proxiedExports, activate } = getDeferredExports(compartment, compartmentPrivateFields.get(compartment), moduleAliases, moduleSpecifier), notifiers = create3(null);
    if (staticModuleRecord.exports) {
      if (!isArray(staticModuleRecord.exports) || staticModuleRecord.exports.some((name) => typeof name != "string"))
        throw new TypeError2('SES third-party static module record "exports" property must be an array of strings for module ' + moduleSpecifier);
      staticModuleRecord.exports.forEach((name) => {
        let value = proxiedExports[name];
        const updaters = [];
        defineProperty(proxiedExports, name, { get: () => value, set: (newValue) => {
          value = newValue;
          for (const updater of updaters)
            updater(newValue);
        }, enumerable: true, configurable: false }), notifiers[name] = (update) => {
          updaters.push(update), update(value);
        };
      });
    }
    let activated = false;
    return freeze({ notifiers, exportsProxy, execute() {
      activated || (activate(), activated = true, staticModuleRecord.execute(proxiedExports, compartment, resolvedImports));
    } });
  });
  $h\u200D_once.makeModuleInstance((privateFields, moduleAliases, moduleRecord, importedInstances) => {
    const { compartment, moduleSpecifier, staticModuleRecord } = moduleRecord, { reexports: exportAlls = [], __syncModuleProgram__: functorSource, __fixedExportMap__: fixedExportMap = {}, __liveExportMap__: liveExportMap = {} } = staticModuleRecord, compartmentFields = privateFields.get(compartment), { __shimTransforms__ } = compartmentFields, { exportsProxy, proxiedExports, activate } = getDeferredExports(compartment, compartmentFields, moduleAliases, moduleSpecifier), exportsProps = create3(null), localLexicals = create3(null), onceVar = create3(null), liveVar = create3(null), localGetNotify = create3(null), notifiers = create3(null);
    entries6(fixedExportMap).forEach(([fixedExportName, [localName]]) => {
      let fixedGetNotify = localGetNotify[localName];
      if (!fixedGetNotify) {
        let value, tdz = true, optUpdaters = [];
        const get = () => {
          if (tdz)
            throw new ReferenceError2(`binding ${q(localName)} not yet initialized`);
          return value;
        }, init = freeze((initValue) => {
          if (!tdz)
            throw new Error2(`Internal: binding ${q(localName)} already initialized`);
          value = initValue;
          const updaters = optUpdaters;
          optUpdaters = null, tdz = false;
          for (const updater of updaters)
            updater(initValue);
          return initValue;
        });
        fixedGetNotify = { get, notify: (updater) => {
          updater !== init && (tdz ? optUpdaters.push(updater) : updater(value));
        } }, localGetNotify[localName] = fixedGetNotify, onceVar[localName] = init;
      }
      exportsProps[fixedExportName] = { get: fixedGetNotify.get, set: void 0, enumerable: true, configurable: false }, notifiers[fixedExportName] = fixedGetNotify.notify;
    }), entries6(liveExportMap).forEach(([liveExportName, [localName, setProxyTrap]]) => {
      let liveGetNotify = localGetNotify[localName];
      if (!liveGetNotify) {
        let value, tdz = true;
        const updaters = [], get = () => {
          if (tdz)
            throw new ReferenceError2(`binding ${q(liveExportName)} not yet initialized`);
          return value;
        }, update = freeze((newValue) => {
          value = newValue, tdz = false;
          for (const updater of updaters)
            updater(newValue);
        }), set = (newValue) => {
          if (tdz)
            throw new ReferenceError2(`binding ${q(localName)} not yet initialized`);
          value = newValue;
          for (const updater of updaters)
            updater(newValue);
        };
        liveGetNotify = { get, notify: (updater) => {
          updater !== update && (updaters.push(updater), tdz || updater(value));
        } }, localGetNotify[localName] = liveGetNotify, setProxyTrap && defineProperty(localLexicals, localName, { get, set, enumerable: true, configurable: false }), liveVar[localName] = update;
      }
      exportsProps[liveExportName] = { get: liveGetNotify.get, set: void 0, enumerable: true, configurable: false }, notifiers[liveExportName] = liveGetNotify.notify;
    });
    function imports(updateRecord) {
      const candidateAll = create3(null);
      candidateAll.default = false;
      for (const [specifier, importUpdaters] of updateRecord) {
        const instance = importedInstances.get(specifier);
        instance.execute();
        const { notifiers: importNotifiers } = instance;
        for (const [importName, updaters] of importUpdaters) {
          const importNotify = importNotifiers[importName];
          if (!importNotify)
            throw SyntaxError2(`The requested module '${specifier}' does not provide an export named '${importName}'`);
          for (const updater of updaters)
            importNotify(updater);
        }
        if (exportAlls.includes(specifier))
          for (const [importName, importNotify] of entries6(importNotifiers))
            candidateAll[importName] === void 0 ? candidateAll[importName] = importNotify : candidateAll[importName] = false;
      }
      for (const [importName, notify] of entries6(candidateAll))
        if (!notifiers[importName] && notify !== false) {
          let value;
          notifiers[importName] = notify;
          notify((newValue) => value = newValue), exportsProps[importName] = { get: () => value, set: void 0, enumerable: true, configurable: false };
        }
      keys4(exportsProps).sort().forEach((k) => defineProperty(proxiedExports, k, exportsProps[k])), freeze(proxiedExports), activate();
    }
    notifiers["*"] = (update) => {
      update(proxiedExports);
    };
    let thrownError, optFunctor = compartment.evaluate(functorSource, { globalObject: compartment.globalThis, transforms: __shimTransforms__, __moduleShimLexicals__: localLexicals }), didThrow = false;
    return freeze({ notifiers, exportsProxy, execute: function() {
      if (optFunctor) {
        const functor = optFunctor;
        optFunctor = null;
        try {
          functor(freeze({ imports: freeze(imports), onceVar: freeze(onceVar), liveVar: freeze(liveVar) }));
        } catch (e) {
          didThrow = true, thrownError = e;
        }
      }
      if (didThrow)
        throw thrownError;
    } });
  });
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  let assert, makeModuleInstance, makeThirdPartyModuleInstance, Error2, Map2, ReferenceError2, entries6, isArray, isObject, mapGet, mapHas, mapSet, weakmapGet;
  $h\u200D_imports([["./error/assert.js", [["assert", [($h\u200D_a) => assert = $h\u200D_a]]]], ["./module-instance.js", [["makeModuleInstance", [($h\u200D_a) => makeModuleInstance = $h\u200D_a]], ["makeThirdPartyModuleInstance", [($h\u200D_a) => makeThirdPartyModuleInstance = $h\u200D_a]]]], ["./commons.js", [["Error", [($h\u200D_a) => Error2 = $h\u200D_a]], ["Map", [($h\u200D_a) => Map2 = $h\u200D_a]], ["ReferenceError", [($h\u200D_a) => ReferenceError2 = $h\u200D_a]], ["entries", [($h\u200D_a) => entries6 = $h\u200D_a]], ["isArray", [($h\u200D_a) => isArray = $h\u200D_a]], ["isObject", [($h\u200D_a) => isObject = $h\u200D_a]], ["mapGet", [($h\u200D_a) => mapGet = $h\u200D_a]], ["mapHas", [($h\u200D_a) => mapHas = $h\u200D_a]], ["mapSet", [($h\u200D_a) => mapSet = $h\u200D_a]], ["weakmapGet", [($h\u200D_a) => weakmapGet = $h\u200D_a]]]]]);
  const { quote: q } = assert, link = (compartmentPrivateFields, moduleAliases, compartment, moduleSpecifier) => {
    const { moduleRecords } = weakmapGet(compartmentPrivateFields, compartment), moduleRecord = mapGet(moduleRecords, moduleSpecifier);
    if (moduleRecord === void 0)
      throw new ReferenceError2("Missing link to module " + q(moduleSpecifier));
    return instantiate(compartmentPrivateFields, moduleAliases, moduleRecord);
  };
  $h\u200D_once.link(link);
  const instantiate = (compartmentPrivateFields, moduleAliases, moduleRecord) => {
    const { compartment, moduleSpecifier, resolvedImports, staticModuleRecord } = moduleRecord, { instances } = weakmapGet(compartmentPrivateFields, compartment);
    if (mapHas(instances, moduleSpecifier))
      return mapGet(instances, moduleSpecifier);
    !function(staticModuleRecord2, moduleSpecifier2) {
      assert(isObject(staticModuleRecord2), `Static module records must be of type object, got ${q(staticModuleRecord2)}, for module ${q(moduleSpecifier2)}`);
      const { imports, exports: exports2, reexports = [] } = staticModuleRecord2;
      assert(isArray(imports), `Property 'imports' of a static module record must be an array, got ${q(imports)}, for module ${q(moduleSpecifier2)}`), assert(isArray(exports2), `Property 'exports' of a precompiled module record must be an array, got ${q(exports2)}, for module ${q(moduleSpecifier2)}`), assert(isArray(reexports), `Property 'reexports' of a precompiled module record must be an array if present, got ${q(reexports)}, for module ${q(moduleSpecifier2)}`);
    }(staticModuleRecord, moduleSpecifier);
    const importedInstances = new Map2();
    let moduleInstance;
    if (function(staticModuleRecord2) {
      return typeof staticModuleRecord2.__syncModuleProgram__ == "string";
    }(staticModuleRecord))
      !function(staticModuleRecord2, moduleSpecifier2) {
        const { __fixedExportMap__, __liveExportMap__ } = staticModuleRecord2;
        assert(isObject(__fixedExportMap__), `Property '__fixedExportMap__' of a precompiled module record must be an object, got ${q(__fixedExportMap__)}, for module ${q(moduleSpecifier2)}`), assert(isObject(__liveExportMap__), `Property '__liveExportMap__' of a precompiled module record must be an object, got ${q(__liveExportMap__)}, for module ${q(moduleSpecifier2)}`);
      }(staticModuleRecord, moduleSpecifier), moduleInstance = makeModuleInstance(compartmentPrivateFields, moduleAliases, moduleRecord, importedInstances);
    else {
      if (!function(staticModuleRecord2) {
        return typeof staticModuleRecord2.execute == "function";
      }(staticModuleRecord))
        throw new Error2("importHook must return a static module record, got " + q(staticModuleRecord));
      !function(staticModuleRecord2, moduleSpecifier2) {
        const { exports: exports2 } = staticModuleRecord2;
        assert(isArray(exports2), `Property 'exports' of a third-party static module record must be an array, got ${q(exports2)}, for module ${q(moduleSpecifier2)}`);
      }(staticModuleRecord, moduleSpecifier), moduleInstance = makeThirdPartyModuleInstance(compartmentPrivateFields, staticModuleRecord, compartment, moduleAliases, moduleSpecifier, resolvedImports);
    }
    mapSet(instances, moduleSpecifier, moduleInstance);
    for (const [importSpecifier, resolvedSpecifier] of entries6(resolvedImports)) {
      const importedInstance = link(compartmentPrivateFields, moduleAliases, compartment, resolvedSpecifier);
      mapSet(importedInstances, importSpecifier, importedInstance);
    }
    return moduleInstance;
  };
  $h\u200D_once.instantiate(instantiate);
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  let Error2, Map2, ReferenceError2, TypeError2, WeakMap2, WeakSet2, assign, create3, defineProperties, entries6, freeze, getOwnPropertyDescriptors, getOwnPropertyNames, weakmapGet, weakmapSet, weaksetHas, initGlobalObject, performEval, isValidIdentifierName, sharedGlobalPropertyNames, evadeHtmlCommentTest, evadeImportExpressionTest, rejectSomeDirectEvalExpressions, load, link, getDeferredExports, assert;
  $h\u200D_imports([["./commons.js", [["Error", [($h\u200D_a) => Error2 = $h\u200D_a]], ["Map", [($h\u200D_a) => Map2 = $h\u200D_a]], ["ReferenceError", [($h\u200D_a) => ReferenceError2 = $h\u200D_a]], ["TypeError", [($h\u200D_a) => TypeError2 = $h\u200D_a]], ["WeakMap", [($h\u200D_a) => WeakMap2 = $h\u200D_a]], ["WeakSet", [($h\u200D_a) => WeakSet2 = $h\u200D_a]], ["assign", [($h\u200D_a) => assign = $h\u200D_a]], ["create", [($h\u200D_a) => create3 = $h\u200D_a]], ["defineProperties", [($h\u200D_a) => defineProperties = $h\u200D_a]], ["entries", [($h\u200D_a) => entries6 = $h\u200D_a]], ["freeze", [($h\u200D_a) => freeze = $h\u200D_a]], ["getOwnPropertyDescriptors", [($h\u200D_a) => getOwnPropertyDescriptors = $h\u200D_a]], ["getOwnPropertyNames", [($h\u200D_a) => getOwnPropertyNames = $h\u200D_a]], ["weakmapGet", [($h\u200D_a) => weakmapGet = $h\u200D_a]], ["weakmapSet", [($h\u200D_a) => weakmapSet = $h\u200D_a]], ["weaksetHas", [($h\u200D_a) => weaksetHas = $h\u200D_a]]]], ["./global-object.js", [["initGlobalObject", [($h\u200D_a) => initGlobalObject = $h\u200D_a]]]], ["./evaluate.js", [["performEval", [($h\u200D_a) => performEval = $h\u200D_a]]]], ["./scope-constants.js", [["isValidIdentifierName", [($h\u200D_a) => isValidIdentifierName = $h\u200D_a]]]], ["./whitelist.js", [["sharedGlobalPropertyNames", [($h\u200D_a) => sharedGlobalPropertyNames = $h\u200D_a]]]], ["./transforms.js", [["evadeHtmlCommentTest", [($h\u200D_a) => evadeHtmlCommentTest = $h\u200D_a]], ["evadeImportExpressionTest", [($h\u200D_a) => evadeImportExpressionTest = $h\u200D_a]], ["rejectSomeDirectEvalExpressions", [($h\u200D_a) => rejectSomeDirectEvalExpressions = $h\u200D_a]]]], ["./module-load.js", [["load", [($h\u200D_a) => load = $h\u200D_a]]]], ["./module-link.js", [["link", [($h\u200D_a) => link = $h\u200D_a]]]], ["./module-proxy.js", [["getDeferredExports", [($h\u200D_a) => getDeferredExports = $h\u200D_a]]]], ["./error/assert.js", [["assert", [($h\u200D_a) => assert = $h\u200D_a]]]]]);
  const { quote: q } = assert, moduleAliases = new WeakMap2(), privateFields = new WeakMap2(), assertModuleHooks = (compartment) => {
    const { importHook, resolveHook } = weakmapGet(privateFields, compartment);
    if (typeof importHook != "function" || typeof resolveHook != "function")
      throw new TypeError2("Compartment must be constructed with an importHook and a resolveHook for it to be able to load modules");
  }, InertCompartment = function(_endowments = {}, _modules = {}, _options = {}) {
    throw new TypeError2("Compartment.prototype.constructor is not a valid constructor.");
  };
  $h\u200D_once.InertCompartment(InertCompartment);
  const CompartmentPrototype = { constructor: InertCompartment, get globalThis() {
    return weakmapGet(privateFields, this).globalObject;
  }, get name() {
    return weakmapGet(privateFields, this).name;
  }, evaluate(source, options = {}) {
    if (typeof source != "string")
      throw new TypeError2("first argument of evaluate() must be a string");
    const { transforms = [], sloppyGlobalsMode = false, __moduleShimLexicals__, __evadeHtmlCommentTest__ = false, __evadeImportExpressionTest__ = false, __rejectSomeDirectEvalExpressions__ = true } = options, localTransforms = [...transforms];
    __evadeHtmlCommentTest__ === true && localTransforms.push(evadeHtmlCommentTest), __evadeImportExpressionTest__ === true && localTransforms.push(evadeImportExpressionTest), __rejectSomeDirectEvalExpressions__ === true && localTransforms.push(rejectSomeDirectEvalExpressions);
    const compartmentFields = weakmapGet(privateFields, this);
    let { globalTransforms } = compartmentFields;
    const { globalObject, globalLexicals, knownScopeProxies } = compartmentFields;
    let localObject = globalLexicals;
    return __moduleShimLexicals__ !== void 0 && (globalTransforms = void 0, localObject = create3(null, getOwnPropertyDescriptors(globalLexicals)), defineProperties(localObject, getOwnPropertyDescriptors(__moduleShimLexicals__))), performEval(source, globalObject, localObject, { globalTransforms, localTransforms, sloppyGlobalsMode, knownScopeProxies });
  }, toString: () => "[object Compartment]", __isKnownScopeProxy__(value) {
    const { knownScopeProxies } = weakmapGet(privateFields, this);
    return weaksetHas(knownScopeProxies, value);
  }, module(specifier) {
    if (typeof specifier != "string")
      throw new TypeError2("first argument of module() must be a string");
    assertModuleHooks(this);
    const { exportsProxy } = getDeferredExports(this, weakmapGet(privateFields, this), moduleAliases, specifier);
    return exportsProxy;
  }, async import(specifier) {
    if (typeof specifier != "string")
      throw new TypeError2("first argument of import() must be a string");
    return assertModuleHooks(this), load(privateFields, moduleAliases, this, specifier).then(() => ({ namespace: this.importNow(specifier) }));
  }, async load(specifier) {
    if (typeof specifier != "string")
      throw new TypeError2("first argument of load() must be a string");
    return assertModuleHooks(this), load(privateFields, moduleAliases, this, specifier);
  }, importNow(specifier) {
    if (typeof specifier != "string")
      throw new TypeError2("first argument of importNow() must be a string");
    assertModuleHooks(this);
    const moduleInstance = link(privateFields, moduleAliases, this, specifier);
    return moduleInstance.execute(), moduleInstance.exportsProxy;
  } };
  $h\u200D_once.CompartmentPrototype(CompartmentPrototype), defineProperties(InertCompartment, { prototype: { value: CompartmentPrototype } });
  $h\u200D_once.makeCompartmentConstructor((targetMakeCompartmentConstructor, intrinsics, markVirtualizedNativeFunction) => {
    function Compartment2(endowments = {}, moduleMap = {}, options = {}) {
      if (new.target === void 0)
        throw new TypeError2("Class constructor Compartment cannot be invoked without 'new'");
      const { name = "<unknown>", transforms = [], __shimTransforms__ = [], globalLexicals = {}, resolveHook, importHook, moduleMapHook } = options, globalTransforms = [...transforms, ...__shimTransforms__], moduleRecords = new Map2(), instances = new Map2(), deferredExports = new Map2();
      for (const [specifier, aliasNamespace] of entries6(moduleMap || {})) {
        if (typeof aliasNamespace == "string")
          throw new TypeError2(`Cannot map module ${q(specifier)} to ${q(aliasNamespace)} in parent compartment`);
        if (weakmapGet(moduleAliases, aliasNamespace) === void 0)
          throw ReferenceError2(`Cannot map module ${q(specifier)} because it has no known compartment in this realm`);
      }
      const globalObject = {};
      initGlobalObject(globalObject, intrinsics, sharedGlobalPropertyNames, targetMakeCompartmentConstructor, this.constructor.prototype, { globalTransforms, markVirtualizedNativeFunction }), assign(globalObject, endowments);
      const invalidNames = getOwnPropertyNames(globalLexicals).filter((identifier) => !isValidIdentifierName(identifier));
      if (invalidNames.length)
        throw new Error2(`Cannot create compartment with invalid names for global lexicals: ${invalidNames.join(", ")}; these names would not be lexically mentionable`);
      const knownScopeProxies = new WeakSet2();
      weakmapSet(privateFields, this, { name, globalTransforms, globalObject, knownScopeProxies, globalLexicals: freeze({ ...globalLexicals }), resolveHook, importHook, moduleMap, moduleMapHook, moduleRecords, __shimTransforms__, deferredExports, instances });
    }
    return Compartment2.prototype = CompartmentPrototype, Compartment2;
  });
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  let Array2, FERAL_FUNCTION, Float32Array, Map2, RegExp, Set2, String2, getOwnPropertyDescriptor, getPrototypeOf, iteratorSymbol, matchAllSymbol, InertCompartment;
  function getConstructorOf(obj) {
    return getPrototypeOf(obj).constructor;
  }
  $h\u200D_imports([["./commons.js", [["Array", [($h\u200D_a) => Array2 = $h\u200D_a]], ["FERAL_FUNCTION", [($h\u200D_a) => FERAL_FUNCTION = $h\u200D_a]], ["Float32Array", [($h\u200D_a) => Float32Array = $h\u200D_a]], ["Map", [($h\u200D_a) => Map2 = $h\u200D_a]], ["RegExp", [($h\u200D_a) => RegExp = $h\u200D_a]], ["Set", [($h\u200D_a) => Set2 = $h\u200D_a]], ["String", [($h\u200D_a) => String2 = $h\u200D_a]], ["getOwnPropertyDescriptor", [($h\u200D_a) => getOwnPropertyDescriptor = $h\u200D_a]], ["getPrototypeOf", [($h\u200D_a) => getPrototypeOf = $h\u200D_a]], ["iteratorSymbol", [($h\u200D_a) => iteratorSymbol = $h\u200D_a]], ["matchAllSymbol", [($h\u200D_a) => matchAllSymbol = $h\u200D_a]]]], ["./compartment-shim.js", [["InertCompartment", [($h\u200D_a) => InertCompartment = $h\u200D_a]]]]]);
  $h\u200D_once.getAnonymousIntrinsics(() => {
    const InertFunction = FERAL_FUNCTION.prototype.constructor, ThrowTypeError = getOwnPropertyDescriptor(function() {
      return arguments;
    }(), "callee").get, StringIteratorObject = new String2()[iteratorSymbol](), StringIteratorPrototype = getPrototypeOf(StringIteratorObject), RegExpStringIterator = RegExp.prototype[matchAllSymbol] && new RegExp()[matchAllSymbol](), RegExpStringIteratorPrototype = RegExpStringIterator && getPrototypeOf(RegExpStringIterator), ArrayIteratorObject = new Array2()[iteratorSymbol](), ArrayIteratorPrototype = getPrototypeOf(ArrayIteratorObject), TypedArray = getPrototypeOf(Float32Array), MapIteratorObject = new Map2()[iteratorSymbol](), MapIteratorPrototype = getPrototypeOf(MapIteratorObject), SetIteratorObject = new Set2()[iteratorSymbol](), SetIteratorPrototype = getPrototypeOf(SetIteratorObject), IteratorPrototype = getPrototypeOf(ArrayIteratorPrototype);
    const GeneratorFunction = getConstructorOf(function* () {
    }), Generator2 = GeneratorFunction.prototype;
    const AsyncGeneratorFunction = getConstructorOf(async function* () {
    }), AsyncGenerator = AsyncGeneratorFunction.prototype, AsyncGeneratorPrototype = AsyncGenerator.prototype, AsyncIteratorPrototype = getPrototypeOf(AsyncGeneratorPrototype);
    return { "%InertFunction%": InertFunction, "%ArrayIteratorPrototype%": ArrayIteratorPrototype, "%InertAsyncFunction%": getConstructorOf(async function() {
    }), "%AsyncGenerator%": AsyncGenerator, "%InertAsyncGeneratorFunction%": AsyncGeneratorFunction, "%AsyncGeneratorPrototype%": AsyncGeneratorPrototype, "%AsyncIteratorPrototype%": AsyncIteratorPrototype, "%Generator%": Generator2, "%InertGeneratorFunction%": GeneratorFunction, "%IteratorPrototype%": IteratorPrototype, "%MapIteratorPrototype%": MapIteratorPrototype, "%RegExpStringIteratorPrototype%": RegExpStringIteratorPrototype, "%SetIteratorPrototype%": SetIteratorPrototype, "%StringIteratorPrototype%": StringIteratorPrototype, "%ThrowTypeError%": ThrowTypeError, "%TypedArray%": TypedArray, "%InertCompartment%": InertCompartment };
  });
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  let WeakSet2, Error2, Object2, defineProperty, entries6, freeze, getOwnPropertyDescriptor, getOwnPropertyDescriptors, globalThis2, is, objectHasOwnProperty, values5, arrayFilter, constantProperties, sharedGlobalPropertyNames, universalPropertyNames, whitelist;
  $h\u200D_imports([["./commons.js", [["WeakSet", [($h\u200D_a) => WeakSet2 = $h\u200D_a]], ["Error", [($h\u200D_a) => Error2 = $h\u200D_a]], ["Object", [($h\u200D_a) => Object2 = $h\u200D_a]], ["defineProperty", [($h\u200D_a) => defineProperty = $h\u200D_a]], ["entries", [($h\u200D_a) => entries6 = $h\u200D_a]], ["freeze", [($h\u200D_a) => freeze = $h\u200D_a]], ["getOwnPropertyDescriptor", [($h\u200D_a) => getOwnPropertyDescriptor = $h\u200D_a]], ["getOwnPropertyDescriptors", [($h\u200D_a) => getOwnPropertyDescriptors = $h\u200D_a]], ["globalThis", [($h\u200D_a) => globalThis2 = $h\u200D_a]], ["is", [($h\u200D_a) => is = $h\u200D_a]], ["objectHasOwnProperty", [($h\u200D_a) => objectHasOwnProperty = $h\u200D_a]], ["values", [($h\u200D_a) => values5 = $h\u200D_a]], ["arrayFilter", [($h\u200D_a) => arrayFilter = $h\u200D_a]]]], ["./whitelist.js", [["constantProperties", [($h\u200D_a) => constantProperties = $h\u200D_a]], ["sharedGlobalPropertyNames", [($h\u200D_a) => sharedGlobalPropertyNames = $h\u200D_a]], ["universalPropertyNames", [($h\u200D_a) => universalPropertyNames = $h\u200D_a]], ["whitelist", [($h\u200D_a) => whitelist = $h\u200D_a]]]]]);
  const isFunction = (obj) => typeof obj == "function";
  function initProperty(obj, name, desc) {
    if (objectHasOwnProperty(obj, name)) {
      const preDesc = getOwnPropertyDescriptor(obj, name);
      if (!is(preDesc.value, desc.value) || preDesc.get !== desc.get || preDesc.set !== desc.set || preDesc.writable !== desc.writable || preDesc.enumerable !== desc.enumerable || preDesc.configurable !== desc.configurable)
        throw new Error2("Conflicting definitions of " + name);
    }
    defineProperty(obj, name, desc);
  }
  function sampleGlobals(globalObject, newPropertyNames) {
    const newIntrinsics = { __proto__: null };
    for (const [globalName, intrinsicName] of entries6(newPropertyNames))
      objectHasOwnProperty(globalObject, globalName) && (newIntrinsics[intrinsicName] = globalObject[globalName]);
    return newIntrinsics;
  }
  const makeIntrinsicsCollector = () => {
    const intrinsics = { __proto__: null };
    let pseudoNatives;
    const intrinsicsCollector = { addIntrinsics(newIntrinsics) {
      !function(obj, descs) {
        for (const [name, desc] of entries6(descs))
          initProperty(obj, name, desc);
      }(intrinsics, getOwnPropertyDescriptors(newIntrinsics));
    }, completePrototypes() {
      for (const [name, intrinsic] of entries6(intrinsics)) {
        if (intrinsic !== Object2(intrinsic))
          continue;
        if (!objectHasOwnProperty(intrinsic, "prototype"))
          continue;
        const permit = whitelist[name];
        if (typeof permit != "object")
          throw new Error2("Expected permit object at whitelist." + name);
        const namePrototype = permit.prototype;
        if (!namePrototype)
          throw new Error2(name + ".prototype property not whitelisted");
        if (typeof namePrototype != "string" || !objectHasOwnProperty(whitelist, namePrototype))
          throw new Error2(`Unrecognized ${name}.prototype whitelist entry`);
        const intrinsicPrototype = intrinsic.prototype;
        if (objectHasOwnProperty(intrinsics, namePrototype)) {
          if (intrinsics[namePrototype] !== intrinsicPrototype)
            throw new Error2("Conflicting bindings of " + namePrototype);
        } else
          intrinsics[namePrototype] = intrinsicPrototype;
      }
    }, finalIntrinsics: () => (freeze(intrinsics), pseudoNatives = new WeakSet2(arrayFilter(values5(intrinsics), isFunction)), intrinsics), isPseudoNative(obj) {
      if (!pseudoNatives)
        throw new Error2("isPseudoNative can only be called after finalIntrinsics");
      return pseudoNatives.has(obj);
    } };
    return intrinsicsCollector.addIntrinsics(constantProperties), intrinsicsCollector.addIntrinsics(sampleGlobals(globalThis2, universalPropertyNames)), intrinsicsCollector;
  };
  $h\u200D_once.makeIntrinsicsCollector(makeIntrinsicsCollector);
  $h\u200D_once.getGlobalIntrinsics((globalObject) => {
    const intrinsicsCollector = makeIntrinsicsCollector();
    return intrinsicsCollector.addIntrinsics(sampleGlobals(globalObject, sharedGlobalPropertyNames)), intrinsicsCollector.finalIntrinsics();
  });
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  $h\u200D_imports([]);
  $h\u200D_once.minEnablements({ "%ObjectPrototype%": { toString: true }, "%FunctionPrototype%": { toString: true }, "%ErrorPrototype%": { name: true } });
  const moderateEnablements = { "%ObjectPrototype%": { toString: true, valueOf: true }, "%ArrayPrototype%": { toString: true, push: true }, "%FunctionPrototype%": { constructor: true, bind: true, toString: true }, "%ErrorPrototype%": { constructor: true, message: true, name: true, toString: true }, "%TypeErrorPrototype%": { constructor: true, message: true, name: true }, "%SyntaxErrorPrototype%": { message: true }, "%RangeErrorPrototype%": { message: true }, "%URIErrorPrototype%": { message: true }, "%EvalErrorPrototype%": { message: true }, "%ReferenceErrorPrototype%": { message: true }, "%PromisePrototype%": { constructor: true }, "%TypedArrayPrototype%": "*", "%Generator%": { constructor: true, name: true, toString: true }, "%IteratorPrototype%": { toString: true } };
  $h\u200D_once.moderateEnablements(moderateEnablements);
  const severeEnablements = { ...moderateEnablements, "%ObjectPrototype%": "*", "%TypedArrayPrototype%": "*" };
  $h\u200D_once.severeEnablements(severeEnablements);
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  let Error2, Set2, String2, TypeError2, defineProperty, getOwnPropertyDescriptor, getOwnPropertyDescriptors, getOwnPropertyNames, isObject, objectHasOwnProperty, ownKeys, setHas, minEnablements, moderateEnablements, severeEnablements;
  $h\u200D_imports([["./commons.js", [["Error", [($h\u200D_a) => Error2 = $h\u200D_a]], ["Set", [($h\u200D_a) => Set2 = $h\u200D_a]], ["String", [($h\u200D_a) => String2 = $h\u200D_a]], ["TypeError", [($h\u200D_a) => TypeError2 = $h\u200D_a]], ["defineProperty", [($h\u200D_a) => defineProperty = $h\u200D_a]], ["getOwnPropertyDescriptor", [($h\u200D_a) => getOwnPropertyDescriptor = $h\u200D_a]], ["getOwnPropertyDescriptors", [($h\u200D_a) => getOwnPropertyDescriptors = $h\u200D_a]], ["getOwnPropertyNames", [($h\u200D_a) => getOwnPropertyNames = $h\u200D_a]], ["isObject", [($h\u200D_a) => isObject = $h\u200D_a]], ["objectHasOwnProperty", [($h\u200D_a) => objectHasOwnProperty = $h\u200D_a]], ["ownKeys", [($h\u200D_a) => ownKeys = $h\u200D_a]], ["setHas", [($h\u200D_a) => setHas = $h\u200D_a]]]], ["./enablements.js", [["minEnablements", [($h\u200D_a) => minEnablements = $h\u200D_a]], ["moderateEnablements", [($h\u200D_a) => moderateEnablements = $h\u200D_a]], ["severeEnablements", [($h\u200D_a) => severeEnablements = $h\u200D_a]]]]]), $h\u200D_once.default(function(intrinsics, overrideTaming, overrideDebug = []) {
    const debugProperties = new Set2(overrideDebug);
    function enable(path, obj, prop, desc) {
      if ("value" in desc && desc.configurable) {
        let getter = function() {
          return value;
        };
        const { value } = desc;
        defineProperty(getter, "originalValue", { value, writable: false, enumerable: false, configurable: false });
        const isDebug = setHas(debugProperties, prop);
        defineProperty(obj, prop, { get: getter, set: function(newValue) {
          if (obj === this)
            throw new TypeError2(`Cannot assign to read only property '${String2(prop)}' of '${path}'`);
          objectHasOwnProperty(this, prop) ? this[prop] = newValue : (isDebug && console.error(new Error2("Override property " + prop)), defineProperty(this, prop, { value: newValue, writable: true, enumerable: true, configurable: true }));
        }, enumerable: desc.enumerable, configurable: desc.configurable });
      }
    }
    function enableProperty(path, obj, prop) {
      const desc = getOwnPropertyDescriptor(obj, prop);
      desc && enable(path, obj, prop, desc);
    }
    function enableAllProperties(path, obj) {
      const descs = getOwnPropertyDescriptors(obj);
      descs && ownKeys(descs).forEach((prop) => enable(path, obj, prop, descs[prop]));
    }
    let plan;
    switch (overrideTaming) {
      case "min":
        plan = minEnablements;
        break;
      case "moderate":
        plan = moderateEnablements;
        break;
      case "severe":
        plan = severeEnablements;
        break;
      default:
        throw new Error2("unrecognized overrideTaming " + overrideTaming);
    }
    !function enableProperties(path, obj, plan2) {
      for (const prop of getOwnPropertyNames(plan2)) {
        const desc = getOwnPropertyDescriptor(obj, prop);
        if (!desc || desc.get || desc.set)
          continue;
        const subPath = `${path}.${String2(prop)}`, subPlan = plan2[prop];
        if (subPlan === true)
          enableProperty(subPath, obj, prop);
        else if (subPlan === "*")
          enableAllProperties(subPath, desc.value);
        else {
          if (!isObject(subPlan))
            throw new TypeError2("Unexpected override enablement plan " + subPath);
          enableProperties(subPath, desc.value, subPlan);
        }
      }
    }("root", intrinsics, plan);
  });
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  let Error2, WeakSet2, defineProperty, freeze, fromEntries, weaksetAdd, weaksetHas;
  $h\u200D_imports([["../commons.js", [["Error", [($h\u200D_a) => Error2 = $h\u200D_a]], ["WeakSet", [($h\u200D_a) => WeakSet2 = $h\u200D_a]], ["defineProperty", [($h\u200D_a) => defineProperty = $h\u200D_a]], ["freeze", [($h\u200D_a) => freeze = $h\u200D_a]], ["fromEntries", [($h\u200D_a) => fromEntries = $h\u200D_a]], ["weaksetAdd", [($h\u200D_a) => weaksetAdd = $h\u200D_a]], ["weaksetHas", [($h\u200D_a) => weaksetHas = $h\u200D_a]]]], ["./types.js", []], ["./internal-types.js", []]]);
  const consoleLevelMethods = freeze([["debug", "debug"], ["log", "log"], ["info", "info"], ["warn", "warn"], ["error", "error"], ["trace", "log"], ["dirxml", "log"], ["group", "log"], ["groupCollapsed", "log"]]), consoleOtherMethods = freeze([["assert", "error"], ["timeLog", "log"], ["clear", void 0], ["count", "info"], ["countReset", void 0], ["dir", "log"], ["groupEnd", "log"], ["table", "log"], ["time", "info"], ["timeEnd", "info"], ["profile", void 0], ["profileEnd", void 0], ["timeStamp", void 0]]), consoleWhitelist = freeze([...consoleLevelMethods, ...consoleOtherMethods]);
  $h\u200D_once.consoleWhitelist(consoleWhitelist);
  const makeLoggingConsoleKit = (loggedErrorHandler, { shouldResetForDebugging = false } = {}) => {
    shouldResetForDebugging && loggedErrorHandler.resetErrorTagNum();
    let logArray = [];
    const loggingConsole = fromEntries(consoleWhitelist.map(([name, _]) => {
      const method = (...args) => {
        logArray.push([name, ...args]);
      };
      return defineProperty(method, "name", { value: name }), [name, freeze(method)];
    }));
    freeze(loggingConsole);
    const takeLog = () => {
      const result = freeze(logArray);
      return logArray = [], result;
    };
    freeze(takeLog);
    return freeze({ loggingConsole, takeLog });
  };
  $h\u200D_once.makeLoggingConsoleKit(makeLoggingConsoleKit), freeze(makeLoggingConsoleKit);
  const ErrorInfo = { NOTE: "ERROR_NOTE:", MESSAGE: "ERROR_MESSAGE:" };
  freeze(ErrorInfo);
  $h\u200D_once.BASE_CONSOLE_LEVEL("debug");
  const makeCausalConsole = (baseConsole, loggedErrorHandler) => {
    const { getStackString, tagError, takeMessageLogArgs, takeNoteLogArgsArray } = loggedErrorHandler, extractErrorArgs = (logArgs, subErrorsSink) => logArgs.map((arg) => arg instanceof Error2 ? (subErrorsSink.push(arg), `(${tagError(arg)})`) : arg), logErrorInfo = (error, kind, logArgs, subErrorsSink) => {
      const errorTag = tagError(error), errorName = kind === ErrorInfo.MESSAGE ? errorTag + ":" : `${errorTag} ${kind}`, argTags = extractErrorArgs(logArgs, subErrorsSink);
      baseConsole.debug(errorName, ...argTags);
    }, logSubErrors = (subErrors, optTag) => {
      if (subErrors.length === 0)
        return;
      if (subErrors.length === 1 && optTag === void 0)
        return void logError(subErrors[0]);
      let label;
      label = subErrors.length === 1 ? "Nested error" : `Nested ${subErrors.length} errors`, optTag !== void 0 && (label = `${label} under ${optTag}`), baseConsole.group(label);
      try {
        for (const subError of subErrors)
          logError(subError);
      } finally {
        baseConsole.groupEnd();
      }
    }, errorsLogged = new WeakSet2(), noteCallback = (error, noteLogArgs) => {
      const subErrors = [];
      logErrorInfo(error, ErrorInfo.NOTE, noteLogArgs, subErrors), logSubErrors(subErrors, tagError(error));
    }, logError = (error) => {
      if (weaksetHas(errorsLogged, error))
        return;
      const errorTag = tagError(error);
      weaksetAdd(errorsLogged, error);
      const subErrors = [], messageLogArgs = takeMessageLogArgs(error), noteLogArgsArray = takeNoteLogArgsArray(error, noteCallback);
      messageLogArgs === void 0 ? baseConsole.debug(errorTag + ":", error.message) : logErrorInfo(error, ErrorInfo.MESSAGE, messageLogArgs, subErrors);
      let stackString = getStackString(error);
      typeof stackString == "string" && stackString.length >= 1 && !stackString.endsWith("\n") && (stackString += "\n"), baseConsole.debug(stackString);
      for (const noteLogArgs of noteLogArgsArray)
        logErrorInfo(error, ErrorInfo.NOTE, noteLogArgs, subErrors);
      logSubErrors(subErrors, errorTag);
    }, levelMethods = consoleLevelMethods.map(([level, _]) => {
      const levelMethod = (...logArgs) => {
        const subErrors = [], argTags = extractErrorArgs(logArgs, subErrors);
        baseConsole[level](...argTags), logSubErrors(subErrors);
      };
      return defineProperty(levelMethod, "name", { value: level }), [level, freeze(levelMethod)];
    }), otherMethods = consoleOtherMethods.filter(([name, _]) => name in baseConsole).map(([name, _]) => {
      const otherMethod = (...args) => {
        baseConsole[name](...args);
      };
      return defineProperty(otherMethod, "name", { value: name }), [name, freeze(otherMethod)];
    }), causalConsole = fromEntries([...levelMethods, ...otherMethods]);
    return freeze(causalConsole);
  };
  $h\u200D_once.makeCausalConsole(makeCausalConsole), freeze(makeCausalConsole);
  const filterConsole = (baseConsole, filter, _topic) => {
    const methods = consoleWhitelist.filter(([name, _]) => name in baseConsole).map(([name, severity]) => [name, freeze((...args) => {
      (severity === void 0 || filter.canLog(severity)) && baseConsole[name](...args);
    })]), filteringConsole = fromEntries(methods);
    return freeze(filteringConsole);
  };
  $h\u200D_once.filterConsole(filterConsole), freeze(filterConsole);
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  let Error2, globalThis2, defaultHandler, makeCausalConsole;
  $h\u200D_imports([["../commons.js", [["Error", [($h\u200D_a) => Error2 = $h\u200D_a]], ["globalThis", [($h\u200D_a) => globalThis2 = $h\u200D_a]]]], ["./assert.js", [["loggedErrorHandler", [($h\u200D_a) => defaultHandler = $h\u200D_a]]]], ["./console.js", [["makeCausalConsole", [($h\u200D_a) => makeCausalConsole = $h\u200D_a]]]], ["./types.js", []], ["./internal-types.js", []]]);
  const originalConsole = console;
  $h\u200D_once.tameConsole((consoleTaming = "safe", errorTrapping = "platform", optGetStackString) => {
    if (consoleTaming !== "safe" && consoleTaming !== "unsafe")
      throw new Error2("unrecognized consoleTaming " + consoleTaming);
    if (consoleTaming === "unsafe")
      return { console: originalConsole };
    let loggedErrorHandler;
    loggedErrorHandler = optGetStackString === void 0 ? defaultHandler : { ...defaultHandler, getStackString: optGetStackString };
    const causalConsole = makeCausalConsole(originalConsole, loggedErrorHandler);
    return errorTrapping !== "none" && globalThis2.process !== void 0 && globalThis2.process.on("uncaughtException", (error) => {
      causalConsole.error(error), errorTrapping === "platform" || errorTrapping === "exit" ? globalThis2.process.exit(globalThis2.process.exitCode || -1) : errorTrapping === "abort" && globalThis2.process.abort();
    }), errorTrapping !== "none" && globalThis2.window !== void 0 && globalThis2.window.addEventListener("error", (event) => {
      event.preventDefault();
      const stackString = loggedErrorHandler.getStackString(event.error);
      causalConsole.error(stackString), errorTrapping !== "exit" && errorTrapping !== "abort" || (globalThis2.window.location.href = "about:blank");
    }), { console: causalConsole };
  });
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  let WeakMap2, WeakSet2, weaksetHas, weaksetAdd, weakmapSet, weakmapGet, weakmapHas, create3, defineProperties, fromEntries, reflectSet;
  $h\u200D_imports([["../commons.js", [["WeakMap", [($h\u200D_a) => WeakMap2 = $h\u200D_a]], ["WeakSet", [($h\u200D_a) => WeakSet2 = $h\u200D_a]], ["weaksetHas", [($h\u200D_a) => weaksetHas = $h\u200D_a]], ["weaksetAdd", [($h\u200D_a) => weaksetAdd = $h\u200D_a]], ["weakmapSet", [($h\u200D_a) => weakmapSet = $h\u200D_a]], ["weakmapGet", [($h\u200D_a) => weakmapGet = $h\u200D_a]], ["weakmapHas", [($h\u200D_a) => weakmapHas = $h\u200D_a]], ["create", [($h\u200D_a) => create3 = $h\u200D_a]], ["defineProperties", [($h\u200D_a) => defineProperties = $h\u200D_a]], ["fromEntries", [($h\u200D_a) => fromEntries = $h\u200D_a]], ["reflectSet", [($h\u200D_a) => reflectSet = $h\u200D_a]]]]]);
  const safeV8CallSiteMethodNames = ["getTypeName", "getFunctionName", "getMethodName", "getFileName", "getLineNumber", "getColumnNumber", "getEvalOrigin", "isToplevel", "isEval", "isNative", "isConstructor", "isAsync", "getPosition", "getScriptNameOrSourceURL", "toString"], safeV8CallSiteFacet = (callSite) => {
    const o = fromEntries(safeV8CallSiteMethodNames.map((name) => [name, () => callSite[name]()]));
    return create3(o, {});
  }, FILENAME_CENSORS = [/\/node_modules\//, /^(?:node:)?internal\//, /\/packages\/ses\/src\/error\/assert.js$/, /\/packages\/eventual-send\/src\//], filterFileName = (fileName) => {
    if (!fileName)
      return true;
    for (const filter of FILENAME_CENSORS)
      if (filter.test(fileName))
        return false;
    return true;
  };
  $h\u200D_once.filterFileName(filterFileName);
  const CALLSITE_PATTERNS = [/^((?:.*[( ])?)[:/\w_-]*\/\.\.\.\/(.+)$/, /^((?:.*[( ])?)[:/\w_-]*\/(packages\/.+)$/], shortenCallSiteString = (callSiteString) => {
    for (const filter of CALLSITE_PATTERNS) {
      const match = filter.exec(callSiteString);
      if (match)
        return match.slice(1).join("");
    }
    return callSiteString;
  };
  $h\u200D_once.shortenCallSiteString(shortenCallSiteString);
  $h\u200D_once.tameV8ErrorConstructor((OriginalError, InitialError, errorTaming, stackFiltering) => {
    const callSiteFilter = (callSite) => stackFiltering === "verbose" || filterFileName(callSite.getFileName()), callSiteStringifier = (callSite) => {
      let callSiteString = "" + callSite;
      return stackFiltering === "concise" && (callSiteString = shortenCallSiteString(callSiteString)), "\n  at " + callSiteString;
    }, stackStringFromSST = (_error, sst) => [...sst.filter(callSiteFilter).map(callSiteStringifier)].join(""), ssts = new WeakMap2(), tamedMethods = { captureStackTrace(error, optFn = tamedMethods.captureStackTrace) {
      typeof OriginalError.captureStackTrace != "function" ? reflectSet(error, "stack", "") : OriginalError.captureStackTrace(error, optFn);
    }, getStackString(error) {
      weakmapHas(ssts, error) || error.stack;
      const sst = weakmapGet(ssts, error);
      return sst ? stackStringFromSST(0, sst) : "";
    }, prepareStackTrace(error, sst) {
      if (weakmapSet(ssts, error, sst), errorTaming === "unsafe") {
        return `${error}${stackStringFromSST(0, sst)}`;
      }
      return "";
    } }, defaultPrepareFn = tamedMethods.prepareStackTrace;
    OriginalError.prepareStackTrace = defaultPrepareFn;
    const systemPrepareFnSet = new WeakSet2([defaultPrepareFn]), systemPrepareFnFor = (inputPrepareFn) => {
      if (weaksetHas(systemPrepareFnSet, inputPrepareFn))
        return inputPrepareFn;
      const systemMethods = { prepareStackTrace: (error, sst) => (weakmapSet(ssts, error, sst), inputPrepareFn(error, ((sst2) => sst2.map(safeV8CallSiteFacet))(sst))) };
      return weaksetAdd(systemPrepareFnSet, systemMethods.prepareStackTrace), systemMethods.prepareStackTrace;
    };
    return defineProperties(InitialError, { captureStackTrace: { value: tamedMethods.captureStackTrace, writable: true, enumerable: false, configurable: true }, prepareStackTrace: { get: () => OriginalError.prepareStackTrace, set(inputPrepareStackTraceFn) {
      if (typeof inputPrepareStackTraceFn == "function") {
        const systemPrepareFn = systemPrepareFnFor(inputPrepareStackTraceFn);
        OriginalError.prepareStackTrace = systemPrepareFn;
      } else
        OriginalError.prepareStackTrace = defaultPrepareFn;
    }, enumerable: false, configurable: true } }), tamedMethods.getStackString;
  });
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  let Error2, apply, construct, defineProperties, setPrototypeOf, getOwnPropertyDescriptor, NativeErrors, tameV8ErrorConstructor;
  $h\u200D_imports([["../commons.js", [["Error", [($h\u200D_a) => Error2 = $h\u200D_a]], ["apply", [($h\u200D_a) => apply = $h\u200D_a]], ["construct", [($h\u200D_a) => construct = $h\u200D_a]], ["defineProperties", [($h\u200D_a) => defineProperties = $h\u200D_a]], ["setPrototypeOf", [($h\u200D_a) => setPrototypeOf = $h\u200D_a]], ["getOwnPropertyDescriptor", [($h\u200D_a) => getOwnPropertyDescriptor = $h\u200D_a]]]], ["../whitelist.js", [["NativeErrors", [($h\u200D_a) => NativeErrors = $h\u200D_a]]]], ["./tame-v8-error-constructor.js", [["tameV8ErrorConstructor", [($h\u200D_a) => tameV8ErrorConstructor = $h\u200D_a]]]]]);
  const stackDesc = getOwnPropertyDescriptor(Error2.prototype, "stack"), stackGetter = stackDesc && stackDesc.get, tamedMethods = { getStackString: (error) => typeof stackGetter == "function" ? apply(stackGetter, error, []) : "stack" in error ? "" + error.stack : "" };
  $h\u200D_once.default(function(errorTaming = "safe", stackFiltering = "concise") {
    if (errorTaming !== "safe" && errorTaming !== "unsafe")
      throw new Error2("unrecognized errorTaming " + errorTaming);
    if (stackFiltering !== "concise" && stackFiltering !== "verbose")
      throw new Error2("unrecognized stackFiltering " + stackFiltering);
    const OriginalError = Error2, ErrorPrototype = OriginalError.prototype, platform = typeof OriginalError.captureStackTrace == "function" ? "v8" : "unknown", makeErrorConstructor = (_ = {}) => {
      const ResultError = function(...rest) {
        let error;
        return error = new.target === void 0 ? apply(OriginalError, this, rest) : construct(OriginalError, rest, new.target), platform === "v8" && OriginalError.captureStackTrace(error, ResultError), error;
      };
      return defineProperties(ResultError, { length: { value: 1 }, prototype: { value: ErrorPrototype, writable: false, enumerable: false, configurable: false } }), ResultError;
    }, InitialError = makeErrorConstructor({ powers: "original" }), SharedError = makeErrorConstructor({ powers: "none" });
    defineProperties(ErrorPrototype, { constructor: { value: SharedError } });
    for (const NativeError of NativeErrors)
      setPrototypeOf(NativeError, SharedError);
    defineProperties(InitialError, { stackTraceLimit: { get() {
      if (typeof OriginalError.stackTraceLimit == "number")
        return OriginalError.stackTraceLimit;
    }, set(newLimit) {
      typeof newLimit == "number" && (typeof OriginalError.stackTraceLimit != "number" || (OriginalError.stackTraceLimit = newLimit));
    }, enumerable: false, configurable: true } }), defineProperties(SharedError, { stackTraceLimit: { get() {
    }, set(_newLimit) {
    }, enumerable: false, configurable: true } });
    let initialGetStackString = tamedMethods.getStackString;
    return platform === "v8" && (initialGetStackString = tameV8ErrorConstructor(OriginalError, InitialError, errorTaming, stackFiltering)), { "%InitialGetStackString%": initialGetStackString, "%InitialError%": InitialError, "%SharedError%": SharedError };
  });
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  let Set2, String2, TypeError2, WeakMap2, WeakSet2, arrayForEach, freeze, getOwnPropertyDescriptors, getPrototypeOf, isObject, objectHasOwnProperty, ownKeys, setAdd, setForEach, setHas, weakmapGet, weakmapSet, weaksetAdd, weaksetHas;
  $h\u200D_imports([["./commons.js", [["Set", [($h\u200D_a) => Set2 = $h\u200D_a]], ["String", [($h\u200D_a) => String2 = $h\u200D_a]], ["TypeError", [($h\u200D_a) => TypeError2 = $h\u200D_a]], ["WeakMap", [($h\u200D_a) => WeakMap2 = $h\u200D_a]], ["WeakSet", [($h\u200D_a) => WeakSet2 = $h\u200D_a]], ["arrayForEach", [($h\u200D_a) => arrayForEach = $h\u200D_a]], ["freeze", [($h\u200D_a) => freeze = $h\u200D_a]], ["getOwnPropertyDescriptors", [($h\u200D_a) => getOwnPropertyDescriptors = $h\u200D_a]], ["getPrototypeOf", [($h\u200D_a) => getPrototypeOf = $h\u200D_a]], ["isObject", [($h\u200D_a) => isObject = $h\u200D_a]], ["objectHasOwnProperty", [($h\u200D_a) => objectHasOwnProperty = $h\u200D_a]], ["ownKeys", [($h\u200D_a) => ownKeys = $h\u200D_a]], ["setAdd", [($h\u200D_a) => setAdd = $h\u200D_a]], ["setForEach", [($h\u200D_a) => setForEach = $h\u200D_a]], ["setHas", [($h\u200D_a) => setHas = $h\u200D_a]], ["weakmapGet", [($h\u200D_a) => weakmapGet = $h\u200D_a]], ["weakmapSet", [($h\u200D_a) => weakmapSet = $h\u200D_a]], ["weaksetAdd", [($h\u200D_a) => weaksetAdd = $h\u200D_a]], ["weaksetHas", [($h\u200D_a) => weaksetHas = $h\u200D_a]]]]]);
  $h\u200D_once.makeHardener(() => {
    const hardened = new WeakSet2(), { harden } = { harden(root3) {
      const toFreeze = new Set2(), paths = new WeakMap2();
      function enqueue(val, path) {
        if (!isObject(val))
          return;
        const type = typeof val;
        if (type !== "object" && type !== "function")
          throw new TypeError2("Unexpected typeof: " + type);
        weaksetHas(hardened, val) || setHas(toFreeze, val) || (setAdd(toFreeze, val), weakmapSet(paths, val, path));
      }
      function freezeAndTraverse(obj) {
        freeze(obj);
        const path = weakmapGet(paths, obj) || "unknown", descs = getOwnPropertyDescriptors(obj);
        enqueue(getPrototypeOf(obj), path + ".__proto__"), arrayForEach(ownKeys(descs), (name) => {
          const pathname = `${path}.${String2(name)}`, desc = descs[name];
          objectHasOwnProperty(desc, "value") ? enqueue(desc.value, "" + pathname) : (enqueue(desc.get, pathname + "(get)"), enqueue(desc.set, pathname + "(set)"));
        });
      }
      function markHardened(value) {
        weaksetAdd(hardened, value);
      }
      return enqueue(root3), setForEach(toFreeze, freezeAndTraverse), setForEach(toFreeze, markHardened), root3;
    } };
    return harden;
  });
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  let Error2, Date, apply, construct, defineProperties;
  $h\u200D_imports([["./commons.js", [["Error", [($h\u200D_a) => Error2 = $h\u200D_a]], ["Date", [($h\u200D_a) => Date = $h\u200D_a]], ["apply", [($h\u200D_a) => apply = $h\u200D_a]], ["construct", [($h\u200D_a) => construct = $h\u200D_a]], ["defineProperties", [($h\u200D_a) => defineProperties = $h\u200D_a]]]]]), $h\u200D_once.default(function(dateTaming = "safe") {
    if (dateTaming !== "safe" && dateTaming !== "unsafe")
      throw new Error2("unrecognized dateTaming " + dateTaming);
    const OriginalDate = Date, DatePrototype = OriginalDate.prototype, tamedMethods = { now: () => NaN }, makeDateConstructor = ({ powers = "none" } = {}) => {
      let ResultDate;
      return ResultDate = powers === "original" ? function(...rest) {
        return new.target === void 0 ? apply(OriginalDate, void 0, rest) : construct(OriginalDate, rest, new.target);
      } : function(...rest) {
        return new.target === void 0 ? "Invalid Date" : (rest.length === 0 && (rest = [NaN]), construct(OriginalDate, rest, new.target));
      }, defineProperties(ResultDate, { length: { value: 7 }, prototype: { value: DatePrototype, writable: false, enumerable: false, configurable: false }, parse: { value: Date.parse, writable: true, enumerable: false, configurable: true }, UTC: { value: Date.UTC, writable: true, enumerable: false, configurable: true } }), ResultDate;
    }, InitialDate = makeDateConstructor({ powers: "original" }), SharedDate = makeDateConstructor({ powers: "none" });
    return defineProperties(InitialDate, { now: { value: Date.now, writable: true, enumerable: false, configurable: true } }), defineProperties(SharedDate, { now: { value: tamedMethods.now, writable: true, enumerable: false, configurable: true } }), defineProperties(DatePrototype, { constructor: { value: SharedDate } }), { "%InitialDate%": InitialDate, "%SharedDate%": SharedDate };
  });
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  let FERAL_FUNCTION, SyntaxError2, TypeError2, defineProperties, getPrototypeOf, setPrototypeOf;
  $h\u200D_imports([["./commons.js", [["FERAL_FUNCTION", [($h\u200D_a) => FERAL_FUNCTION = $h\u200D_a]], ["SyntaxError", [($h\u200D_a) => SyntaxError2 = $h\u200D_a]], ["TypeError", [($h\u200D_a) => TypeError2 = $h\u200D_a]], ["defineProperties", [($h\u200D_a) => defineProperties = $h\u200D_a]], ["getPrototypeOf", [($h\u200D_a) => getPrototypeOf = $h\u200D_a]], ["setPrototypeOf", [($h\u200D_a) => setPrototypeOf = $h\u200D_a]]]]]), $h\u200D_once.default(function() {
    try {
      FERAL_FUNCTION.prototype.constructor("return 1");
    } catch (ignore) {
      return {};
    }
    const newIntrinsics = {};
    function repairFunction(name, intrinsicName, declaration) {
      let FunctionInstance;
      try {
        FunctionInstance = (0, eval)(declaration);
      } catch (e) {
        if (e instanceof SyntaxError2)
          return;
        throw e;
      }
      const FunctionPrototype = getPrototypeOf(FunctionInstance), InertConstructor = function() {
        throw new TypeError2("Function.prototype.constructor is not a valid constructor.");
      };
      defineProperties(InertConstructor, { prototype: { value: FunctionPrototype }, name: { value: name, writable: false, enumerable: false, configurable: true } }), defineProperties(FunctionPrototype, { constructor: { value: InertConstructor } }), InertConstructor !== FERAL_FUNCTION.prototype.constructor && setPrototypeOf(InertConstructor, FERAL_FUNCTION.prototype.constructor), newIntrinsics[intrinsicName] = InertConstructor;
    }
    return repairFunction("Function", "%InertFunction%", "(function(){})"), repairFunction("GeneratorFunction", "%InertGeneratorFunction%", "(function*(){})"), repairFunction("AsyncFunction", "%InertAsyncFunction%", "(async function(){})"), repairFunction("AsyncGeneratorFunction", "%InertAsyncGeneratorFunction%", "(async function*(){})"), newIntrinsics;
  });
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  let WeakSet2, defineProperty, freeze, functionPrototype, functionToString, stringEndsWith, weaksetAdd, weaksetHas;
  $h\u200D_imports([["./commons.js", [["WeakSet", [($h\u200D_a) => WeakSet2 = $h\u200D_a]], ["defineProperty", [($h\u200D_a) => defineProperty = $h\u200D_a]], ["freeze", [($h\u200D_a) => freeze = $h\u200D_a]], ["functionPrototype", [($h\u200D_a) => functionPrototype = $h\u200D_a]], ["functionToString", [($h\u200D_a) => functionToString = $h\u200D_a]], ["stringEndsWith", [($h\u200D_a) => stringEndsWith = $h\u200D_a]], ["weaksetAdd", [($h\u200D_a) => weaksetAdd = $h\u200D_a]], ["weaksetHas", [($h\u200D_a) => weaksetHas = $h\u200D_a]]]]]);
  let markVirtualizedNativeFunction;
  $h\u200D_once.tameFunctionToString(() => {
    if (markVirtualizedNativeFunction === void 0) {
      const virtualizedNativeFunctions = new WeakSet2();
      defineProperty(functionPrototype, "toString", { value: { toString() {
        const str = functionToString(this, []);
        return stringEndsWith(str, ") { [native code] }") || !weaksetHas(virtualizedNativeFunctions, this) ? str : `function ${this.name}() { [native code] }`;
      } }.toString }), markVirtualizedNativeFunction = freeze((func) => weaksetAdd(virtualizedNativeFunctions, func));
    }
    return markVirtualizedNativeFunction;
  });
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  let Error2, Object2, String2, TypeError2, getOwnPropertyNames, defineProperty, assert;
  $h\u200D_imports([["./commons.js", [["Error", [($h\u200D_a) => Error2 = $h\u200D_a]], ["Object", [($h\u200D_a) => Object2 = $h\u200D_a]], ["String", [($h\u200D_a) => String2 = $h\u200D_a]], ["TypeError", [($h\u200D_a) => TypeError2 = $h\u200D_a]], ["getOwnPropertyNames", [($h\u200D_a) => getOwnPropertyNames = $h\u200D_a]], ["defineProperty", [($h\u200D_a) => defineProperty = $h\u200D_a]]]], ["./error/assert.js", [["assert", [($h\u200D_a) => assert = $h\u200D_a]]]]]);
  const { details: d, quote: q } = assert, localePattern = /^(\w*[a-z])Locale([A-Z]\w*)$/, nonLocaleCompare = { localeCompare(that) {
    if (this == null)
      throw new TypeError2('Cannot localeCompare with null or undefined "this" value');
    const s = "" + this;
    return s < (that = "" + that) ? -1 : s > that ? 1 : (assert(s === that, d`expected ${q(s)} and ${q(that)} to compare`), 0);
  } }.localeCompare;
  $h\u200D_once.default(function(intrinsics, localeTaming = "safe") {
    if (localeTaming !== "safe" && localeTaming !== "unsafe")
      throw new Error2("unrecognized dateTaming " + localeTaming);
    if (localeTaming !== "unsafe") {
      defineProperty(String2.prototype, "localeCompare", { value: nonLocaleCompare });
      for (const intrinsicName of getOwnPropertyNames(intrinsics)) {
        const intrinsic = intrinsics[intrinsicName];
        if (intrinsic === Object2(intrinsic))
          for (const methodName of getOwnPropertyNames(intrinsic)) {
            const match = localePattern.exec(methodName);
            if (match) {
              assert(typeof intrinsic[methodName] == "function", d`expected ${q(methodName)} to be a function`);
              const nonLocaleMethodName = `${match[1]}${match[2]}`, method = intrinsic[nonLocaleMethodName];
              assert(typeof method == "function", d`function ${q(nonLocaleMethodName)} not found`), defineProperty(intrinsic, methodName, { value: method });
            }
          }
      }
    }
  });
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  let Error2, Math2, create3, getOwnPropertyDescriptors, objectPrototype;
  $h\u200D_imports([["./commons.js", [["Error", [($h\u200D_a) => Error2 = $h\u200D_a]], ["Math", [($h\u200D_a) => Math2 = $h\u200D_a]], ["create", [($h\u200D_a) => create3 = $h\u200D_a]], ["getOwnPropertyDescriptors", [($h\u200D_a) => getOwnPropertyDescriptors = $h\u200D_a]], ["objectPrototype", [($h\u200D_a) => objectPrototype = $h\u200D_a]]]]]), $h\u200D_once.default(function(mathTaming = "safe") {
    if (mathTaming !== "safe" && mathTaming !== "unsafe")
      throw new Error2("unrecognized mathTaming " + mathTaming);
    const originalMath = Math2, initialMath = originalMath, { random: _, ...otherDescriptors } = getOwnPropertyDescriptors(originalMath);
    return { "%InitialMath%": initialMath, "%SharedMath%": create3(objectPrototype, otherDescriptors) };
  });
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  let Error2, OriginalRegExp, construct, defineProperties, getOwnPropertyDescriptor, speciesSymbol;
  $h\u200D_imports([["./commons.js", [["Error", [($h\u200D_a) => Error2 = $h\u200D_a]], ["RegExp", [($h\u200D_a) => OriginalRegExp = $h\u200D_a]], ["construct", [($h\u200D_a) => construct = $h\u200D_a]], ["defineProperties", [($h\u200D_a) => defineProperties = $h\u200D_a]], ["getOwnPropertyDescriptor", [($h\u200D_a) => getOwnPropertyDescriptor = $h\u200D_a]], ["speciesSymbol", [($h\u200D_a) => speciesSymbol = $h\u200D_a]]]]]), $h\u200D_once.default(function(regExpTaming = "safe") {
    if (regExpTaming !== "safe" && regExpTaming !== "unsafe")
      throw new Error2("unrecognized regExpTaming " + regExpTaming);
    const RegExpPrototype = OriginalRegExp.prototype, makeRegExpConstructor = (_ = {}) => {
      const ResultRegExp = function(...rest) {
        return new.target === void 0 ? OriginalRegExp(...rest) : construct(OriginalRegExp, rest, new.target);
      };
      return defineProperties(ResultRegExp, { length: { value: 2 }, prototype: { value: RegExpPrototype, writable: false, enumerable: false, configurable: false }, [speciesSymbol]: getOwnPropertyDescriptor(OriginalRegExp, speciesSymbol) }), ResultRegExp;
    }, InitialRegExp = makeRegExpConstructor(), SharedRegExp = makeRegExpConstructor();
    return regExpTaming !== "unsafe" && delete RegExpPrototype.compile, defineProperties(RegExpPrototype, { constructor: { value: SharedRegExp } }), { "%InitialRegExp%": InitialRegExp, "%SharedRegExp%": SharedRegExp };
  });
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  let whitelist, FunctionInstance, isAccessorPermit, Error2, TypeError2, arrayIncludes, getOwnPropertyDescriptor, getPrototypeOf, isObject, objectHasOwnProperty, ownKeys;
  function asStringPropertyName(path, prop) {
    if (typeof prop == "string")
      return prop;
    if (typeof prop == "symbol")
      return "@@" + prop.toString().slice(14, -1);
    throw new TypeError2(`Unexpected property name type ${path} ${prop}`);
  }
  $h\u200D_imports([["./whitelist.js", [["whitelist", [($h\u200D_a) => whitelist = $h\u200D_a]], ["FunctionInstance", [($h\u200D_a) => FunctionInstance = $h\u200D_a]], ["isAccessorPermit", [($h\u200D_a) => isAccessorPermit = $h\u200D_a]]]], ["./commons.js", [["Error", [($h\u200D_a) => Error2 = $h\u200D_a]], ["TypeError", [($h\u200D_a) => TypeError2 = $h\u200D_a]], ["arrayIncludes", [($h\u200D_a) => arrayIncludes = $h\u200D_a]], ["getOwnPropertyDescriptor", [($h\u200D_a) => getOwnPropertyDescriptor = $h\u200D_a]], ["getPrototypeOf", [($h\u200D_a) => getPrototypeOf = $h\u200D_a]], ["isObject", [($h\u200D_a) => isObject = $h\u200D_a]], ["objectHasOwnProperty", [($h\u200D_a) => objectHasOwnProperty = $h\u200D_a]], ["ownKeys", [($h\u200D_a) => ownKeys = $h\u200D_a]]]]]), $h\u200D_once.default(function(intrinsics, markVirtualizedNativeFunction) {
    const primitives = ["undefined", "boolean", "number", "string", "symbol"];
    function isAllowedPropertyValue(path, value, prop, permit) {
      if (typeof permit == "object")
        return visitProperties(path, value, permit), true;
      if (permit === false)
        return false;
      if (typeof permit == "string") {
        if (prop === "prototype" || prop === "constructor") {
          if (objectHasOwnProperty(intrinsics, permit)) {
            if (value !== intrinsics[permit])
              throw new TypeError2("Does not match whitelist " + path);
            return true;
          }
        } else if (arrayIncludes(primitives, permit)) {
          if (typeof value !== permit)
            throw new TypeError2(`At ${path} expected ${permit} not ${typeof value}`);
          return true;
        }
      }
      throw new TypeError2(`Unexpected whitelist permit ${permit} at ${path}`);
    }
    function isAllowedProperty(path, obj, prop, permit) {
      const desc = getOwnPropertyDescriptor(obj, prop);
      if (objectHasOwnProperty(desc, "value")) {
        if (isAccessorPermit(permit))
          throw new TypeError2("Accessor expected at " + path);
        return isAllowedPropertyValue(path, desc.value, prop, permit);
      }
      if (!isAccessorPermit(permit))
        throw new TypeError2("Accessor not expected at " + path);
      return isAllowedPropertyValue(path + "<get>", desc.get, prop, permit.get) && isAllowedPropertyValue(path + "<set>", desc.set, prop, permit.set);
    }
    function getSubPermit(obj, permit, prop) {
      const permitProp = prop === "__proto__" ? "--proto--" : prop;
      return objectHasOwnProperty(permit, permitProp) ? permit[permitProp] : typeof obj == "function" && (markVirtualizedNativeFunction(obj), objectHasOwnProperty(FunctionInstance, permitProp)) ? FunctionInstance[permitProp] : void 0;
    }
    function visitProperties(path, obj, permit) {
      if (obj === void 0)
        return;
      !function(path2, obj2, protoName) {
        if (!isObject(obj2))
          throw new TypeError2(`Object expected: ${path2}, ${obj2}, ${protoName}`);
        const proto = getPrototypeOf(obj2);
        if (proto !== null || protoName !== null) {
          if (protoName !== void 0 && typeof protoName != "string")
            throw new TypeError2(`Malformed whitelist permit ${path2}.__proto__`);
          if (proto !== intrinsics[protoName || "%ObjectPrototype%"])
            throw new Error2(`Unexpected intrinsic ${path2}.__proto__ at ${protoName}`);
        }
      }(path, obj, permit["[[Proto]]"]);
      for (const prop of ownKeys(obj)) {
        const propString = asStringPropertyName(path, prop), subPath = `${path}.${propString}`, subPermit = getSubPermit(obj, permit, propString);
        if (!subPermit || !isAllowedProperty(subPath, obj, prop, subPermit)) {
          subPermit !== false && console.log("Removing " + subPath);
          try {
            delete obj[prop];
          } catch (err) {
            throw prop in obj ? console.error("failed to delete " + subPath, err) : console.error(`deleting ${subPath} threw`, err), err;
          }
        }
      }
    }
    visitProperties("intrinsics", intrinsics, whitelist);
  });
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  let globalThis2, is, keys4, ownKeys, makeHardener, makeIntrinsicsCollector, whitelistIntrinsics, tameFunctionConstructors, tameDateConstructor, tameMathObject, tameRegExpConstructor, enablePropertyOverrides, tameLocaleMethods, initGlobalObject, initialGlobalPropertyNames, tameFunctionToString, tameConsole, tameErrorConstructor, assert, makeAssert;
  $h\u200D_imports([["./commons.js", [["globalThis", [($h\u200D_a) => globalThis2 = $h\u200D_a]], ["is", [($h\u200D_a) => is = $h\u200D_a]], ["keys", [($h\u200D_a) => keys4 = $h\u200D_a]], ["ownKeys", [($h\u200D_a) => ownKeys = $h\u200D_a]]]], ["./make-hardener.js", [["makeHardener", [($h\u200D_a) => makeHardener = $h\u200D_a]]]], ["./intrinsics.js", [["makeIntrinsicsCollector", [($h\u200D_a) => makeIntrinsicsCollector = $h\u200D_a]]]], ["./whitelist-intrinsics.js", [["default", [($h\u200D_a) => whitelistIntrinsics = $h\u200D_a]]]], ["./tame-function-constructors.js", [["default", [($h\u200D_a) => tameFunctionConstructors = $h\u200D_a]]]], ["./tame-date-constructor.js", [["default", [($h\u200D_a) => tameDateConstructor = $h\u200D_a]]]], ["./tame-math-object.js", [["default", [($h\u200D_a) => tameMathObject = $h\u200D_a]]]], ["./tame-regexp-constructor.js", [["default", [($h\u200D_a) => tameRegExpConstructor = $h\u200D_a]]]], ["./enable-property-overrides.js", [["default", [($h\u200D_a) => enablePropertyOverrides = $h\u200D_a]]]], ["./tame-locale-methods.js", [["default", [($h\u200D_a) => tameLocaleMethods = $h\u200D_a]]]], ["./global-object.js", [["initGlobalObject", [($h\u200D_a) => initGlobalObject = $h\u200D_a]]]], ["./whitelist.js", [["initialGlobalPropertyNames", [($h\u200D_a) => initialGlobalPropertyNames = $h\u200D_a]]]], ["./tame-function-tostring.js", [["tameFunctionToString", [($h\u200D_a) => tameFunctionToString = $h\u200D_a]]]], ["./error/tame-console.js", [["tameConsole", [($h\u200D_a) => tameConsole = $h\u200D_a]]]], ["./error/tame-error-constructor.js", [["default", [($h\u200D_a) => tameErrorConstructor = $h\u200D_a]]]], ["./error/assert.js", [["assert", [($h\u200D_a) => assert = $h\u200D_a]], ["makeAssert", [($h\u200D_a) => makeAssert = $h\u200D_a]]]]]);
  const { details: d, quote: q } = assert;
  let firstOptions;
  const harden = makeHardener(), alreadyHardenedIntrinsics = () => false, repairIntrinsics = (makeCompartmentConstructor, compartmentPrototype, getAnonymousIntrinsics, options = {}) => {
    options = { ...firstOptions, ...options };
    const { dateTaming = "safe", errorTaming = "safe", mathTaming = "safe", errorTrapping = "platform", regExpTaming = "safe", localeTaming = "safe", consoleTaming = "safe", overrideTaming = "moderate", overrideDebug = [], stackFiltering = "concise", __allowUnsafeMonkeyPatching__ = "safe", ...extraOptions } = options, extraOptionsNames = ownKeys(extraOptions);
    if (assert(extraOptionsNames.length === 0, d`lockdown(): non supported option ${q(extraOptionsNames)}`), firstOptions) {
      for (const name of keys4(firstOptions))
        assert(options[name] === firstOptions[name], d`lockdown(): cannot re-invoke with different option ${q(name)}`);
      return alreadyHardenedIntrinsics;
    }
    firstOptions = { dateTaming, errorTaming, mathTaming, regExpTaming, localeTaming, consoleTaming, overrideTaming, overrideDebug, stackFiltering, __allowUnsafeMonkeyPatching__ };
    if (globalThis2.Function.prototype.constructor !== globalThis2.Function && typeof globalThis2.harden == "function" && typeof globalThis2.lockdown == "function" && globalThis2.Date.prototype.constructor !== globalThis2.Date && typeof globalThis2.Date.now == "function" && is(globalThis2.Date.prototype.constructor.now(), NaN))
      return console.log("Seems to already be locked down. Skipping second lockdown"), alreadyHardenedIntrinsics;
    const intrinsicsCollector = makeIntrinsicsCollector();
    intrinsicsCollector.addIntrinsics({ harden }), intrinsicsCollector.addIntrinsics(tameFunctionConstructors()), intrinsicsCollector.addIntrinsics(tameDateConstructor(dateTaming)), intrinsicsCollector.addIntrinsics(tameErrorConstructor(errorTaming, stackFiltering)), intrinsicsCollector.addIntrinsics(tameMathObject(mathTaming)), intrinsicsCollector.addIntrinsics(tameRegExpConstructor(regExpTaming)), intrinsicsCollector.addIntrinsics(getAnonymousIntrinsics()), intrinsicsCollector.completePrototypes();
    const intrinsics = intrinsicsCollector.finalIntrinsics();
    let optGetStackString;
    errorTaming !== "unsafe" && (optGetStackString = intrinsics["%InitialGetStackString%"]);
    const consoleRecord = tameConsole(consoleTaming, errorTrapping, optGetStackString);
    globalThis2.console = consoleRecord.console, errorTaming === "unsafe" && globalThis2.assert === assert && (globalThis2.assert = makeAssert(void 0, true)), tameLocaleMethods(intrinsics, localeTaming);
    const markVirtualizedNativeFunction = tameFunctionToString();
    return whitelistIntrinsics(intrinsics, markVirtualizedNativeFunction), initGlobalObject(globalThis2, intrinsics, initialGlobalPropertyNames, makeCompartmentConstructor, compartmentPrototype, { markVirtualizedNativeFunction }), function() {
      return enablePropertyOverrides(intrinsics, overrideTaming, overrideDebug), __allowUnsafeMonkeyPatching__ !== "unsafe" && harden(intrinsics), globalThis2.harden = harden, true;
    };
  };
  $h\u200D_once.repairIntrinsics(repairIntrinsics);
  $h\u200D_once.makeLockdown((makeCompartmentConstructor, compartmentPrototype, getAnonymousIntrinsics) => (options = {}) => repairIntrinsics(makeCompartmentConstructor, compartmentPrototype, getAnonymousIntrinsics, options)());
}, ({ imports: $h\u200D_imports, liveVar: $h\u200D_live, onceVar: $h\u200D_once }) => {
  let globalThis2, Error2, assign, tameFunctionToString, getGlobalIntrinsics, getAnonymousIntrinsics, makeLockdown, makeCompartmentConstructor, CompartmentPrototype, assert;
  if ($h\u200D_imports([["./src/commons.js", [["globalThis", [($h\u200D_a) => globalThis2 = $h\u200D_a]], ["Error", [($h\u200D_a) => Error2 = $h\u200D_a]], ["assign", [($h\u200D_a) => assign = $h\u200D_a]]]], ["./src/tame-function-tostring.js", [["tameFunctionToString", [($h\u200D_a) => tameFunctionToString = $h\u200D_a]]]], ["./src/intrinsics.js", [["getGlobalIntrinsics", [($h\u200D_a) => getGlobalIntrinsics = $h\u200D_a]]]], ["./src/get-anonymous-intrinsics.js", [["getAnonymousIntrinsics", [($h\u200D_a) => getAnonymousIntrinsics = $h\u200D_a]]]], ["./src/lockdown-shim.js", [["makeLockdown", [($h\u200D_a) => makeLockdown = $h\u200D_a]]]], ["./src/compartment-shim.js", [["makeCompartmentConstructor", [($h\u200D_a) => makeCompartmentConstructor = $h\u200D_a]], ["CompartmentPrototype", [($h\u200D_a) => CompartmentPrototype = $h\u200D_a]]]], ["./src/error/assert.js", [["assert", [($h\u200D_a) => assert = $h\u200D_a]]]]]), function() {
    return this;
  }())
    throw new Error2("SES failed to initialize, sloppy mode (SES_NO_SLOPPY)");
  const markVirtualizedNativeFunction = tameFunctionToString(), Compartment2 = makeCompartmentConstructor(makeCompartmentConstructor, getGlobalIntrinsics(globalThis2), markVirtualizedNativeFunction);
  assign(globalThis2, { lockdown: makeLockdown(makeCompartmentConstructor, CompartmentPrototype, getAnonymousIntrinsics), Compartment: Compartment2, assert });
}]);

// pkg/third_party/sourcemap/sourcemap.js
(function webpackUniversalModuleDefinition(root3, factory) {
  if (typeof exports === "object" && typeof module === "object") {
  } else if (typeof define === "function" && define.amd)
    define(["fs", "path"], factory);
  else if (typeof exports === "object") {
  } else
    root3["sourceMap"] = factory(root3["fs"], root3["path"]);
})(typeof self !== "undefined" ? self : globalThis, function(__WEBPACK_EXTERNAL_MODULE_10__, __WEBPACK_EXTERNAL_MODULE_11__) {
  return function(modules) {
    var installedModules = {};
    function __webpack_require__(moduleId) {
      if (installedModules[moduleId]) {
        return installedModules[moduleId].exports;
      }
      var module2 = installedModules[moduleId] = {
        i: moduleId,
        l: false,
        exports: {}
      };
      modules[moduleId].call(module2.exports, module2, module2.exports, __webpack_require__);
      module2.l = true;
      return module2.exports;
    }
    __webpack_require__.m = modules;
    __webpack_require__.c = installedModules;
    __webpack_require__.d = function(exports2, name, getter) {
      if (!__webpack_require__.o(exports2, name)) {
        Object.defineProperty(exports2, name, {
          configurable: false,
          enumerable: true,
          get: getter
        });
      }
    };
    __webpack_require__.n = function(module2) {
      var getter = module2 && module2.__esModule ? function getDefault() {
        return module2["default"];
      } : function getModuleExports() {
        return module2;
      };
      __webpack_require__.d(getter, "a", getter);
      return getter;
    };
    __webpack_require__.o = function(object, property) {
      return Object.prototype.hasOwnProperty.call(object, property);
    };
    __webpack_require__.p = "";
    return __webpack_require__(__webpack_require__.s = 5);
  }([
    function(module2, exports2) {
      function getArg(aArgs, aName, aDefaultValue) {
        if (aName in aArgs) {
          return aArgs[aName];
        } else if (arguments.length === 3) {
          return aDefaultValue;
        }
        throw new Error('"' + aName + '" is a required argument.');
      }
      exports2.getArg = getArg;
      const urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.-]*)(?::(\d+))?(.*)$/;
      const dataUrlRegexp = /^data:.+\,.+$/;
      function urlParse(aUrl) {
        const match = aUrl.match(urlRegexp);
        if (!match) {
          return null;
        }
        return {
          scheme: match[1],
          auth: match[2],
          host: match[3],
          port: match[4],
          path: match[5]
        };
      }
      exports2.urlParse = urlParse;
      function urlGenerate(aParsedUrl) {
        let url = "";
        if (aParsedUrl.scheme) {
          url += aParsedUrl.scheme + ":";
        }
        url += "//";
        if (aParsedUrl.auth) {
          url += aParsedUrl.auth + "@";
        }
        if (aParsedUrl.host) {
          url += aParsedUrl.host;
        }
        if (aParsedUrl.port) {
          url += ":" + aParsedUrl.port;
        }
        if (aParsedUrl.path) {
          url += aParsedUrl.path;
        }
        return url;
      }
      exports2.urlGenerate = urlGenerate;
      const MAX_CACHED_INPUTS = 32;
      function lruMemoize(f) {
        const cache = [];
        return function(input) {
          for (let i = 0; i < cache.length; i++) {
            if (cache[i].input === input) {
              const temp = cache[0];
              cache[0] = cache[i];
              cache[i] = temp;
              return cache[0].result;
            }
          }
          const result = f(input);
          cache.unshift({
            input,
            result
          });
          if (cache.length > MAX_CACHED_INPUTS) {
            cache.pop();
          }
          return result;
        };
      }
      const normalize = lruMemoize(function normalize2(aPath) {
        let path = aPath;
        const url = urlParse(aPath);
        if (url) {
          if (!url.path) {
            return aPath;
          }
          path = url.path;
        }
        const isAbsolute = exports2.isAbsolute(path);
        const parts = [];
        let start = 0;
        let i = 0;
        while (true) {
          start = i;
          i = path.indexOf("/", start);
          if (i === -1) {
            parts.push(path.slice(start));
            break;
          } else {
            parts.push(path.slice(start, i));
            while (i < path.length && path[i] === "/") {
              i++;
            }
          }
        }
        let up = 0;
        for (i = parts.length - 1; i >= 0; i--) {
          const part = parts[i];
          if (part === ".") {
            parts.splice(i, 1);
          } else if (part === "..") {
            up++;
          } else if (up > 0) {
            if (part === "") {
              parts.splice(i + 1, up);
              up = 0;
            } else {
              parts.splice(i, 2);
              up--;
            }
          }
        }
        path = parts.join("/");
        if (path === "") {
          path = isAbsolute ? "/" : ".";
        }
        if (url) {
          url.path = path;
          return urlGenerate(url);
        }
        return path;
      });
      exports2.normalize = normalize;
      function join(aRoot, aPath) {
        if (aRoot === "") {
          aRoot = ".";
        }
        if (aPath === "") {
          aPath = ".";
        }
        const aPathUrl = urlParse(aPath);
        const aRootUrl = urlParse(aRoot);
        if (aRootUrl) {
          aRoot = aRootUrl.path || "/";
        }
        if (aPathUrl && !aPathUrl.scheme) {
          if (aRootUrl) {
            aPathUrl.scheme = aRootUrl.scheme;
          }
          return urlGenerate(aPathUrl);
        }
        if (aPathUrl || aPath.match(dataUrlRegexp)) {
          return aPath;
        }
        if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
          aRootUrl.host = aPath;
          return urlGenerate(aRootUrl);
        }
        const joined = aPath.charAt(0) === "/" ? aPath : normalize(aRoot.replace(/\/+$/, "") + "/" + aPath);
        if (aRootUrl) {
          aRootUrl.path = joined;
          return urlGenerate(aRootUrl);
        }
        return joined;
      }
      exports2.join = join;
      exports2.isAbsolute = function(aPath) {
        return aPath.charAt(0) === "/" || urlRegexp.test(aPath);
      };
      function relative(aRoot, aPath) {
        if (aRoot === "") {
          aRoot = ".";
        }
        aRoot = aRoot.replace(/\/$/, "");
        let level = 0;
        while (aPath.indexOf(aRoot + "/") !== 0) {
          const index = aRoot.lastIndexOf("/");
          if (index < 0) {
            return aPath;
          }
          aRoot = aRoot.slice(0, index);
          if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
            return aPath;
          }
          ++level;
        }
        return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
      }
      exports2.relative = relative;
      const supportsNullProto = function() {
        const obj = /* @__PURE__ */ Object.create(null);
        return !("__proto__" in obj);
      }();
      function identity(s) {
        return s;
      }
      function toSetString(aStr) {
        if (isProtoString(aStr)) {
          return "$" + aStr;
        }
        return aStr;
      }
      exports2.toSetString = supportsNullProto ? identity : toSetString;
      function fromSetString(aStr) {
        if (isProtoString(aStr)) {
          return aStr.slice(1);
        }
        return aStr;
      }
      exports2.fromSetString = supportsNullProto ? identity : fromSetString;
      function isProtoString(s) {
        if (!s) {
          return false;
        }
        const length = s.length;
        if (length < 9) {
          return false;
        }
        if (s.charCodeAt(length - 1) !== 95 || s.charCodeAt(length - 2) !== 95 || s.charCodeAt(length - 3) !== 111 || s.charCodeAt(length - 4) !== 116 || s.charCodeAt(length - 5) !== 111 || s.charCodeAt(length - 6) !== 114 || s.charCodeAt(length - 7) !== 112 || s.charCodeAt(length - 8) !== 95 || s.charCodeAt(length - 9) !== 95) {
          return false;
        }
        for (let i = length - 10; i >= 0; i--) {
          if (s.charCodeAt(i) !== 36) {
            return false;
          }
        }
        return true;
      }
      function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
        let cmp = strcmp(mappingA.source, mappingB.source);
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.originalLine - mappingB.originalLine;
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.originalColumn - mappingB.originalColumn;
        if (cmp !== 0 || onlyCompareOriginal) {
          return cmp;
        }
        cmp = mappingA.generatedColumn - mappingB.generatedColumn;
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.generatedLine - mappingB.generatedLine;
        if (cmp !== 0) {
          return cmp;
        }
        return strcmp(mappingA.name, mappingB.name);
      }
      exports2.compareByOriginalPositions = compareByOriginalPositions;
      function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
        let cmp = mappingA.generatedLine - mappingB.generatedLine;
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.generatedColumn - mappingB.generatedColumn;
        if (cmp !== 0 || onlyCompareGenerated) {
          return cmp;
        }
        cmp = strcmp(mappingA.source, mappingB.source);
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.originalLine - mappingB.originalLine;
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.originalColumn - mappingB.originalColumn;
        if (cmp !== 0) {
          return cmp;
        }
        return strcmp(mappingA.name, mappingB.name);
      }
      exports2.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;
      function strcmp(aStr1, aStr2) {
        if (aStr1 === aStr2) {
          return 0;
        }
        if (aStr1 === null) {
          return 1;
        }
        if (aStr2 === null) {
          return -1;
        }
        if (aStr1 > aStr2) {
          return 1;
        }
        return -1;
      }
      function compareByGeneratedPositionsInflated(mappingA, mappingB) {
        let cmp = mappingA.generatedLine - mappingB.generatedLine;
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.generatedColumn - mappingB.generatedColumn;
        if (cmp !== 0) {
          return cmp;
        }
        cmp = strcmp(mappingA.source, mappingB.source);
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.originalLine - mappingB.originalLine;
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.originalColumn - mappingB.originalColumn;
        if (cmp !== 0) {
          return cmp;
        }
        return strcmp(mappingA.name, mappingB.name);
      }
      exports2.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;
      function parseSourceMapInput(str) {
        return JSON.parse(str.replace(/^\)]}'[^\n]*\n/, ""));
      }
      exports2.parseSourceMapInput = parseSourceMapInput;
      function computeSourceURL(sourceRoot, sourceURL, sourceMapURL) {
        sourceURL = sourceURL || "";
        if (sourceRoot) {
          if (sourceRoot[sourceRoot.length - 1] !== "/" && sourceURL[0] !== "/") {
            sourceRoot += "/";
          }
          sourceURL = sourceRoot + sourceURL;
        }
        if (sourceMapURL) {
          const parsed = urlParse(sourceMapURL);
          if (!parsed) {
            throw new Error("sourceMapURL could not be parsed");
          }
          if (parsed.path) {
            const index = parsed.path.lastIndexOf("/");
            if (index >= 0) {
              parsed.path = parsed.path.substring(0, index + 1);
            }
          }
          sourceURL = join(urlGenerate(parsed), sourceURL);
        }
        return normalize(sourceURL);
      }
      exports2.computeSourceURL = computeSourceURL;
    },
    function(module2, exports2, __webpack_require__) {
      const base64VLQ = __webpack_require__(2);
      const util = __webpack_require__(0);
      const ArraySet = __webpack_require__(3).ArraySet;
      const MappingList = __webpack_require__(7).MappingList;
      class SourceMapGenerator {
        constructor(aArgs) {
          if (!aArgs) {
            aArgs = {};
          }
          this._file = util.getArg(aArgs, "file", null);
          this._sourceRoot = util.getArg(aArgs, "sourceRoot", null);
          this._skipValidation = util.getArg(aArgs, "skipValidation", false);
          this._sources = new ArraySet();
          this._names = new ArraySet();
          this._mappings = new MappingList();
          this._sourcesContents = null;
        }
        static fromSourceMap(aSourceMapConsumer) {
          const sourceRoot = aSourceMapConsumer.sourceRoot;
          const generator = new SourceMapGenerator({
            file: aSourceMapConsumer.file,
            sourceRoot
          });
          aSourceMapConsumer.eachMapping(function(mapping) {
            const newMapping = {
              generated: {
                line: mapping.generatedLine,
                column: mapping.generatedColumn
              }
            };
            if (mapping.source != null) {
              newMapping.source = mapping.source;
              if (sourceRoot != null) {
                newMapping.source = util.relative(sourceRoot, newMapping.source);
              }
              newMapping.original = {
                line: mapping.originalLine,
                column: mapping.originalColumn
              };
              if (mapping.name != null) {
                newMapping.name = mapping.name;
              }
            }
            generator.addMapping(newMapping);
          });
          aSourceMapConsumer.sources.forEach(function(sourceFile) {
            let sourceRelative = sourceFile;
            if (sourceRoot !== null) {
              sourceRelative = util.relative(sourceRoot, sourceFile);
            }
            if (!generator._sources.has(sourceRelative)) {
              generator._sources.add(sourceRelative);
            }
            const content = aSourceMapConsumer.sourceContentFor(sourceFile);
            if (content != null) {
              generator.setSourceContent(sourceFile, content);
            }
          });
          return generator;
        }
        addMapping(aArgs) {
          const generated = util.getArg(aArgs, "generated");
          const original = util.getArg(aArgs, "original", null);
          let source = util.getArg(aArgs, "source", null);
          let name = util.getArg(aArgs, "name", null);
          if (!this._skipValidation) {
            this._validateMapping(generated, original, source, name);
          }
          if (source != null) {
            source = String(source);
            if (!this._sources.has(source)) {
              this._sources.add(source);
            }
          }
          if (name != null) {
            name = String(name);
            if (!this._names.has(name)) {
              this._names.add(name);
            }
          }
          this._mappings.add({
            generatedLine: generated.line,
            generatedColumn: generated.column,
            originalLine: original != null && original.line,
            originalColumn: original != null && original.column,
            source,
            name
          });
        }
        setSourceContent(aSourceFile, aSourceContent) {
          let source = aSourceFile;
          if (this._sourceRoot != null) {
            source = util.relative(this._sourceRoot, source);
          }
          if (aSourceContent != null) {
            if (!this._sourcesContents) {
              this._sourcesContents = /* @__PURE__ */ Object.create(null);
            }
            this._sourcesContents[util.toSetString(source)] = aSourceContent;
          } else if (this._sourcesContents) {
            delete this._sourcesContents[util.toSetString(source)];
            if (Object.keys(this._sourcesContents).length === 0) {
              this._sourcesContents = null;
            }
          }
        }
        applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
          let sourceFile = aSourceFile;
          if (aSourceFile == null) {
            if (aSourceMapConsumer.file == null) {
              throw new Error(`SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, or the source map's "file" property. Both were omitted.`);
            }
            sourceFile = aSourceMapConsumer.file;
          }
          const sourceRoot = this._sourceRoot;
          if (sourceRoot != null) {
            sourceFile = util.relative(sourceRoot, sourceFile);
          }
          const newSources = this._mappings.toArray().length > 0 ? new ArraySet() : this._sources;
          const newNames = new ArraySet();
          this._mappings.unsortedForEach(function(mapping) {
            if (mapping.source === sourceFile && mapping.originalLine != null) {
              const original = aSourceMapConsumer.originalPositionFor({
                line: mapping.originalLine,
                column: mapping.originalColumn
              });
              if (original.source != null) {
                mapping.source = original.source;
                if (aSourceMapPath != null) {
                  mapping.source = util.join(aSourceMapPath, mapping.source);
                }
                if (sourceRoot != null) {
                  mapping.source = util.relative(sourceRoot, mapping.source);
                }
                mapping.originalLine = original.line;
                mapping.originalColumn = original.column;
                if (original.name != null) {
                  mapping.name = original.name;
                }
              }
            }
            const source = mapping.source;
            if (source != null && !newSources.has(source)) {
              newSources.add(source);
            }
            const name = mapping.name;
            if (name != null && !newNames.has(name)) {
              newNames.add(name);
            }
          }, this);
          this._sources = newSources;
          this._names = newNames;
          aSourceMapConsumer.sources.forEach(function(srcFile) {
            const content = aSourceMapConsumer.sourceContentFor(srcFile);
            if (content != null) {
              if (aSourceMapPath != null) {
                srcFile = util.join(aSourceMapPath, srcFile);
              }
              if (sourceRoot != null) {
                srcFile = util.relative(sourceRoot, srcFile);
              }
              this.setSourceContent(srcFile, content);
            }
          }, this);
        }
        _validateMapping(aGenerated, aOriginal, aSource, aName) {
          if (aOriginal && typeof aOriginal.line !== "number" && typeof aOriginal.column !== "number") {
            throw new Error("original.line and original.column are not numbers -- you probably meant to omit the original mapping entirely and only map the generated position. If so, pass null for the original mapping instead of an object with empty or null values.");
          }
          if (aGenerated && "line" in aGenerated && "column" in aGenerated && aGenerated.line > 0 && aGenerated.column >= 0 && !aOriginal && !aSource && !aName) {
          } else if (aGenerated && "line" in aGenerated && "column" in aGenerated && aOriginal && "line" in aOriginal && "column" in aOriginal && aGenerated.line > 0 && aGenerated.column >= 0 && aOriginal.line > 0 && aOriginal.column >= 0 && aSource) {
          } else {
            throw new Error("Invalid mapping: " + JSON.stringify({
              generated: aGenerated,
              source: aSource,
              original: aOriginal,
              name: aName
            }));
          }
        }
        _serializeMappings() {
          let previousGeneratedColumn = 0;
          let previousGeneratedLine = 1;
          let previousOriginalColumn = 0;
          let previousOriginalLine = 0;
          let previousName = 0;
          let previousSource = 0;
          let result = "";
          let next;
          let mapping;
          let nameIdx;
          let sourceIdx;
          const mappings = this._mappings.toArray();
          for (let i = 0, len = mappings.length; i < len; i++) {
            mapping = mappings[i];
            next = "";
            if (mapping.generatedLine !== previousGeneratedLine) {
              previousGeneratedColumn = 0;
              while (mapping.generatedLine !== previousGeneratedLine) {
                next += ";";
                previousGeneratedLine++;
              }
            } else if (i > 0) {
              if (!util.compareByGeneratedPositionsInflated(mapping, mappings[i - 1])) {
                continue;
              }
              next += ",";
            }
            next += base64VLQ.encode(mapping.generatedColumn - previousGeneratedColumn);
            previousGeneratedColumn = mapping.generatedColumn;
            if (mapping.source != null) {
              sourceIdx = this._sources.indexOf(mapping.source);
              next += base64VLQ.encode(sourceIdx - previousSource);
              previousSource = sourceIdx;
              next += base64VLQ.encode(mapping.originalLine - 1 - previousOriginalLine);
              previousOriginalLine = mapping.originalLine - 1;
              next += base64VLQ.encode(mapping.originalColumn - previousOriginalColumn);
              previousOriginalColumn = mapping.originalColumn;
              if (mapping.name != null) {
                nameIdx = this._names.indexOf(mapping.name);
                next += base64VLQ.encode(nameIdx - previousName);
                previousName = nameIdx;
              }
            }
            result += next;
          }
          return result;
        }
        _generateSourcesContent(aSources, aSourceRoot) {
          return aSources.map(function(source) {
            if (!this._sourcesContents) {
              return null;
            }
            if (aSourceRoot != null) {
              source = util.relative(aSourceRoot, source);
            }
            const key2 = util.toSetString(source);
            return Object.prototype.hasOwnProperty.call(this._sourcesContents, key2) ? this._sourcesContents[key2] : null;
          }, this);
        }
        toJSON() {
          const map = {
            version: this._version,
            sources: this._sources.toArray(),
            names: this._names.toArray(),
            mappings: this._serializeMappings()
          };
          if (this._file != null) {
            map.file = this._file;
          }
          if (this._sourceRoot != null) {
            map.sourceRoot = this._sourceRoot;
          }
          if (this._sourcesContents) {
            map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
          }
          return map;
        }
        toString() {
          return JSON.stringify(this.toJSON());
        }
      }
      SourceMapGenerator.prototype._version = 3;
      exports2.SourceMapGenerator = SourceMapGenerator;
    },
    function(module2, exports2, __webpack_require__) {
      const base64 = __webpack_require__(6);
      const VLQ_BASE_SHIFT = 5;
      const VLQ_BASE = 1 << VLQ_BASE_SHIFT;
      const VLQ_BASE_MASK = VLQ_BASE - 1;
      const VLQ_CONTINUATION_BIT = VLQ_BASE;
      function toVLQSigned(aValue) {
        return aValue < 0 ? (-aValue << 1) + 1 : (aValue << 1) + 0;
      }
      function fromVLQSigned(aValue) {
        const isNegative = (aValue & 1) === 1;
        const shifted = aValue >> 1;
        return isNegative ? -shifted : shifted;
      }
      exports2.encode = function base64VLQ_encode(aValue) {
        let encoded = "";
        let digit;
        let vlq = toVLQSigned(aValue);
        do {
          digit = vlq & VLQ_BASE_MASK;
          vlq >>>= VLQ_BASE_SHIFT;
          if (vlq > 0) {
            digit |= VLQ_CONTINUATION_BIT;
          }
          encoded += base64.encode(digit);
        } while (vlq > 0);
        return encoded;
      };
    },
    function(module2, exports2) {
      class ArraySet {
        constructor() {
          this._array = [];
          this._set = /* @__PURE__ */ new Map();
        }
        static fromArray(aArray, aAllowDuplicates) {
          const set = new ArraySet();
          for (let i = 0, len = aArray.length; i < len; i++) {
            set.add(aArray[i], aAllowDuplicates);
          }
          return set;
        }
        size() {
          return this._set.size;
        }
        add(aStr, aAllowDuplicates) {
          const isDuplicate = this.has(aStr);
          const idx = this._array.length;
          if (!isDuplicate || aAllowDuplicates) {
            this._array.push(aStr);
          }
          if (!isDuplicate) {
            this._set.set(aStr, idx);
          }
        }
        has(aStr) {
          return this._set.has(aStr);
        }
        indexOf(aStr) {
          const idx = this._set.get(aStr);
          if (idx >= 0) {
            return idx;
          }
          throw new Error('"' + aStr + '" is not in the set.');
        }
        at(aIdx) {
          if (aIdx >= 0 && aIdx < this._array.length) {
            return this._array[aIdx];
          }
          throw new Error("No element indexed by " + aIdx);
        }
        toArray() {
          return this._array.slice();
        }
      }
      exports2.ArraySet = ArraySet;
    },
    function(module2, exports2, __webpack_require__) {
      (function(__dirname) {
        if (typeof fetch === "function") {
          let mappingsWasmUrl = null;
          module2.exports = function readWasm() {
            if (typeof mappingsWasmUrl !== "string") {
              throw new Error("You must provide the URL of lib/mappings.wasm by calling SourceMapConsumer.initialize({ 'lib/mappings.wasm': ... }) before using SourceMapConsumer");
            }
            return fetch(mappingsWasmUrl).then((response) => response.arrayBuffer());
          };
          module2.exports.initialize = (url) => mappingsWasmUrl = url;
        } else {
          const fs = __webpack_require__(10);
          const path = __webpack_require__(11);
          module2.exports = function readWasm() {
            return new Promise((resolve2, reject) => {
              const wasmPath = path.join(__dirname, "mappings.wasm");
              fs.readFile(wasmPath, null, (error, data) => {
                if (error) {
                  reject(error);
                  return;
                }
                resolve2(data.buffer);
              });
            });
          };
          module2.exports.initialize = (_) => {
            console.debug("SourceMapConsumer.initialize is a no-op when running in node.js");
          };
        }
      }).call(exports2, "/");
    },
    function(module2, exports2, __webpack_require__) {
      exports2.SourceMapGenerator = __webpack_require__(1).SourceMapGenerator;
      exports2.SourceMapConsumer = __webpack_require__(8).SourceMapConsumer;
      exports2.SourceNode = __webpack_require__(13).SourceNode;
    },
    function(module2, exports2) {
      const intToCharMap = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
      exports2.encode = function(number) {
        if (0 <= number && number < intToCharMap.length) {
          return intToCharMap[number];
        }
        throw new TypeError("Must be between 0 and 63: " + number);
      };
    },
    function(module2, exports2, __webpack_require__) {
      const util = __webpack_require__(0);
      function generatedPositionAfter(mappingA, mappingB) {
        const lineA = mappingA.generatedLine;
        const lineB = mappingB.generatedLine;
        const columnA = mappingA.generatedColumn;
        const columnB = mappingB.generatedColumn;
        return lineB > lineA || lineB == lineA && columnB >= columnA || util.compareByGeneratedPositionsInflated(mappingA, mappingB) <= 0;
      }
      class MappingList {
        constructor() {
          this._array = [];
          this._sorted = true;
          this._last = { generatedLine: -1, generatedColumn: 0 };
        }
        unsortedForEach(aCallback, aThisArg) {
          this._array.forEach(aCallback, aThisArg);
        }
        add(aMapping) {
          if (generatedPositionAfter(this._last, aMapping)) {
            this._last = aMapping;
            this._array.push(aMapping);
          } else {
            this._sorted = false;
            this._array.push(aMapping);
          }
        }
        toArray() {
          if (!this._sorted) {
            this._array.sort(util.compareByGeneratedPositionsInflated);
            this._sorted = true;
          }
          return this._array;
        }
      }
      exports2.MappingList = MappingList;
    },
    function(module2, exports2, __webpack_require__) {
      const util = __webpack_require__(0);
      const binarySearch = __webpack_require__(9);
      const ArraySet = __webpack_require__(3).ArraySet;
      const base64VLQ = __webpack_require__(2);
      const readWasm = __webpack_require__(4);
      const wasm = __webpack_require__(12);
      const INTERNAL = Symbol("smcInternal");
      class SourceMapConsumer {
        constructor(aSourceMap, aSourceMapURL) {
          if (aSourceMap == INTERNAL) {
            return Promise.resolve(this);
          }
          return _factory(aSourceMap, aSourceMapURL);
        }
        static initialize(opts) {
          readWasm.initialize(opts["lib/mappings.wasm"]);
        }
        static fromSourceMap(aSourceMap, aSourceMapURL) {
          return _factoryBSM(aSourceMap, aSourceMapURL);
        }
        static with(rawSourceMap, sourceMapUrl, f) {
          let consumer = null;
          const promise = new SourceMapConsumer(rawSourceMap, sourceMapUrl);
          return promise.then((c) => {
            consumer = c;
            return f(c);
          }).then((x) => {
            if (consumer) {
              consumer.destroy();
            }
            return x;
          }, (e) => {
            if (consumer) {
              consumer.destroy();
            }
            throw e;
          });
        }
        _parseMappings(aStr, aSourceRoot) {
          throw new Error("Subclasses must implement _parseMappings");
        }
        eachMapping(aCallback, aContext, aOrder) {
          throw new Error("Subclasses must implement eachMapping");
        }
        allGeneratedPositionsFor(aArgs) {
          throw new Error("Subclasses must implement allGeneratedPositionsFor");
        }
        destroy() {
          throw new Error("Subclasses must implement destroy");
        }
      }
      SourceMapConsumer.prototype._version = 3;
      SourceMapConsumer.GENERATED_ORDER = 1;
      SourceMapConsumer.ORIGINAL_ORDER = 2;
      SourceMapConsumer.GREATEST_LOWER_BOUND = 1;
      SourceMapConsumer.LEAST_UPPER_BOUND = 2;
      exports2.SourceMapConsumer = SourceMapConsumer;
      class BasicSourceMapConsumer extends SourceMapConsumer {
        constructor(aSourceMap, aSourceMapURL) {
          return super(INTERNAL).then((that) => {
            let sourceMap2 = aSourceMap;
            if (typeof aSourceMap === "string") {
              sourceMap2 = util.parseSourceMapInput(aSourceMap);
            }
            const version = util.getArg(sourceMap2, "version");
            let sources = util.getArg(sourceMap2, "sources");
            const names = util.getArg(sourceMap2, "names", []);
            let sourceRoot = util.getArg(sourceMap2, "sourceRoot", null);
            const sourcesContent = util.getArg(sourceMap2, "sourcesContent", null);
            const mappings = util.getArg(sourceMap2, "mappings");
            const file = util.getArg(sourceMap2, "file", null);
            if (version != that._version) {
              throw new Error("Unsupported version: " + version);
            }
            if (sourceRoot) {
              sourceRoot = util.normalize(sourceRoot);
            }
            sources = sources.map(String).map(util.normalize).map(function(source) {
              return sourceRoot && util.isAbsolute(sourceRoot) && util.isAbsolute(source) ? util.relative(sourceRoot, source) : source;
            });
            that._names = ArraySet.fromArray(names.map(String), true);
            that._sources = ArraySet.fromArray(sources, true);
            that._absoluteSources = that._sources.toArray().map(function(s) {
              return util.computeSourceURL(sourceRoot, s, aSourceMapURL);
            });
            that.sourceRoot = sourceRoot;
            that.sourcesContent = sourcesContent;
            that._mappings = mappings;
            that._sourceMapURL = aSourceMapURL;
            that.file = file;
            that._computedColumnSpans = false;
            that._mappingsPtr = 0;
            that._wasm = null;
            return wasm().then((w) => {
              that._wasm = w;
              return that;
            });
          });
        }
        _findSourceIndex(aSource) {
          let relativeSource = aSource;
          if (this.sourceRoot != null) {
            relativeSource = util.relative(this.sourceRoot, relativeSource);
          }
          if (this._sources.has(relativeSource)) {
            return this._sources.indexOf(relativeSource);
          }
          for (let i = 0; i < this._absoluteSources.length; ++i) {
            if (this._absoluteSources[i] == aSource) {
              return i;
            }
          }
          return -1;
        }
        static fromSourceMap(aSourceMap, aSourceMapURL) {
          return new BasicSourceMapConsumer(aSourceMap.toString());
        }
        get sources() {
          return this._absoluteSources.slice();
        }
        _getMappingsPtr() {
          if (this._mappingsPtr === 0) {
            this._parseMappings(this._mappings, this.sourceRoot);
          }
          return this._mappingsPtr;
        }
        _parseMappings(aStr, aSourceRoot) {
          const size = aStr.length;
          const mappingsBufPtr = this._wasm.exports.allocate_mappings(size);
          const mappingsBuf = new Uint8Array(this._wasm.exports.memory.buffer, mappingsBufPtr, size);
          for (let i = 0; i < size; i++) {
            mappingsBuf[i] = aStr.charCodeAt(i);
          }
          const mappingsPtr = this._wasm.exports.parse_mappings(mappingsBufPtr);
          if (!mappingsPtr) {
            const error = this._wasm.exports.get_last_error();
            let msg = `Error parsing mappings (code ${error}): `;
            switch (error) {
              case 1:
                msg += "the mappings contained a negative line, column, source index, or name index";
                break;
              case 2:
                msg += "the mappings contained a number larger than 2**32";
                break;
              case 3:
                msg += "reached EOF while in the middle of parsing a VLQ";
                break;
              case 4:
                msg += "invalid base 64 character while parsing a VLQ";
                break;
              default:
                msg += "unknown error code";
                break;
            }
            throw new Error(msg);
          }
          this._mappingsPtr = mappingsPtr;
        }
        eachMapping(aCallback, aContext, aOrder) {
          const context = aContext || null;
          const order = aOrder || SourceMapConsumer.GENERATED_ORDER;
          const sourceRoot = this.sourceRoot;
          this._wasm.withMappingCallback((mapping) => {
            if (mapping.source !== null) {
              mapping.source = this._sources.at(mapping.source);
              mapping.source = util.computeSourceURL(sourceRoot, mapping.source, this._sourceMapURL);
              if (mapping.name !== null) {
                mapping.name = this._names.at(mapping.name);
              }
            }
            aCallback.call(context, mapping);
          }, () => {
            switch (order) {
              case SourceMapConsumer.GENERATED_ORDER:
                this._wasm.exports.by_generated_location(this._getMappingsPtr());
                break;
              case SourceMapConsumer.ORIGINAL_ORDER:
                this._wasm.exports.by_original_location(this._getMappingsPtr());
                break;
              default:
                throw new Error("Unknown order of iteration.");
            }
          });
        }
        allGeneratedPositionsFor(aArgs) {
          let source = util.getArg(aArgs, "source");
          const originalLine = util.getArg(aArgs, "line");
          const originalColumn = aArgs.column || 0;
          source = this._findSourceIndex(source);
          if (source < 0) {
            return [];
          }
          if (originalLine < 1) {
            throw new Error("Line numbers must be >= 1");
          }
          if (originalColumn < 0) {
            throw new Error("Column numbers must be >= 0");
          }
          const mappings = [];
          this._wasm.withMappingCallback((m) => {
            let lastColumn = m.lastGeneratedColumn;
            if (this._computedColumnSpans && lastColumn === null) {
              lastColumn = Infinity;
            }
            mappings.push({
              line: m.generatedLine,
              column: m.generatedColumn,
              lastColumn
            });
          }, () => {
            this._wasm.exports.all_generated_locations_for(this._getMappingsPtr(), source, originalLine - 1, "column" in aArgs, originalColumn);
          });
          return mappings;
        }
        destroy() {
          if (this._mappingsPtr !== 0) {
            this._wasm.exports.free_mappings(this._mappingsPtr);
            this._mappingsPtr = 0;
          }
        }
        computeColumnSpans() {
          if (this._computedColumnSpans) {
            return;
          }
          this._wasm.exports.compute_column_spans(this._getMappingsPtr());
          this._computedColumnSpans = true;
        }
        originalPositionFor(aArgs) {
          const needle = {
            generatedLine: util.getArg(aArgs, "line"),
            generatedColumn: util.getArg(aArgs, "column")
          };
          if (needle.generatedLine < 1) {
            throw new Error("Line numbers must be >= 1");
          }
          if (needle.generatedColumn < 0) {
            throw new Error("Column numbers must be >= 0");
          }
          let bias = util.getArg(aArgs, "bias", SourceMapConsumer.GREATEST_LOWER_BOUND);
          if (bias == null) {
            bias = SourceMapConsumer.GREATEST_LOWER_BOUND;
          }
          let mapping;
          this._wasm.withMappingCallback((m) => mapping = m, () => {
            this._wasm.exports.original_location_for(this._getMappingsPtr(), needle.generatedLine - 1, needle.generatedColumn, bias);
          });
          if (mapping) {
            if (mapping.generatedLine === needle.generatedLine) {
              let source = util.getArg(mapping, "source", null);
              if (source !== null) {
                source = this._sources.at(source);
                source = util.computeSourceURL(this.sourceRoot, source, this._sourceMapURL);
              }
              let name = util.getArg(mapping, "name", null);
              if (name !== null) {
                name = this._names.at(name);
              }
              return {
                source,
                line: util.getArg(mapping, "originalLine", null),
                column: util.getArg(mapping, "originalColumn", null),
                name
              };
            }
          }
          return {
            source: null,
            line: null,
            column: null,
            name: null
          };
        }
        hasContentsOfAllSources() {
          if (!this.sourcesContent) {
            return false;
          }
          return this.sourcesContent.length >= this._sources.size() && !this.sourcesContent.some(function(sc) {
            return sc == null;
          });
        }
        sourceContentFor(aSource, nullOnMissing) {
          if (!this.sourcesContent) {
            return null;
          }
          const index = this._findSourceIndex(aSource);
          if (index >= 0) {
            return this.sourcesContent[index];
          }
          let relativeSource = aSource;
          if (this.sourceRoot != null) {
            relativeSource = util.relative(this.sourceRoot, relativeSource);
          }
          let url;
          if (this.sourceRoot != null && (url = util.urlParse(this.sourceRoot))) {
            const fileUriAbsPath = relativeSource.replace(/^file:\/\//, "");
            if (url.scheme == "file" && this._sources.has(fileUriAbsPath)) {
              return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)];
            }
            if ((!url.path || url.path == "/") && this._sources.has("/" + relativeSource)) {
              return this.sourcesContent[this._sources.indexOf("/" + relativeSource)];
            }
          }
          if (nullOnMissing) {
            return null;
          }
          throw new Error('"' + relativeSource + '" is not in the SourceMap.');
        }
        generatedPositionFor(aArgs) {
          let source = util.getArg(aArgs, "source");
          source = this._findSourceIndex(source);
          if (source < 0) {
            return {
              line: null,
              column: null,
              lastColumn: null
            };
          }
          const needle = {
            source,
            originalLine: util.getArg(aArgs, "line"),
            originalColumn: util.getArg(aArgs, "column")
          };
          if (needle.originalLine < 1) {
            throw new Error("Line numbers must be >= 1");
          }
          if (needle.originalColumn < 0) {
            throw new Error("Column numbers must be >= 0");
          }
          let bias = util.getArg(aArgs, "bias", SourceMapConsumer.GREATEST_LOWER_BOUND);
          if (bias == null) {
            bias = SourceMapConsumer.GREATEST_LOWER_BOUND;
          }
          let mapping;
          this._wasm.withMappingCallback((m) => mapping = m, () => {
            this._wasm.exports.generated_location_for(this._getMappingsPtr(), needle.source, needle.originalLine - 1, needle.originalColumn, bias);
          });
          if (mapping) {
            if (mapping.source === needle.source) {
              let lastColumn = mapping.lastGeneratedColumn;
              if (this._computedColumnSpans && lastColumn === null) {
                lastColumn = Infinity;
              }
              return {
                line: util.getArg(mapping, "generatedLine", null),
                column: util.getArg(mapping, "generatedColumn", null),
                lastColumn
              };
            }
          }
          return {
            line: null,
            column: null,
            lastColumn: null
          };
        }
      }
      BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer;
      exports2.BasicSourceMapConsumer = BasicSourceMapConsumer;
      class IndexedSourceMapConsumer extends SourceMapConsumer {
        constructor(aSourceMap, aSourceMapURL) {
          return super(INTERNAL).then((that) => {
            let sourceMap2 = aSourceMap;
            if (typeof aSourceMap === "string") {
              sourceMap2 = util.parseSourceMapInput(aSourceMap);
            }
            const version = util.getArg(sourceMap2, "version");
            const sections = util.getArg(sourceMap2, "sections");
            if (version != that._version) {
              throw new Error("Unsupported version: " + version);
            }
            that._sources = new ArraySet();
            that._names = new ArraySet();
            that.__generatedMappings = null;
            that.__originalMappings = null;
            that.__generatedMappingsUnsorted = null;
            that.__originalMappingsUnsorted = null;
            let lastOffset = {
              line: -1,
              column: 0
            };
            return Promise.all(sections.map((s) => {
              if (s.url) {
                throw new Error("Support for url field in sections not implemented.");
              }
              const offset = util.getArg(s, "offset");
              const offsetLine = util.getArg(offset, "line");
              const offsetColumn = util.getArg(offset, "column");
              if (offsetLine < lastOffset.line || offsetLine === lastOffset.line && offsetColumn < lastOffset.column) {
                throw new Error("Section offsets must be ordered and non-overlapping.");
              }
              lastOffset = offset;
              const cons = new SourceMapConsumer(util.getArg(s, "map"), aSourceMapURL);
              return cons.then((consumer) => {
                return {
                  generatedOffset: {
                    generatedLine: offsetLine + 1,
                    generatedColumn: offsetColumn + 1
                  },
                  consumer
                };
              });
            })).then((s) => {
              that._sections = s;
              return that;
            });
          });
        }
        get _generatedMappings() {
          if (!this.__generatedMappings) {
            this._sortGeneratedMappings();
          }
          return this.__generatedMappings;
        }
        get _originalMappings() {
          if (!this.__originalMappings) {
            this._sortOriginalMappings();
          }
          return this.__originalMappings;
        }
        get _generatedMappingsUnsorted() {
          if (!this.__generatedMappingsUnsorted) {
            this._parseMappings(this._mappings, this.sourceRoot);
          }
          return this.__generatedMappingsUnsorted;
        }
        get _originalMappingsUnsorted() {
          if (!this.__originalMappingsUnsorted) {
            this._parseMappings(this._mappings, this.sourceRoot);
          }
          return this.__originalMappingsUnsorted;
        }
        _sortGeneratedMappings() {
          const mappings = this._generatedMappingsUnsorted;
          mappings.sort(util.compareByGeneratedPositionsDeflated);
          this.__generatedMappings = mappings;
        }
        _sortOriginalMappings() {
          const mappings = this._originalMappingsUnsorted;
          mappings.sort(util.compareByOriginalPositions);
          this.__originalMappings = mappings;
        }
        get sources() {
          const sources = [];
          for (let i = 0; i < this._sections.length; i++) {
            for (let j = 0; j < this._sections[i].consumer.sources.length; j++) {
              sources.push(this._sections[i].consumer.sources[j]);
            }
          }
          return sources;
        }
        originalPositionFor(aArgs) {
          const needle = {
            generatedLine: util.getArg(aArgs, "line"),
            generatedColumn: util.getArg(aArgs, "column")
          };
          const sectionIndex = binarySearch.search(needle, this._sections, function(aNeedle, section2) {
            const cmp = aNeedle.generatedLine - section2.generatedOffset.generatedLine;
            if (cmp) {
              return cmp;
            }
            return aNeedle.generatedColumn - section2.generatedOffset.generatedColumn;
          });
          const section = this._sections[sectionIndex];
          if (!section) {
            return {
              source: null,
              line: null,
              column: null,
              name: null
            };
          }
          return section.consumer.originalPositionFor({
            line: needle.generatedLine - (section.generatedOffset.generatedLine - 1),
            column: needle.generatedColumn - (section.generatedOffset.generatedLine === needle.generatedLine ? section.generatedOffset.generatedColumn - 1 : 0),
            bias: aArgs.bias
          });
        }
        hasContentsOfAllSources() {
          return this._sections.every(function(s) {
            return s.consumer.hasContentsOfAllSources();
          });
        }
        sourceContentFor(aSource, nullOnMissing) {
          for (let i = 0; i < this._sections.length; i++) {
            const section = this._sections[i];
            const content = section.consumer.sourceContentFor(aSource, true);
            if (content) {
              return content;
            }
          }
          if (nullOnMissing) {
            return null;
          }
          throw new Error('"' + aSource + '" is not in the SourceMap.');
        }
        generatedPositionFor(aArgs) {
          for (let i = 0; i < this._sections.length; i++) {
            const section = this._sections[i];
            if (section.consumer._findSourceIndex(util.getArg(aArgs, "source")) === -1) {
              continue;
            }
            const generatedPosition = section.consumer.generatedPositionFor(aArgs);
            if (generatedPosition) {
              const ret = {
                line: generatedPosition.line + (section.generatedOffset.generatedLine - 1),
                column: generatedPosition.column + (section.generatedOffset.generatedLine === generatedPosition.line ? section.generatedOffset.generatedColumn - 1 : 0)
              };
              return ret;
            }
          }
          return {
            line: null,
            column: null
          };
        }
        _parseMappings(aStr, aSourceRoot) {
          const generatedMappings = this.__generatedMappingsUnsorted = [];
          const originalMappings = this.__originalMappingsUnsorted = [];
          for (let i = 0; i < this._sections.length; i++) {
            const section = this._sections[i];
            const sectionMappings = [];
            section.consumer.eachMapping((m) => sectionMappings.push(m));
            for (let j = 0; j < sectionMappings.length; j++) {
              const mapping = sectionMappings[j];
              let source = util.computeSourceURL(section.consumer.sourceRoot, null, this._sourceMapURL);
              this._sources.add(source);
              source = this._sources.indexOf(source);
              let name = null;
              if (mapping.name) {
                this._names.add(mapping.name);
                name = this._names.indexOf(mapping.name);
              }
              const adjustedMapping = {
                source,
                generatedLine: mapping.generatedLine + (section.generatedOffset.generatedLine - 1),
                generatedColumn: mapping.generatedColumn + (section.generatedOffset.generatedLine === mapping.generatedLine ? section.generatedOffset.generatedColumn - 1 : 0),
                originalLine: mapping.originalLine,
                originalColumn: mapping.originalColumn,
                name
              };
              generatedMappings.push(adjustedMapping);
              if (typeof adjustedMapping.originalLine === "number") {
                originalMappings.push(adjustedMapping);
              }
            }
          }
        }
        eachMapping(aCallback, aContext, aOrder) {
          const context = aContext || null;
          const order = aOrder || SourceMapConsumer.GENERATED_ORDER;
          let mappings;
          switch (order) {
            case SourceMapConsumer.GENERATED_ORDER:
              mappings = this._generatedMappings;
              break;
            case SourceMapConsumer.ORIGINAL_ORDER:
              mappings = this._originalMappings;
              break;
            default:
              throw new Error("Unknown order of iteration.");
          }
          const sourceRoot = this.sourceRoot;
          mappings.map(function(mapping) {
            let source = null;
            if (mapping.source !== null) {
              source = this._sources.at(mapping.source);
              source = util.computeSourceURL(sourceRoot, source, this._sourceMapURL);
            }
            return {
              source,
              generatedLine: mapping.generatedLine,
              generatedColumn: mapping.generatedColumn,
              originalLine: mapping.originalLine,
              originalColumn: mapping.originalColumn,
              name: mapping.name === null ? null : this._names.at(mapping.name)
            };
          }, this).forEach(aCallback, context);
        }
        _findMapping(aNeedle, aMappings, aLineName, aColumnName, aComparator, aBias) {
          if (aNeedle[aLineName] <= 0) {
            throw new TypeError("Line must be greater than or equal to 1, got " + aNeedle[aLineName]);
          }
          if (aNeedle[aColumnName] < 0) {
            throw new TypeError("Column must be greater than or equal to 0, got " + aNeedle[aColumnName]);
          }
          return binarySearch.search(aNeedle, aMappings, aComparator, aBias);
        }
        allGeneratedPositionsFor(aArgs) {
          const line = util.getArg(aArgs, "line");
          const needle = {
            source: util.getArg(aArgs, "source"),
            originalLine: line,
            originalColumn: util.getArg(aArgs, "column", 0)
          };
          needle.source = this._findSourceIndex(needle.source);
          if (needle.source < 0) {
            return [];
          }
          if (needle.originalLine < 1) {
            throw new Error("Line numbers must be >= 1");
          }
          if (needle.originalColumn < 0) {
            throw new Error("Column numbers must be >= 0");
          }
          const mappings = [];
          let index = this._findMapping(needle, this._originalMappings, "originalLine", "originalColumn", util.compareByOriginalPositions, binarySearch.LEAST_UPPER_BOUND);
          if (index >= 0) {
            let mapping = this._originalMappings[index];
            if (aArgs.column === void 0) {
              const originalLine = mapping.originalLine;
              while (mapping && mapping.originalLine === originalLine) {
                let lastColumn = mapping.lastGeneratedColumn;
                if (this._computedColumnSpans && lastColumn === null) {
                  lastColumn = Infinity;
                }
                mappings.push({
                  line: util.getArg(mapping, "generatedLine", null),
                  column: util.getArg(mapping, "generatedColumn", null),
                  lastColumn
                });
                mapping = this._originalMappings[++index];
              }
            } else {
              const originalColumn = mapping.originalColumn;
              while (mapping && mapping.originalLine === line && mapping.originalColumn == originalColumn) {
                let lastColumn = mapping.lastGeneratedColumn;
                if (this._computedColumnSpans && lastColumn === null) {
                  lastColumn = Infinity;
                }
                mappings.push({
                  line: util.getArg(mapping, "generatedLine", null),
                  column: util.getArg(mapping, "generatedColumn", null),
                  lastColumn
                });
                mapping = this._originalMappings[++index];
              }
            }
          }
          return mappings;
        }
        destroy() {
          for (let i = 0; i < this._sections.length; i++) {
            this._sections[i].consumer.destroy();
          }
        }
      }
      exports2.IndexedSourceMapConsumer = IndexedSourceMapConsumer;
      function _factory(aSourceMap, aSourceMapURL) {
        let sourceMap2 = aSourceMap;
        if (typeof aSourceMap === "string") {
          sourceMap2 = util.parseSourceMapInput(aSourceMap);
        }
        const consumer = sourceMap2.sections != null ? new IndexedSourceMapConsumer(sourceMap2, aSourceMapURL) : new BasicSourceMapConsumer(sourceMap2, aSourceMapURL);
        return Promise.resolve(consumer);
      }
      function _factoryBSM(aSourceMap, aSourceMapURL) {
        return BasicSourceMapConsumer.fromSourceMap(aSourceMap, aSourceMapURL);
      }
    },
    function(module2, exports2) {
      exports2.GREATEST_LOWER_BOUND = 1;
      exports2.LEAST_UPPER_BOUND = 2;
      function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
        const mid = Math.floor((aHigh - aLow) / 2) + aLow;
        const cmp = aCompare(aNeedle, aHaystack[mid], true);
        if (cmp === 0) {
          return mid;
        } else if (cmp > 0) {
          if (aHigh - mid > 1) {
            return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
          }
          if (aBias == exports2.LEAST_UPPER_BOUND) {
            return aHigh < aHaystack.length ? aHigh : -1;
          }
          return mid;
        }
        if (mid - aLow > 1) {
          return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
        }
        if (aBias == exports2.LEAST_UPPER_BOUND) {
          return mid;
        }
        return aLow < 0 ? -1 : aLow;
      }
      exports2.search = function search(aNeedle, aHaystack, aCompare, aBias) {
        if (aHaystack.length === 0) {
          return -1;
        }
        let index = recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack, aCompare, aBias || exports2.GREATEST_LOWER_BOUND);
        if (index < 0) {
          return -1;
        }
        while (index - 1 >= 0) {
          if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) {
            break;
          }
          --index;
        }
        return index;
      };
    },
    function(module2, exports2) {
      module2.exports = __WEBPACK_EXTERNAL_MODULE_10__;
    },
    function(module2, exports2) {
      module2.exports = __WEBPACK_EXTERNAL_MODULE_11__;
    },
    function(module2, exports2, __webpack_require__) {
      const readWasm = __webpack_require__(4);
      function Mapping() {
        this.generatedLine = 0;
        this.generatedColumn = 0;
        this.lastGeneratedColumn = null;
        this.source = null;
        this.originalLine = null;
        this.originalColumn = null;
        this.name = null;
      }
      let cachedWasm = null;
      module2.exports = function wasm() {
        if (cachedWasm) {
          return cachedWasm;
        }
        const callbackStack = [];
        cachedWasm = readWasm().then((buffer) => {
          return WebAssembly.instantiate(buffer, {
            env: {
              mapping_callback(generatedLine, generatedColumn, hasLastGeneratedColumn, lastGeneratedColumn, hasOriginal, source, originalLine, originalColumn, hasName, name) {
                const mapping = new Mapping();
                mapping.generatedLine = generatedLine + 1;
                mapping.generatedColumn = generatedColumn;
                if (hasLastGeneratedColumn) {
                  mapping.lastGeneratedColumn = lastGeneratedColumn - 1;
                }
                if (hasOriginal) {
                  mapping.source = source;
                  mapping.originalLine = originalLine + 1;
                  mapping.originalColumn = originalColumn;
                  if (hasName) {
                    mapping.name = name;
                  }
                }
                callbackStack[callbackStack.length - 1](mapping);
              },
              start_all_generated_locations_for() {
                console.time("all_generated_locations_for");
              },
              end_all_generated_locations_for() {
                console.timeEnd("all_generated_locations_for");
              },
              start_compute_column_spans() {
                console.time("compute_column_spans");
              },
              end_compute_column_spans() {
                console.timeEnd("compute_column_spans");
              },
              start_generated_location_for() {
                console.time("generated_location_for");
              },
              end_generated_location_for() {
                console.timeEnd("generated_location_for");
              },
              start_original_location_for() {
                console.time("original_location_for");
              },
              end_original_location_for() {
                console.timeEnd("original_location_for");
              },
              start_parse_mappings() {
                console.time("parse_mappings");
              },
              end_parse_mappings() {
                console.timeEnd("parse_mappings");
              },
              start_sort_by_generated_location() {
                console.time("sort_by_generated_location");
              },
              end_sort_by_generated_location() {
                console.timeEnd("sort_by_generated_location");
              },
              start_sort_by_original_location() {
                console.time("sort_by_original_location");
              },
              end_sort_by_original_location() {
                console.timeEnd("sort_by_original_location");
              }
            }
          });
        }).then((Wasm) => {
          return {
            exports: Wasm.instance.exports,
            withMappingCallback: (mappingCallback, f) => {
              callbackStack.push(mappingCallback);
              try {
                f();
              } finally {
                callbackStack.pop();
              }
            }
          };
        }).then(null, (e) => {
          cachedWasm = null;
          throw e;
        });
        return cachedWasm;
      };
    },
    function(module2, exports2, __webpack_require__) {
      const SourceMapGenerator = __webpack_require__(1).SourceMapGenerator;
      const util = __webpack_require__(0);
      const REGEX_NEWLINE = /(\r?\n)/;
      const NEWLINE_CODE = 10;
      const isSourceNode = "$$$isSourceNode$$$";
      class SourceNode {
        constructor(aLine, aColumn, aSource, aChunks, aName) {
          this.children = [];
          this.sourceContents = {};
          this.line = aLine == null ? null : aLine;
          this.column = aColumn == null ? null : aColumn;
          this.source = aSource == null ? null : aSource;
          this.name = aName == null ? null : aName;
          this[isSourceNode] = true;
          if (aChunks != null)
            this.add(aChunks);
        }
        static fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
          const node = new SourceNode();
          const remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
          let remainingLinesIndex = 0;
          const shiftNextLine = function() {
            const lineContents = getNextLine();
            const newLine = getNextLine() || "";
            return lineContents + newLine;
            function getNextLine() {
              return remainingLinesIndex < remainingLines.length ? remainingLines[remainingLinesIndex++] : void 0;
            }
          };
          let lastGeneratedLine = 1, lastGeneratedColumn = 0;
          let lastMapping = null;
          let nextLine;
          aSourceMapConsumer.eachMapping(function(mapping) {
            if (lastMapping !== null) {
              if (lastGeneratedLine < mapping.generatedLine) {
                addMappingWithCode(lastMapping, shiftNextLine());
                lastGeneratedLine++;
                lastGeneratedColumn = 0;
              } else {
                nextLine = remainingLines[remainingLinesIndex] || "";
                const code = nextLine.substr(0, mapping.generatedColumn - lastGeneratedColumn);
                remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn - lastGeneratedColumn);
                lastGeneratedColumn = mapping.generatedColumn;
                addMappingWithCode(lastMapping, code);
                lastMapping = mapping;
                return;
              }
            }
            while (lastGeneratedLine < mapping.generatedLine) {
              node.add(shiftNextLine());
              lastGeneratedLine++;
            }
            if (lastGeneratedColumn < mapping.generatedColumn) {
              nextLine = remainingLines[remainingLinesIndex] || "";
              node.add(nextLine.substr(0, mapping.generatedColumn));
              remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn);
              lastGeneratedColumn = mapping.generatedColumn;
            }
            lastMapping = mapping;
          }, this);
          if (remainingLinesIndex < remainingLines.length) {
            if (lastMapping) {
              addMappingWithCode(lastMapping, shiftNextLine());
            }
            node.add(remainingLines.splice(remainingLinesIndex).join(""));
          }
          aSourceMapConsumer.sources.forEach(function(sourceFile) {
            const content = aSourceMapConsumer.sourceContentFor(sourceFile);
            if (content != null) {
              if (aRelativePath != null) {
                sourceFile = util.join(aRelativePath, sourceFile);
              }
              node.setSourceContent(sourceFile, content);
            }
          });
          return node;
          function addMappingWithCode(mapping, code) {
            if (mapping === null || mapping.source === void 0) {
              node.add(code);
            } else {
              const source = aRelativePath ? util.join(aRelativePath, mapping.source) : mapping.source;
              node.add(new SourceNode(mapping.originalLine, mapping.originalColumn, source, code, mapping.name));
            }
          }
        }
        add(aChunk) {
          if (Array.isArray(aChunk)) {
            aChunk.forEach(function(chunk) {
              this.add(chunk);
            }, this);
          } else if (aChunk[isSourceNode] || typeof aChunk === "string") {
            if (aChunk) {
              this.children.push(aChunk);
            }
          } else {
            throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk);
          }
          return this;
        }
        prepend(aChunk) {
          if (Array.isArray(aChunk)) {
            for (let i = aChunk.length - 1; i >= 0; i--) {
              this.prepend(aChunk[i]);
            }
          } else if (aChunk[isSourceNode] || typeof aChunk === "string") {
            this.children.unshift(aChunk);
          } else {
            throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk);
          }
          return this;
        }
        walk(aFn) {
          let chunk;
          for (let i = 0, len = this.children.length; i < len; i++) {
            chunk = this.children[i];
            if (chunk[isSourceNode]) {
              chunk.walk(aFn);
            } else if (chunk !== "") {
              aFn(chunk, {
                source: this.source,
                line: this.line,
                column: this.column,
                name: this.name
              });
            }
          }
        }
        join(aSep) {
          let newChildren;
          let i;
          const len = this.children.length;
          if (len > 0) {
            newChildren = [];
            for (i = 0; i < len - 1; i++) {
              newChildren.push(this.children[i]);
              newChildren.push(aSep);
            }
            newChildren.push(this.children[i]);
            this.children = newChildren;
          }
          return this;
        }
        replaceRight(aPattern, aReplacement) {
          const lastChild = this.children[this.children.length - 1];
          if (lastChild[isSourceNode]) {
            lastChild.replaceRight(aPattern, aReplacement);
          } else if (typeof lastChild === "string") {
            this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
          } else {
            this.children.push("".replace(aPattern, aReplacement));
          }
          return this;
        }
        setSourceContent(aSourceFile, aSourceContent) {
          this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;
        }
        walkSourceContents(aFn) {
          for (let i = 0, len = this.children.length; i < len; i++) {
            if (this.children[i][isSourceNode]) {
              this.children[i].walkSourceContents(aFn);
            }
          }
          const sources = Object.keys(this.sourceContents);
          for (let i = 0, len = sources.length; i < len; i++) {
            aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
          }
        }
        toString() {
          let str = "";
          this.walk(function(chunk) {
            str += chunk;
          });
          return str;
        }
        toStringWithSourceMap(aArgs) {
          const generated = {
            code: "",
            line: 1,
            column: 0
          };
          const map = new SourceMapGenerator(aArgs);
          let sourceMappingActive = false;
          let lastOriginalSource = null;
          let lastOriginalLine = null;
          let lastOriginalColumn = null;
          let lastOriginalName = null;
          this.walk(function(chunk, original) {
            generated.code += chunk;
            if (original.source !== null && original.line !== null && original.column !== null) {
              if (lastOriginalSource !== original.source || lastOriginalLine !== original.line || lastOriginalColumn !== original.column || lastOriginalName !== original.name) {
                map.addMapping({
                  source: original.source,
                  original: {
                    line: original.line,
                    column: original.column
                  },
                  generated: {
                    line: generated.line,
                    column: generated.column
                  },
                  name: original.name
                });
              }
              lastOriginalSource = original.source;
              lastOriginalLine = original.line;
              lastOriginalColumn = original.column;
              lastOriginalName = original.name;
              sourceMappingActive = true;
            } else if (sourceMappingActive) {
              map.addMapping({
                generated: {
                  line: generated.line,
                  column: generated.column
                }
              });
              lastOriginalSource = null;
              sourceMappingActive = false;
            }
            for (let idx = 0, length = chunk.length; idx < length; idx++) {
              if (chunk.charCodeAt(idx) === NEWLINE_CODE) {
                generated.line++;
                generated.column = 0;
                if (idx + 1 === length) {
                  lastOriginalSource = null;
                  sourceMappingActive = false;
                } else if (sourceMappingActive) {
                  map.addMapping({
                    source: original.source,
                    original: {
                      line: original.line,
                      column: original.column
                    },
                    generated: {
                      line: generated.line,
                      column: generated.column
                    },
                    name: original.name
                  });
                }
              } else {
                generated.column++;
              }
            }
          });
          this.walkSourceContents(function(sourceFile, sourceContent) {
            map.setSourceContent(sourceFile, sourceContent);
          });
          return { code: generated.code, map };
        }
      }
      exports2.SourceNode = SourceNode;
    }
  ]);
});

// pkg/third_party/inlinesourcemap/inline-source-map.js
function offsetMapping(mapping, offset) {
  return { line: offset.line + mapping.line, column: offset.column + mapping.column };
}
function newlinesIn(src) {
  if (!src)
    return 0;
  var newlines = src.match(/\n/g);
  return newlines ? newlines.length : 0;
}
function Generator(opts) {
  opts = opts || {};
  this.generator = new sourceMap.SourceMapGenerator({ file: opts.file || "", sourceRoot: opts.sourceRoot || "" });
  this.sourcesContent = void 0;
  this.opts = opts;
}
Generator.prototype.addMappings = function(sourceFile, mappings, offset) {
  var generator = this.generator;
  offset = offset || {};
  offset.line = offset.hasOwnProperty("line") ? offset.line : 0;
  offset.column = offset.hasOwnProperty("column") ? offset.column : 0;
  mappings.forEach(function(m) {
    generator.addMapping({
      source: m.original ? sourceFile : void 0,
      original: m.original,
      generated: offsetMapping(m.generated, offset)
    });
  });
  return this;
};
Generator.prototype.addGeneratedMappings = function(sourceFile, source, offset) {
  var mappings = [], linesToGenerate = newlinesIn(source) + 1;
  for (var line = 1; line <= linesToGenerate; line++) {
    var location = { line, column: 0 };
    mappings.push({ original: location, generated: location });
  }
  return this.addMappings(sourceFile, mappings, offset);
};
Generator.prototype.addSourceContent = function(sourceFile, sourcesContent) {
  this.generator.setSourceContent(sourceFile, sourcesContent);
  this.sourcesContent = this.sourcesContent || {};
  this.sourcesContent[sourceFile] = sourcesContent;
  return this;
};
Generator.prototype.base64Encode = function() {
  var map = this.toString();
  return btoa(map);
};
Generator.prototype.inlineMappingUrl = function() {
  var charset = this.opts.charset || "utf-8";
  return "//# sourceMappingURL=data:application/json;charset=" + charset + ";base64," + this.base64Encode();
};
Generator.prototype.toJSON = function() {
  var map = this.generator.toJSON();
  if (!this.sourcesContent)
    return map;
  var toSourcesContent = function(s) {
    if (typeof this.sourcesContent[s] === "string") {
      return this.sourcesContent[s];
    } else {
      return null;
    }
  }.bind(this);
  map.sourcesContent = map.sources.map(toSourcesContent);
  return map;
};
Generator.prototype.toString = function() {
  return JSON.stringify(this);
};
Generator.prototype._mappings = function() {
  return this.generator._mappings._array;
};
Generator.prototype.gen = function() {
  return this.generator;
};

// pkg/js/isolation/ses.js
var requiredLog = logFactory(true, "SES", "goldenrod");
var log10 = logFactory(logFactory.flags.ses, "SES", "goldenrod");
var { lockdown, Compartment } = globalThis;
var particleCompartment;
var initSes = (options) => {
  if (!particleCompartment) {
    const debugOptions = { consoleTaming: "unsafe", errorTaming: "unsafe", errorTrapping: "report", stackFiltering: "verbose" };
    const prodOptions = {};
    requiredLog.log("LOCKDOWN");
    requiredLog.groupCollapsed("...removing intrinics...");
    lockdown(debugOptions || prodOptions);
    requiredLog.groupEnd();
    particleCompartment = new Compartment({ log: log10, resolve, html, makeKey, timeout, ...options?.injections, harden: globalThis.harden });
  }
};
var resolve = Paths.resolve.bind(Paths);
var html = (strings, ...values5) => `${strings[0]}${values5.map((v, i) => `${v}${strings[i + 1]}`).join("")}`.trim();
var makeKey = () => `i${Math.floor((1 + Math.random() * 9) * 1e14)}`;
var timeout = async (func, delayMs) => new Promise((resolve2) => setTimeout(() => resolve2(func()), delayMs));
var createSesParticleFactory = async (kind, options) => {
  const Particle = await requireParticle();
  const implFactory = await requireImplFactory(kind, options);
  const log11 = createLogger(kind);
  const injections = { log: log11, resolve, html, ...options?.injections };
  const proto = implFactory(injections);
  const particleFactory = (host) => {
    const pipe = {
      log: log11,
      output: host.output.bind(host),
      service: host.service.bind(host)
    };
    return new Particle(proto, pipe);
  };
  return particleFactory;
};
var requireImplFactory = async (kind, options) => {
  const implCode = await requireParticleImplCode(kind, options);
  let factory;
  try {
    factory = particleCompartment.evaluate(implCode);
  } catch (x) {
    log10.error("failed to evaluate:", implCode);
    throw x;
  }
  if (typeof factory === "object") {
    factory = repackageImplFactory(factory, kind);
    log10("repackaged factory:\n", factory);
  }
  return globalThis.harden(factory);
};
var repackageImplFactory = (factory, kind) => {
  const props = Object.entries(factory);
  const isFunc = ([n, p]) => typeof p === "function";
  const funcs = props.filter(isFunc);
  const rewriteFuncs = funcs.map(([n, f]) => {
    const code = f.toString();
    const async2 = code.includes("async");
    const body = code.replace("async ", "").replace("function ", "");
    return `${async2 ? "async" : ""} function ${body};`;
  });
  const funcMembers = funcs.map(([n]) => n);
  const consts = props.filter((item) => !isFunc(item));
  const rewriteConsts = consts.map(([n, p]) => {
    return `const ${n} = \`${p}\`;`;
  });
  const constMembers = consts.map(([n]) => n);
  const proto = `{${[...constMembers, ...funcMembers]}}`;
  const rewrite = `
({log, ...utils}) => {

harden(utils);
const {assign, keys, entries, values, create} = Object;

${[...rewriteConsts, ...rewriteFuncs].join("\n\n")}

return harden(${proto});

};
  `;
  var gen = new Generator({ charset: "utf-8" }).addSourceContent(pathForKind(kind), rewrite).addGeneratedMappings(pathForKind(kind), rewrite, { line: 0, column: 0 });
  const inlineSourceMap = gen.inlineMappingUrl();
  const rewriteWithSourceMap = rewrite + inlineSourceMap + "\n";
  log10("rewritten:\n\n", rewriteWithSourceMap);
  return particleCompartment.evaluate(rewriteWithSourceMap);
};
var privateCtor;
var requireParticle = async () => {
  if (!privateCtor) {
    const baseCode = await requireParticleBaseCode();
    privateCtor = particleCompartment.evaluate(baseCode);
  }
  return privateCtor;
};
var createLogger = (kind) => {
  const _log = logFactory(logFactory.flags.particles, kind, "crimson");
  return (msg, ...args) => {
    const stack = msg?.stack?.split("\n")?.slice(1, 2) || new Error().stack.split("\n").slice(2, 3);
    const where = stack.map((entry) => entry.replace(/\([^()]*?\)/, "").replace(/ \([^()]*?\)/, "").replace("<anonymous>, <anonymous>", "").replace("Object.", "").replace("eval at :", "").replace(/\(|\)/g, "").replace(/\[[^\]]*?\] /, "").replace(/at (.*) (\d)/, 'at "$1" $2')).reverse().join("\n").trim();
    if (msg?.message) {
      _log.error(msg.message, ...args, `(${where})`);
    } else {
      _log(msg, ...args, `(${where})`);
    }
  };
};
Runtime.particleIndustry = createSesParticleFactory;
Runtime.securityLockdown = initSes;

// pkg/js/utils/utils.js
var utils_exports = {};
__export(utils_exports, {
  PathMapper: () => PathMapper,
  Paths: () => Paths,
  arand: () => arand,
  async: () => async,
  asyncTask: () => asyncTask,
  computeAgeString: () => computeAgeString,
  debounce: () => debounce,
  deepCopy: () => deepCopy,
  deepEqual: () => deepEqual,
  deepUndefinedToNull: () => deepUndefinedToNull,
  irand: () => irand,
  kebabToCaps: () => kebabToCaps,
  key: () => key,
  logFactory: () => logFactory,
  makeCapName: () => makeCapName,
  makeId: () => makeId,
  makeName: () => makeName,
  prob: () => prob,
  shallowMerge: () => shallowMerge,
  shallowUpdate: () => shallowUpdate
});

// pkg/js/utils/date.js
var computeAgeString = (date, now) => {
  let deltaTime = Math.round((now - date) / 1e3);
  if (isNaN(deltaTime)) {
    return `\u2022`;
  }
  let plural = "";
  if (deltaTime < 60) {
    if (deltaTime > 1)
      plural = "s";
    return `${deltaTime} second${plural} ago`;
  }
  deltaTime = Math.round(deltaTime / 60);
  if (deltaTime < 60) {
    if (deltaTime > 1)
      plural = "s";
    return `${deltaTime} minute${plural} ago`;
  }
  deltaTime = Math.round(deltaTime / 60);
  if (deltaTime < 24) {
    if (deltaTime > 1)
      plural = "s";
    return `${deltaTime} hour${plural} ago`;
  }
  deltaTime = Math.round(deltaTime / 24);
  if (deltaTime < 30) {
    if (deltaTime > 1)
      plural = "s";
    return `${deltaTime} day${plural} ago`;
  }
  deltaTime = Math.round(deltaTime / 30);
  if (deltaTime < 12) {
    if (deltaTime > 1)
      plural = "s";
    return `${deltaTime} month${plural} ago`;
  }
  deltaTime = Math.round(deltaTime / 12);
  if (deltaTime > 1)
    plural = "s";
  return `${deltaTime} year${plural} ago`;
};

// pkg/js/utils/names.js
var makeName = (delim) => {
  return `${arand(name1)}${delim || "-"}${arand(name2)}`;
};
var makeCapName = () => {
  return kebabToCaps(makeName());
};
var kebabToCaps = (s) => {
  const neo = [];
  for (let i = 0, c; c = s[i]; i++) {
    neo.push(i > 0 && c !== "-" ? c : s[i > 0 ? ++i : i].toUpperCase());
  }
  return neo.join("");
};
var name1 = ["abandoned", "able", "absolute", "adorable", "adventurous", "academic", "acceptable", "acclaimed", "accomplished", "accurate", "aching", "acidic", "acrobatic", "active", "actual", "adept", "admirable", "admired", "adolescent", "adorable", "adored", "advanced", "afraid", "affectionate", "aged", "aggravating", "aggressive", "agile", "agitated", "agonizing", "agreeable", "ajar", "alarmed", "alarming", "alert", "alienated", "alive", "all", "altruistic", "amazing", "ambitious", "ample", "amused", "amusing", "anchored", "ancient", "angelic", "angry", "anguished", "animated", "annual", "another", "antique", "anxious", "any", "apprehensive", "appropriate", "apt", "arctic", "arid", "aromatic", "artistic", "ashamed", "assured", "astonishing", "athletic", "attached", "attentive", "attractive", "austere", "authentic", "authorized", "automatic", "avaricious", "average", "aware", "awesome", "awful", "awkward", "babyish", "bad", "back", "baggy", "bare", "barren", "basic", "beautiful", "belated", "beloved", "beneficial", "better", "best", "bewitched", "big", "big-hearted", "biodegradable", "bite-sized", "bitter", "black", "black-and-white", "bland", "blank", "blaring", "bleak", "blind", "blissful", "blond", "blue", "blushing", "bogus", "boiling", "bold", "bony", "boring", "bossy", "both", "bouncy", "bountiful", "bowed", "brave", "breakable", "brief", "bright", "brilliant", "brisk", "broken", "bronze", "brown", "bruised", "bubbly", "bulky", "bumpy", "buoyant", "burdensome", "burly", "bustling", "busy", "buttery", "buzzing", "calculating", "calm", "candid", "canine", "capital", "carefree", "careful", "careless", "caring", "cautious", "cavernous", "celebrated", "charming", "cheap", "cheerful", "cheery", "chief", "chilly", "chubby", "circular", "classic", "clean", "clear", "clear-cut", "clever", "close", "closed", "cloudy", "clueless", "clumsy", "cluttered", "coarse", "cold", "colorful", "colorless", "colossal", "comfortable", "common", "compassionate", "competent", "complete", "complex", "complicated", "composed", "concerned", "concrete", "confused", "conscious", "considerate", "constant", "content", "conventional", "cooked", "cool", "cooperative", "coordinated", "corny", "corrupt", "costly", "courageous", "courteous", "crafty", "crazy", "creamy", "creative", "creepy", "criminal", "crisp", "critical", "crooked", "crowded", "cruel", "crushing", "cuddly", "cultivated", "cultured", "cumbersome", "curly", "curvy", "cute", "cylindrical", "damaged", "damp", "dangerous", "dapper", "daring", "darling", "dark", "dazzling", "dead", "deadly", "deafening", "dear", "dearest", "decent", "decimal", "decisive", "deep", "defenseless", "defensive", "defiant", "deficient", "definite", "definitive", "delayed", "delectable", "delicious", "delightful", "delirious", "demanding", "dense", "dental", "dependable", "dependent", "descriptive", "deserted", "detailed", "determined", "devoted", "different", "difficult", "digital", "diligent", "dim", "dimpled", "dimwitted", "direct", "discrete", "distant", "downright", "dreary", "dirty", "disguised", "dishonest", "dismal", "distant", "distinct", "distorted", "dizzy", "dopey", "doting", "double", "downright", "drab", "drafty", "dramatic", "droopy", "dry", "dual", "dutiful", "each", "eager", "earnest", "early", "easy", "easy-going", "ecstatic", "edible", "educated", "elaborate", "elastic", "elated", "elderly", "electric", "elegant", "elementary", "elliptical", "embarrassed", "embellished", "eminent", "emotional", "empty", "enchanted", "enchanting", "energetic", "enlightened", "enormous", "enraged", "entire", "envious", "equal", "equatorial", "essential", "esteemed", "ethical", "euphoric", "even", "evergreen", "everlasting", "every", "evil", "exalted", "excellent", "exemplary", "exhausted", "excitable", "excited", "exciting", "exotic", "expensive", "experienced", "expert", "extraneous", "extroverted", "extra-large", "extra-small", "fabulous", "failing", "faint", "fair", "faithful", "fake", "false", "familiar", "famous", "fancy", "fantastic", "far", "faraway", "far-flung", "far-off", "fast", "fat", "fatal", "fatherly", "favorable", "favorite", "fearful", "fearless", "feisty", "feline", "female", "feminine", "few", "fickle", "filthy", "fine", "finished", "firm", "first", "firsthand", "fitting", "fixed", "flaky", "flamboyant", "flashy", "flat", "flawed", "flawless", "flickering", "flimsy", "flippant", "flowery", "fluffy", "fluid", "flustered", "focused", "fond", "foolhardy", "foolish", "forceful", "forked", "formal", "forsaken", "forthright", "fortunate", "fragrant", "frail", "frank", "frayed", "free", "French", "fresh", "frequent", "friendly", "frightened", "frightening", "frigid", "frilly", "frizzy", "frivolous", "front", "frosty", "frozen", "frugal", "fruitful", "full", "fumbling", "functional", "funny", "fussy", "fuzzy", "gargantuan", "gaseous", "general", "generous", "gentle", "genuine", "giant", "giddy", "gigantic", "gifted", "giving", "glamorous", "glaring", "glass", "gleaming", "gleeful", "glistening", "glittering", "gloomy", "glorious", "glossy", "glum", "golden", "good", "good-natured", "gorgeous", "graceful", "gracious", "grand", "grandiose", "granular", "grateful", "gray", "great", "green", "gregarious", "gripping", "grizzled", "grouchy", "grounded", "growing", "growling", "grown", "grubby", "gruesome", "grumpy", "guilty", "gullible", "gummy", "hairy", "half", "handmade", "handsome", "handy", "happy", "happy-go-lucky", "hard", "hard-to-find", "harmful", "harmless", "harmonious", "harsh", "hasty", "hateful", "haunting", "healthy", "heartfelt", "hearty", "heavenly", "heavy", "hefty", "helpful", "helpless", "hidden", "hideous", "high", "high-level", "hilarious", "hoarse", "hollow", "homely", "honest", "honorable", "honored", "hopeful", "horrible", "hospitable", "hot", "huge", "humble", "humiliating", "humming", "humongous", "hungry", "hurtful", "husky", "icky", "icy", "ideal", "idealistic", "identical", "idle", "idiotic", "idolized", "ignorant", "ill", "illegal", "ill-fated", "ill-informed", "illiterate", "illustrious", "imaginary", "imaginative", "immaculate", "immaterial", "immediate", "immense", "impassioned", "impeccable", "impartial", "imperfect", "imperturbable", "impish", "impolite", "important", "impossible", "impractical", "impressionable", "impressive", "improbable", "impure", "inborn", "incomparable", "incompatible", "incomplete", "inconsequential", "incredible", "indelible", "inexperienced", "indolent", "infamous", "infantile", "infatuated", "inferior", "infinite", "informal", "innocent", "insistent", "instructive", "insubstantial", "intelligent", "intent", "intentional", "interesting", "internal", "international", "intrepid", "ironclad", "itchy", "jaded", "jagged", "jam-packed", "jaunty", "jealous", "jittery", "joint", "jolly", "jovial", "joyful", "joyous", "jubilant", "judicious", "juicy", "jumbo", "junior", "jumpy", "juvenile", "kaleidoscopic", "keen", "key", "kind", "kindhearted", "kindly", "klutzy", "knobby", "knotty", "knowledgeable", "knowing", "known", "kooky", "kosher", "lanky", "large", "last", "lasting", "late", "lavish", "lawful", "lazy", "leading", "lean", "leafy", "left", "legal", "legitimate", "light", "lighthearted", "likable", "likely", "limited", "limp", "limping", "linear", "lined", "liquid", "little", "live", "lively", "livid", "lone", "lonely", "long", "long-term", "loose", "lopsided", "lost", "loud", "lovable", "lovely", "loving", "low", "loyal", "lucky", "lumbering", "luminous", "lumpy", "lustrous", "luxurious", "mad", "made-up", "magnificent", "majestic", "major", "male", "mammoth", "married", "marvelous", "masculine", "massive", "mature", "meager", "mealy", "mean", "measly", "meaty", "medical", "mediocre", "medium", "meek", "mellow", "melodic", "memorable", "menacing", "merry", "messy", "metallic", "mild", "milky", "mindless", "miniature", "minor", "minty", "miserable", "miserly", "misguided", "misty", "mixed", "modern", "modest", "moist", "monstrous", "monthly", "monumental", "moral", "mortified", "motherly", "motionless", "mountainous", "muddy", "muffled", "multicolored", "mundane", "murky", "mushy", "muted", "mysterious", "naive", "narrow", "nasty", "natural", "naughty", "nautical", "near", "neat", "necessary", "negligible", "neighboring", "nervous", "new", "next", "nice", "nifty", "nimble", "nippy", "nocturnal", "noisy", "nonstop", "normal", "notable", "noted", "noteworthy", "novel", "numb", "nutritious", "nutty", "obedient", "oblong", "oily", "oblong", "obvious", "occasional", "odd", "oddball", "offbeat", "offensive", "official", "old", "old-fashioned", "only", "open", "optimal", "optimistic", "opulent", "orange", "orderly", "organic", "ornate", "ornery", "ordinary", "original", "other", "our", "outlying", "outgoing", "outlandish", "outrageous", "outstanding", "oval", "overcooked", "overdue", "overjoyed", "overlooked", "palatable", "pale", "paltry", "parallel", "parched", "partial", "passionate", "past", "pastel", "peaceful", "peppery", "perfect", "perfumed", "periodic", "perky", "personal", "pertinent", "pesky", "pessimistic", "petty", "phony", "physical", "piercing", "pink", "pitiful", "plain", "plaintive", "plastic", "playful", "pleasant", "pleased", "pleasing", "plump", "plush", "polished", "polite", "political", "pointed", "pointless", "poised", "poor", "popular", "portly", "posh", "positive", "possible", "potable", "powerful", "powerless", "practical", "precious", "present", "prestigious", "pretty", "precious", "previous", "pricey", "prickly", "primary", "prime", "pristine", "private", "prize", "probable", "productive", "profitable", "profuse", "proper", "proud", "prudent", "punctual", "pungent", "puny", "pure", "purple", "pushy", "puzzled", "puzzling", "quaint", "qualified", "quarrelsome", "quarterly", "queasy", "querulous", "questionable", "quick", "quick-witted", "quiet", "quintessential", "quirky", "quixotic", "quizzical", "radiant", "ragged", "rapid", "rare", "rash", "raw", "recent", "reckless", "rectangular", "ready", "real", "realistic", "reasonable", "red", "reflecting", "regal", "regular", "reliable", "relieved", "remarkable", "remorseful", "remote", "repentant", "required", "respectful", "responsible", "repulsive", "revolving", "rewarding", "rich", "rigid", "right", "ringed", "ripe", "roasted", "robust", "rosy", "rotating", "rotten", "rough", "round", "rowdy", "royal", "rubbery", "rundown", "ruddy", "runny", "rural", "rusty", "sad", "safe", "salty", "same", "sandy", "sane", "sarcastic", "sardonic", "satisfied", "scaly", "scarce", "scared", "scary", "scented", "scholarly", "scientific", "scratchy", "scrawny", "second", "secondary", "second-hand", "secret", "self-assured", "self-reliant", "selfish", "sentimental", "separate", "serene", "serious", "serpentine", "several", "severe", "shabby", "shadowy", "shady", "shallow", "shameful", "shameless", "sharp", "shimmering", "shiny", "shocked", "shocking", "shoddy", "short", "short-term", "showy", "shrill", "shy", "sick", "silent", "silky", "silly", "silver", "similar", "simple", "simplistic", "sinful", "single", "sizzling", "skeletal", "skinny", "sleepy", "slight", "slim", "slimy", "slippery", "slow", "slushy", "small", "smart", "smoggy", "smooth", "smug", "snappy", "snarling", "sneaky", "sniveling", "snoopy", "sociable", "soft", "soggy", "solid", "somber", "some", "spherical", "sophisticated", "sore", "sorrowful", "soulful", "soupy", "sour", "Spanish", "sparkling", "sparse", "specific", "spectacular", "speedy", "spicy", "spiffy", "spirited", "spiteful", "splendid", "spotless", "spotted", "spry", "square", "squeaky", "squiggly", "stable", "staid", "stained", "stale", "standard", "starchy", "stark", "starry", "steep", "sticky", "stiff", "stimulating", "stingy", "stormy", "straight", "strange", "steel", "strict", "strident", "striking", "striped", "strong", "studious", "stunning", "stupendous", "sturdy", "stylish", "subdued", "submissive", "substantial", "subtle", "suburban", "sudden", "sugary", "sunny", "super", "superb", "superficial", "superior", "supportive", "sure-footed", "surprised", "suspicious", "svelte", "sweet", "sweltering", "swift", "sympathetic", "tall", "talkative", "tame", "tan", "tangible", "tart", "tasty", "tattered", "taut", "tedious", "teeming", "tempting", "tender", "tense", "tepid", "terrible", "terrific", "testy", "thankful", "that", "these", "thick", "thin", "third", "thirsty", "this", "thorough", "thorny", "those", "thoughtful", "threadbare", "thrifty", "thunderous", "tidy", "tight", "timely", "tinted", "tiny", "tired", "torn", "total", "tough", "traumatic", "treasured", "tremendous", "tragic", "trained", "tremendous", "triangular", "tricky", "trifling", "trim", "trivial", "troubled", "true", "trusting", "trustworthy", "trusty", "truthful", "tubby", "turbulent", "twin", "ugly", "ultimate", "unacceptable", "unaware", "uncomfortable", "uncommon", "unconscious", "understated", "unequaled", "uneven", "unfinished", "unfit", "unfolded", "unfortunate", "unhappy", "unhealthy", "uniform", "unimportant", "unique", "united", "unkempt", "unknown", "unlawful", "unlined", "unlucky", "unnatural", "unpleasant", "unrealistic", "unripe", "unruly", "unselfish", "unsightly", "unsteady", "unsung", "untidy", "untimely", "untried", "untrue", "unused", "unusual", "unwelcome", "unwieldy", "unwilling", "unwitting", "unwritten", "upbeat", "upright", "upset", "urban", "usable", "used", "useful", "useless", "utilized", "utter", "vacant", "vague", "vain", "valid", "valuable", "vapid", "variable", "vast", "velvety", "venerated", "vengeful", "verifiable", "vibrant", "vicious", "victorious", "vigilant", "vigorous", "villainous", "violet", "violent", "virtual", "virtuous", "visible", "vital", "vivacious", "vivid", "voluminous", "wan", "warlike", "warm", "warmhearted", "warped", "wary", "wasteful", "watchful", "waterlogged", "watery", "wavy", "wealthy", "weak", "weary", "webbed", "wee", "weekly", "weepy", "weighty", "weird", "welcome", "well-documented", "well-groomed", "well-informed", "well-lit", "well-made", "well-off", "well-to-do", "well-worn", "wet", "which", "whimsical", "whirlwind", "whispered", "white", "whole", "whopping", "wicked", "wide", "wide-eyed", "wiggly", "wild", "willing", "wilted", "winding", "windy", "winged", "wiry", "wise", "witty", "wobbly", "woeful", "wonderful", "wooden", "woozy", "wordy", "worldly", "worn", "worried", "worrisome", "worse", "worst", "worthless", "worthwhile", "worthy", "wrathful", "wretched", "writhing", "wrong", "wry", "yawning", "yearly", "yellow", "yellowish", "young", "youthful", "yummy", "zany", "zealous", "zesty", "zigzag", "rocky"];
var name2 = ["people", "history", "way", "art", "world", "information", "map", "family", "government", "health", "system", "computer", "meat", "year", "thanks", "music", "person", "reading", "method", "data", "food", "understanding", "theory", "law", "bird", "literature", "problem", "software", "control", "knowledge", "power", "ability", "economics", "love", "internet", "television", "science", "library", "nature", "fact", "product", "idea", "temperature", "investment", "area", "society", "activity", "story", "industry", "media", "thing", "oven", "community", "definition", "safety", "quality", "development", "language", "management", "player", "variety", "video", "week", "security", "country", "exam", "movie", "organization", "equipment", "physics", "analysis", "policy", "series", "thought", "basis", "boyfriend", "direction", "strategy", "technology", "army", "camera", "freedom", "paper", "environment", "child", "instance", "month", "truth", "marketing", "university", "writing", "article", "department", "difference", "goal", "news", "audience", "fishing", "growth", "income", "marriage", "user", "combination", "failure", "meaning", "medicine", "philosophy", "teacher", "communication", "night", "chemistry", "disease", "disk", "energy", "nation", "road", "role", "soup", "advertising", "location", "success", "addition", "apartment", "education", "math", "moment", "painting", "politics", "attention", "decision", "event", "property", "shopping", "student", "wood", "competition", "distribution", "entertainment", "office", "population", "president", "unit", "category", "cigarette", "context", "introduction", "opportunity", "performance", "driver", "flight", "length", "magazine", "newspaper", "relationship", "teaching", "cell", "dealer", "debate", "finding", "lake", "member", "message", "phone", "scene", "appearance", "association", "concept", "customer", "death", "discussion", "housing", "inflation", "insurance", "mood", "woman", "advice", "blood", "effort", "expression", "importance", "opinion", "payment", "reality", "responsibility", "situation", "skill", "statement", "wealth", "application", "city", "county", "depth", "estate", "foundation", "grandmother", "heart", "perspective", "photo", "recipe", "studio", "topic", "collection", "depression", "imagination", "passion", "percentage", "resource", "setting", "ad", "agency", "college", "connection", "criticism", "debt", "description", "memory", "patience", "secretary", "solution", "administration", "aspect", "attitude", "director", "personality", "psychology", "recommendation", "response", "selection", "storage", "version", "alcohol", "argument", "complaint", "contract", "emphasis", "highway", "loss", "membership", "possession", "preparation", "steak", "union", "agreement", "cancer", "currency", "employment", "engineering", "entry", "interaction", "limit", "mixture", "preference", "region", "republic", "seat", "tradition", "virus", "actor", "classroom", "delivery", "device", "difficulty", "drama", "election", "engine", "football", "guidance", "hotel", "match", "owner", "priority", "protection", "suggestion", "tension", "variation", "anxiety", "atmosphere", "awareness", "bread", "climate", "comparison", "confusion", "construction", "elevator", "emotion", "employee", "employer", "guest", "height", "leadership", "mall", "manager", "operation", "recording", "respect", "sample", "transportation", "boring", "charity", "cousin", "disaster", "editor", "efficiency", "excitement", "extent", "feedback", "guitar", "homework", "leader", "mom", "outcome", "permission", "presentation", "promotion", "reflection", "refrigerator", "resolution", "revenue", "session", "singer", "tennis", "basket", "bonus", "cabinet", "childhood", "church", "clothes", "coffee", "dinner", "drawing", "hair", "hearing", "initiative", "judgment", "lab", "measurement", "mode", "mud", "orange", "poetry", "police", "possibility", "procedure", "queen", "ratio", "relation", "restaurant", "satisfaction", "sector", "signature", "significance", "song", "tooth", "town", "vehicle", "volume", "wife", "accident", "airport", "appointment", "arrival", "assumption", "baseball", "chapter", "committee", "conversation", "database", "enthusiasm", "error", "explanation", "farmer", "gate", "girl", "hall", "historian", "hospital", "injury", "instruction", "maintenance", "manufacturer", "meal", "perception", "pie", "poem", "presence", "proposal", "reception", "replacement", "revolution", "river", "son", "speech", "tea", "village", "warning", "winner", "worker", "writer", "assistance", "breath", "buyer", "chest", "chocolate", "conclusion", "contribution", "cookie", "courage", "desk", "drawer", "establishment", "examination", "garbage", "grocery", "honey", "impression", "improvement", "independence", "insect", "inspection", "inspector", "king", "ladder", "menu", "penalty", "piano", "potato", "profession", "professor", "quantity", "reaction", "requirement", "salad", "sister", "supermarket", "tongue", "weakness", "wedding", "affair", "ambition", "analyst", "apple", "assignment", "assistant", "bathroom", "bedroom", "beer", "birthday", "celebration", "championship", "cheek", "client", "consequence", "departure", "diamond", "dirt", "ear", "fortune", "friendship", "funeral", "gene", "girlfriend", "hat", "indication", "intention", "lady", "midnight", "negotiation", "obligation", "passenger", "pizza", "platform", "poet", "pollution", "recognition", "reputation", "shirt", "speaker", "stranger", "surgery", "sympathy", "tale", "throat", "trainer", "uncle", "youth", "time", "work", "film", "water", "money", "example", "while", "business", "study", "game", "life", "form", "air", "day", "place", "number", "part", "field", "fish", "back", "process", "heat", "hand", "experience", "job", "book", "end", "point", "type", "home", "economy", "value", "body", "market", "guide", "interest", "state", "radio", "course", "company", "price", "size", "card", "list", "mind", "trade", "line", "care", "group", "risk", "word", "fat", "force", "key", "light", "training", "name", "school", "top", "amount", "level", "order", "practice", "research", "sense", "service", "piece", "web", "boss", "sport", "fun", "house", "page", "term", "test", "answer", "sound", "focus", "matter", "kind", "soil", "board", "oil", "picture", "access", "garden", "range", "rate", "reason", "future", "site", "demand", "exercise", "image", "case", "cause", "coast", "action", "age", "bad", "boat", "record", "result", "section", "building", "mouse", "cash", "class", "period", "plan", "store", "tax", "side", "subject", "space", "rule", "stock", "weather", "chance", "figure", "man", "model", "source", "beginning", "earth", "program", "chicken", "design", "feature", "head", "material", "purpose", "question", "rock", "salt", "act", "birth", "car", "dog", "object", "scale", "sun", "note", "profit", "rent", "speed", "style", "war", "bank", "craft", "half", "inside", "outside", "standard", "bus", "exchange", "eye", "fire", "position", "pressure", "stress", "advantage", "benefit", "box", "frame", "issue", "step", "cycle", "face", "item", "metal", "paint", "review", "room", "screen", "structure", "view", "account", "ball", "discipline", "medium", "share", "balance", "bit", "black", "bottom", "choice", "gift", "impact", "machine", "shape", "tool", "wind", "address", "average", "career", "culture", "morning", "pot", "sign", "table", "task", "condition", "contact", "credit", "egg", "hope", "ice", "network", "north", "square", "attempt", "date", "effect", "link", "post", "star", "voice", "capital", "challenge", "friend", "self", "shot", "brush", "couple", "exit", "front", "function", "lack", "living", "plant", "plastic", "spot", "summer", "taste", "theme", "track", "wing", "brain", "button", "click", "desire", "foot", "gas", "influence", "notice", "rain", "wall", "base", "damage", "distance", "feeling", "pair", "savings", "staff", "sugar", "target", "text", "animal", "author", "budget", "discount", "file", "ground", "lesson", "minute", "officer", "phase", "reference", "register", "sky", "stage", "stick", "title", "trouble", "bowl", "bridge", "campaign", "character", "club", "edge", "evidence", "fan", "letter", "lock", "maximum", "novel", "option", "pack", "park", "quarter", "skin", "sort", "weight", "baby", "background", "carry", "dish", "factor", "fruit", "glass", "joint", "master", "muscle", "red", "strength", "traffic", "trip", "vegetable", "appeal", "chart", "gear", "ideal", "librarychen", "land", "log", "mother", "net", "party", "principle", "relative", "sale", "season", "signal", "spirit", "street", "tree", "wave", "belt", "bench", "commission", "copy", "drop", "minimum", "path", "progress", "project", "sea", "south", "status", "stuff", "ticket", "tour", "angle", "blue", "breakfast", "confidence", "daughter", "degree", "doctor", "dot", "dream", "duty", "essay", "father", "fee", "finance", "hour", "juice", "luck", "milk", "mouth", "peace", "pipe", "stable", "storm", "substance", "team", "trick", "afternoon", "bat", "beach", "blank", "catch", "chain", "consideration", "cream", "crew", "detail", "gold", "interview", "kid", "mark", "mission", "pain", "pleasure", "score", "screw", "sex", "shop", "shower", "suit", "tone", "window", "agent", "band", "bath", "block", "bone", "calendar", "candidate", "cap", "coat", "contest", "corner", "court", "cup", "district", "door", "east", "finger", "garage", "guarantee", "hole", "hook", "implement", "layer", "lecture", "lie", "manner", "meeting", "nose", "parking", "partner", "profile", "rice", "routine", "schedule", "swimming", "telephone", "tip", "winter", "airline", "bag", "battle", "bed", "bill", "bother", "cake", "code", "curve", "designer", "dimension", "dress", "ease", "emergency", "evening", "extension", "farm", "fight", "gap", "grade", "holiday", "horror", "horse", "host", "husband", "loan", "mistake", "mountain", "nail", "noise", "occasion", "package", "patient", "pause", "phrase", "proof", "race", "relief", "sand", "sentence", "shoulder", "smoke", "stomach", "string", "tourist", "towel", "vacation", "west", "wheel", "wine", "arm", "aside", "associate", "bet", "blow", "border", "branch", "breast", "brother", "buddy", "bunch", "chip", "coach", "cross", "document", "draft", "dust", "expert", "floor", "god", "golf", "habit", "iron", "judge", "knife", "landscape", "league", "mail", "mess", "native", "opening", "parent", "pattern", "pin", "pool", "pound", "request", "salary", "shame", "shelter", "shoe", "silver", "tackle", "tank", "trust", "assist", "bake", "bar", "bell", "bike", "blame", "boy", "brick", "chair", "closet", "clue", "collar", "comment", "conference", "devil", "diet", "fear", "fuel", "glove", "jacket", "lunch", "monitor", "mortgage", "nurse", "pace", "panic", "peak", "plane", "reward", "row", "sandwich", "shock", "spite", "spray", "surprise", "till", "transition", "weekend", "welcome", "yard", "alarm", "bend", "bicycle", "bite", "blind", "bottle", "cable", "candle", "clerk", "cloud", "concert", "counter", "flower", "grandfather", "harm", "knee", "lawyer", "leather", "load", "mirror", "neck", "pension", "plate", "purple", "ruin", "ship", "skirt", "slice", "snow", "specialist", "stroke", "switch", "trash", "tune", "zone", "anger", "award", "bid", "bitter", "boot", "bug", "camp", "candy", "carpet", "cat", "champion", "channel", "clock", "comfort", "cow", "crack", "engineer", "entrance", "fault", "grass", "guy", "hell", "highlight", "incident", "island", "joke", "jury", "leg", "lip", "mate", "motor", "nerve", "passage", "pen", "pride", "priest", "prize", "promise", "resident", "resort", "ring", "roof", "rope", "sail", "scheme", "script", "sock", "station", "toe", "tower", "truck", "witness", "can", "will", "other", "use", "make", "good", "look", "help", "go", "great", "being", "still", "public", "read", "keep", "start", "give", "human", "local", "general", "specific", "long", "play", "feel", "high", "put", "common", "set", "change", "simple", "past", "big", "possible", "particular", "major", "personal", "current", "national", "cut", "natural", "physical", "show", "try", "check", "second", "call", "move", "pay", "let", "increase", "single", "individual", "turn", "ask", "buy", "guard", "hold", "main", "offer", "potential", "professional", "international", "travel", "cook", "alternative", "special", "working", "whole", "dance", "excuse", "cold", "commercial", "low", "purchase", "deal", "primary", "worth", "fall", "necessary", "positive", "produce", "search", "present", "spend", "talk", "creative", "tell", "cost", "drive", "green", "support", "glad", "remove", "return", "run", "complex", "due", "effective", "middle", "regular", "reserve", "independent", "leave", "original", "reach", "rest", "serve", "watch", "beautiful", "charge", "active", "break", "negative", "safe", "stay", "visit", "visual", "affect", "cover", "report", "rise", "walk", "white", "junior", "pick", "unique", "classic", "final", "lift", "mix", "private", "stop", "teach", "western", "concern", "familiar", "fly", "official", "broad", "comfortable", "gain", "rich", "save", "stand", "young", "heavy", "lead", "listen", "valuable", "worry", "handle", "leading", "meet", "release", "sell", "finish", "normal", "press", "ride", "secret", "spread", "spring", "tough", "wait", "brown", "deep", "display", "flow", "hit", "objective", "shoot", "touch", "cancel", "chemical", "cry", "dump", "extreme", "push", "conflict", "eat", "fill", "formal", "jump", "kick", "opposite", "pass", "pitch", "remote", "total", "treat", "vast", "abuse", "beat", "burn", "deposit", "print", "raise", "sleep", "somewhere", "advance", "consist", "dark", "double", "draw", "equal", "fix", "hire", "internal", "join", "sensitive", "tap", "win", "attack", "claim", "constant", "drag", "drink", "guess", "minor", "pull", "raw", "soft", "solid", "wear", "weird", "wonder", "annual", "count", "dead", "doubt", "feed", "forever", "impress", "repeat", "round", "sing", "slide", "strip", "wish", "combine", "command", "dig", "divide", "equivalent", "hang", "hunt", "initial", "march", "mention", "spiritual", "survey", "tie", "adult", "brief", "crazy", "escape", "gather", "hate", "prior", "repair", "rough", "sad", "scratch", "sick", "strike", "employ", "external", "hurt", "illegal", "laugh", "lay", "mobile", "nasty", "ordinary", "respond", "royal", "senior", "split", "strain", "struggle", "swim", "train", "upper", "wash", "yellow", "convert", "crash", "dependent", "fold", "funny", "grab", "hide", "miss", "permit", "quote", "recover", "resolve", "roll", "sink", "slip", "spare", "suspect", "sweet", "swing", "twist", "upstairs", "usual", "abroad", "brave", "calm", "concentrate", "estimate", "grand", "male", "mine", "prompt", "quiet", "refuse", "regret", "reveal", "rush", "shake", "shift", "shine", "steal", "suck", "surround", "bear", "brilliant", "dare", "dear", "delay", "drunk", "female", "hurry", "inevitable", "invite", "kiss", "neat", "pop", "punch", "quit", "reply", "representative", "resist", "rip", "rub", "silly", "smile", "spell", "stretch", "tear", "temporary", "tomorrow", "wake", "wrap", "yesterday"];

// pkg/js/utils/task.js
var debounce = (key2, action, delay) => {
  if (key2) {
    clearTimeout(key2);
  }
  if (action && delay) {
    return setTimeout(action, delay);
  }
};
var async = (task) => {
  return async (...args) => {
    await Promise.resolve();
    task(...args);
  };
};
var asyncTask = (task, delayMs) => {
  setTimeout(task, delayMs ?? 0);
};

// pkg/arcs.ts
var { logFactory: logFactory2, Paths: Paths2 } = utils_exports;
var root2 = import.meta.url.split("/").slice(0, -1).join("/");
Paths2.setRoot(root2);
export {
  Arc,
  Chef,
  Composer,
  Decorator,
  EventEmitter,
  Host,
  Parser,
  Paths2 as Paths,
  Runtime,
  Store,
  Surface,
  createSesParticleFactory,
  fetchParticleCode,
  initSes,
  logFactory2 as logFactory,
  maybeFetchParticleCode,
  pathForKind,
  requireParticleBaseCode,
  requireParticleImplCode,
  utils_exports as utils
};
