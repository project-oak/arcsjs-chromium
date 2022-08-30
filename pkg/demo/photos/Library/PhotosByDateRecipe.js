/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

const Histogram = {
  $kind: '$local/Histogram',
  $inputs: [{
    url: 'hoverUrl'
  }]
};

const Exif = {
  $kind: '$local/Exif',
  $inputs: [{
    url: 'hoverUrl'
  }]
};

export const PhotosByDateRecipe = {
  $meta: {
    description: 'Local Photos'
  },
  $stores: {
    photos: {
      $type: `[Key]`,
      $tags: ['simple']
    },
    pickedPhoto: {
      $type: `PhotoKey`
    },
    urlWithStars: {
      $type: '[URL]'
    },
    hoverUrl: {
      $type: 'String'
    }
  },
  main: {
    $kind: '$local/PhotosByDate',
    $inputs: ['photos','urlWithStars'],
    $outputs: ['pickedPhoto', 'hoverUrl'],
    $slots: {
      pickedPhotoRecipe: {
        pickedPhotoParticle: {
          $kind: '$local/PickedPhoto',
          $bindings: {
            pickedPhoto: 'pickedPhoto'
          }
        }
      },
      histogram: {
        Histogram
      },
      exif: {
        Exif
      }
    }
  }
};
