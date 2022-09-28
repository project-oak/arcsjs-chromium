/**
 * @license
 * Copyright 2021 Google LLC.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

export const QuillFontPickerRecipe = {
  $meta: {
    description: 'Quill Font Picker',
  },

  $stores: {
    fonts: {
      $type: `[Key]`,
      $tags: ['private']
    },
    pickedFont: {
      $type: `FontKey`,
      $tags: ['public']
    },
    suggested: {
      $type: `[Key]`,
      $tags: ['public']
    },
    downgrade_intent: {
      $type: 'Intent',
      $tags: [],
      $value: [],
    }
  },

  main: {
    $kind: "$local/../../quill/Library/QuillFontPicker",
    $inputs: ['fonts', 'suggested'],
    $outputs: ['pickedFont', 'downgrade_intent'],
    $events: {'onFontClick': ['private', 'public']}
  },
 };
