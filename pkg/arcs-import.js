/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
const locale = globalThis.config?.localArcsjs ? 'local': 'cdn';
const path = `./env/arcs-${locale}.js`;
export const {
  logFactory, utils, pathForKind, Params,
  Runtime, Services, Paths, Surfaces, Decorator,
  Chef,
  FirebasePersistor, LocalStoragePersistor, awaitLoginChange,
  RecipeService
} = await import(path);
