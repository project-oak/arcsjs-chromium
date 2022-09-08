/**
* Copyright 2022 Google LLC
*
* Use of this source code is governed by a BSD-style
* license that can be found in the LICENSE file or at
* https://developers.google.com/open-source/licenses/bsd
*/
globalThis.config = {
  arcsjs: 'https://arcsjs.web.app/0.4.0',
  // requires a symlink in `env` to a local arcsjs `pkg` folder
  //arcsjs: '../../env/arcsjs',
  // identifies the p2p meeting place, peers must be in this same aeon
  // also identifies offline storage node
  aeon: 'policy/00x00',
  // each flag below set true enables logging for the named subsystem
  // TODO(wkorman): Understand and document each of below (and aeon).
  logFlags: {
    recipe: true,
    host: true,
    decorator: true,
    particles: true,
    surfaces: true,
    worker: true
  }
};
