/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */


// standard libraries are here
const local = import.meta.url.split('/').slice(0, -3).join('/');
globalThis.Paths.add({
  $library: `${local}/Library`,
  $surfaces: `${local}/Library/Common/dom/surfaces`
});
