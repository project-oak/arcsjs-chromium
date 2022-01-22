/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

const SuggestedFonts = {
  $kind: '$local/SuggestedFonts',
  $bindings: {
    fonts: '',
    pickedFont: '',
    suggested: 'suggested'
  }
}

export const FontsByFamilyRecipe = {
  $meta: {
    description: 'fonts by family'
  },
  $stores: {
    fonts: {
      $type: '[FontKey]',
      $tags: ['simple']
    },
    families: {
      $type: '[FontKey]',
      $tags: ['simple']
    },
    suggested: {
      $type: '[String]',
    },
    pickedFont: {
      $type: 'FontKey'
    }
  },
  main: {
    $kind: '$local/FontsByFamily',
    $bindings: {
      fonts: '',
      families: '',
      pickedFont: '',
    },
    $slots: {
      suggested: {
        SuggestedFonts
      },
    }
  }
};
