/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

const SuggestedFonts = {
  $kind: '$local/SuggestedFonts',
  $inputs: ['fonts', 'suggested'],
  $outputs: ['pickedFont']
};

export const FontsByFamilyRecipe = {
  $meta: {
    description: 'fonts by family'
  },
  $stores: {
    fonts: {
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
    $inputs: ['fonts'],
    $outputs: ['pickedFont'],
    $slots: {
      suggested: {
        SuggestedFonts
      }
    }
  }
};
