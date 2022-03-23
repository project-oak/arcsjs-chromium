/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

 export const share = ({name, type}) => ({
  // my private library
  [`${name}Private`]: {
    $type: `[${type}]`,
    $tags: ['persisted'],
    $value: []
  },
  // my shared library
  [`${name}Shared`]: {
    $type: `[${type}]`,
    $tags: ['persisted', 'shared'],
    $value: []
  },
  // all the libraries that are shared (by anybody)
  [`${name}Aggregate`]: {
    $type: `[${type}]`,
    $tags: ['persisted', 'aggregate', `name:${name}Shared`],
    $value: []
  }
});