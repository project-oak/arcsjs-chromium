/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const LocalFontsRecipe = {
  $meta: {
    description: 'local fonts'
  },
  $stores: {
    fonts: {
      $type: '[Key]',
      $tags: ['simple']
    },
    families: {
      $type: '[Key]',
      $tags: ['simple']
    },
    pickedFont: {
      $type: 'FontKey'
    }
  },
  main: {
    $kind: '$local/LocalFonts',
    $bindings: {
      fonts: '',
      families: '',
      pickedFont: ''
    }
  }
};
