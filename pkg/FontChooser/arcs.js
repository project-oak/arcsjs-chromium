/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

// configure
import './config.js';
// import arcs engine
await import(`${globalThis.config.arcsjs}/Library/App/Worker/ArcsWorker.js`);
