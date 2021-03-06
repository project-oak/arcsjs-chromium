/**
 * @license
 * Copyright 2021 Google LLC.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

const PolicyRenderer = {
  $kind: '$local/PolicyRenderer',
};

export const QuillFontPickerRecipe = {
  $meta: {
    description: 'Quill Font Picker',
    $policy: '$local/policy.json'
  },

  $stores: {
    fonts: {
      $type: `[Key]`,
      $tags: ['simple']
    },
    pickedFont: {
      $type: `FontKey`
    },
    suggested: {
      $type: `[Key]`,
    }
  },

  main: {
    $kind: "$local/QuillFontPicker",
    $bindings: {
      fonts: 'fonts',
      pickedFont: 'pickedFont',
      suggested: 'suggested'
    }
  },
  DevTools: {
    $kind: "$local/DevTools.js",
    $slots: {
      policy: {
        PolicyRenderer
      }
    }
  }
};
