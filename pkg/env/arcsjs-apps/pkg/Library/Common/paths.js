/**
 * @license
 * Copyright 2021 Google LLC.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

// standard libraries are here
const local = import.meta.url.split('/').slice(0, -3).join('/');
globalThis.Paths.add({
  $library: `${local}/Library`,
  $surfaces: `${local}/Library/Common/dom/surfaces`
});
