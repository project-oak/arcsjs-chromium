/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {Runtime, Params, Chef, Decorator, Surfaces, Services, logFactory, pathForKind} from '../../arcs-import.js';

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
  // look for data egress
  arc.storeChanged = (storeId, store) => {
    getPrototypeOf(arc).storeChanged.call(arc, storeId, store);
    if (storeId === 'pickedFont') {
      console.warn('pickedFont', store.data);
      const font = fontData.find(r => r.fullName === store.data);
      emitResult(font);
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
