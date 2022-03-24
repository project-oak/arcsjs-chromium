/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */


// importing `arcs` here will defeat configuration

const defaultConfig = {
  aeon: 'blueSky/00x00',
  //network: false,
  //firebase: false,
  logFlags: {
    //ergo: true,
    //arc: true,
    //dataset: true,
    particles: true,
    //composer: true,
    //render: true,
    network: true,
    discovery: true,
    //hub: true,
    //net: true,
    //history: true,
    //planner: true,
    //storage: true,
    surfaces: true
  }
};

export const config = {
  ...defaultConfig,
  ...(globalThis.config || {})
};

globalThis.config = config;
// feed the configuration objects into the global scope
// library package `discover` uses `globalThis.aeon`
// `logFactory` uses `globalThis.logFlags`
// `globalThis.params` is available for general use
Object.assign(globalThis, config);
console.log(globalThis.config);
