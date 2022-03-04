/**
 * Copyright 2022 Google LLC
 * 
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
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
