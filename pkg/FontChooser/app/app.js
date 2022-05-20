/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {Runtime, Params, Chef, Decorator, Surfaces, Services, logFactory, pathForKind} from '../../arcs-import.js';
import {loadIbis, best_solutions_to_json} from 'https://project-oak.github.io/arcsjs-provable/ibis/ibis.js';

const {keys} = Object;
const json = v => JSON.stringify(v);
const pretty = v => JSON.stringify(v, null, '  ');
export const stateCapture = () => {
  const {user} = globalThis.App;
  const data = keys(user.stores).reduce((data, key) => {
    const omit = [
      // these are kinda big
      'nodeTypes',
      'pipelines',
      'myItems',
      // personal
      'favoriteItems',
      // depends on rendering
      'mobilenet1ClassifierResults'
    ].includes(key);
    if (!omit) {
      //console.warn(key);
      const {meta, data: value} = user.stores[key];
      data[key] = {meta, value};
    }
    return data;
  }, {});
  //console.warn('state', data);
  return json(data);
};

// logger
const log = logFactory(logFactory.flags.app || true, 'App', 'mediumorchid');
// document-relative path to surface bootstrap
const surfacePath = '../surface/surface.html';
// DOM context
const root = document.body;
// alias
const {getPrototypeOf} = Object;
// trivial app
const App = window.App = {};

export const DevToolsService = async (runtime, host, request) => {
  const {msg, data} = request;
  if (services[msg]) {
    return services[msg](data);
  } else {
    log(`no handler for "${msg}"`);
  }
};
const services = {
  async stateCapture() {
    return await stateCapture();
  }
};

Services.user.add(DevToolsService);

const boot = async fontData => {
  const recipe = await acquireRecipe();
  if (recipe) {
    const system = App.system = new Runtime('system');
    await bootSystem(system, recipe, fontData);
  }
};

const acquireRecipe = async () => {
  const kind = Params.getParam('kind');
  if (kind) {
    const recipePath = pathForKind(kind);
    const libraryPath = recipePath.split('/').slice(0, -1).join('/');
    Paths.add({$local: libraryPath});
    const module = await import(recipePath);
    return Object.values(module).pop();
  }
};

const bootSystem = async (system, recipe, {fontData, suggested}) => {
  // make system surface
  system.surface = await Surfaces.create('system', root, surfacePath);
  // make an Arc on the Surface
  const arc = await system.bootstrapArc('system', null, system.surface, Services.system);
  // use as static recipe input
  recipe.$stores.fonts.$value = Decorator.setOpaqueData('fonts', fontData);
  if (recipe.$stores.suggested) {
    recipe.$stores.suggested.$value = suggested;
  }
  const policy = await fetch('./policy.json').then(t => t.text());
  await loadIbis(
      'https://project-oak.github.io/arcsjs-provable/ibis/pkg/ibis_bg.wasm',
      (status_text, style) => {
        console.log(status_text);
      },
      (version_info) => {
        console.log(version_info);
      }
  );
  const resolved_policy = best_solutions_to_json([policy]);
  const neededClaims = JSON.parse(resolved_policy).claims.find(r => r[0] == 'runtime_event')[1];

  console.log(resolved_policy);
  // look for data egress
  arc.storeChanged = (storeId, store) => {
    getPrototypeOf(arc).storeChanged.call(arc, storeId, store);
    if (storeId === 'pickedFont') {
      console.warn('pickedFont', store.data);
      const font = fontData.find(r => r.fullName === store.data.font);
      console.log("Claims " + JSON.stringify(store.data.claims));
      if (store.data.claims.indexOf(neededClaims) != -1) {
        emitResult(font);
      } else {
        emitResult(font);
        setTimeout(() => {
          const err = window.parent.document.getElementById('error');
          err.innerHTML = '<span style="color: black; opacity: 1.0">Attempted egress without claim: '
              + neededClaims + ' found: ' + JSON.stringify(store.data.claims)
              + "</span>";
          err.setAttribute('show', 'true');
          err.addEventListener('click', () => {
            err.removeAttribute('show');
          });
        }, 60);
      }
    }
  };
  // ask Chef to execute recipe(s)
  await Chef.execute(recipe, system, arc);
  // report
  log(system);
};

const emitResult = (font) => {
  window.parent.postMessage({font}, '*');
};

window.addEventListener('message', e => {
  if (e?.data?.fontData?.length) {
    boot(e.data);
  }
});

window.parent.postMessage('hello', '*');
