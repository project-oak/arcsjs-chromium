/**
 * @license
 * Copyright 2021 Google LLC.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

const BoldFonts = {
  $kind: '$local/3-FilterBold',
  $bindings: {
    fonts: 'fonts',
    pickedFont: 'pickedFont'
  }
};

export const SlotsRecipe = {
  $meta: {
    description: 'Slots'
  },
  $stores: {
    fonts: {
      $type: `[Key]`,
      $tags: ['simple']
    },
    pickedFont: {
      $type: `FontKey`
    }
  },
  main: {
    $kind: '$local/8-Slots',
    $inputs: ['fonts'],
    $outputs: ['pickedFont'],
    $slots: {
      boldfonts: {
        BoldFonts
      }
    }
  }
};
