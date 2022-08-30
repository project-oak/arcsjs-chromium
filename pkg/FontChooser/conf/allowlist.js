/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
const path = globalThis.config?.arcsjs || 'https://arcsjs.web.app/0.4.0';

const core = `${path}/Library/Core`;
const lib = `${path}/Library`;

export const {
  App,
  Paths, logFactory,
  TensorFlowService
} = (await Promise.all([
  import(`${core}/utils.min.js`),
  import(`${lib}/App/Worker/App.js`),
  import(`${lib}/App/surface-imports.js`),
  import(`${lib}/TensorFlow/TensorFlowService.js`)
])).reduce((e, m) =>({...e, ...m}),{});
