/**
* Copyright 2022 Google LLC
*
* Use of this source code is governed by a BSD-style
* license that can be found in the LICENSE file or at
* https://developers.google.com/open-source/licenses/bsd
*/

globalThis.config = {
  // false to use CDN resources
  localArcsjs: true,
  // identifies the p2p meeting place, peers must be in this same aeon
  // also identifies offline storage node
  aeon: 'local-chromium/00x00',
  // each flag below set true enables logging for the named subsystem
  logFlags: {
    //arc: true,
    recipe: true,
    host: true,
    particles: true,
    surfaces: true
  }
};