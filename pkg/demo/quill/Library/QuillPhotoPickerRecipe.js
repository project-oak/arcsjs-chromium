/**
 * @license
 * Copyright 2021 Google LLC.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

export const QuillPhotoPickerRecipe = {
  $meta: {
    description: 'Quill Photo Picker'
  },
  $stores: {
    photos: {
      $type: `[Key]`,
      $tags: ['simple']
    },
    pickedPhoto: {
      $type: `PhotoKey`
    },
  },

  main: {
    $kind: "$local/../../quill/Library/QuillPhotoPicker",
    $inputs: ['photos'],
    $outputs: ['pickedPhoto'],
  }
};
