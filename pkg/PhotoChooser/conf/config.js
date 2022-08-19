/**
* Copyright 2022 Google LLC
*
* Use of this source code is governed by a BSD-style
* license that can be found in the LICENSE file or at
* https://developers.google.com/open-source/licenses/bsd
*/

globalThis.config = {
  arcsjs: 'https://arcsjs.web.app/0.4',
  // requires a symlink in `env` to a local arcsjs `pkg` folder
  //arcsjs: '../../env/arcsjs',
  // identifies the p2p meeting place, peers must be in this same aeon
  // also identifies offline storage node
  aeon: 'local-photos/00x00',
  // each flag below set true enables logging for the named subsystem
  logFlags: {
    //arc: true,
    recipe: true,
    host: true,
    particles: true,
    surfaces: true
  }
};