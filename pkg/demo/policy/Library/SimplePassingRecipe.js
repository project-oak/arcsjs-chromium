/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */



export const SimplePassingRecipe = {
  $meta: {
    description: 'Simple Passing'
  },
  $stores: {
    private: {
      $type: 'String',
      $tags: ['private'],
      $value: 'PrivateData'
    },
    public: {
      $tags: ['public'],
      $value: 'PublicData'
    },
    output: {
      $type: 'String',
    }
  },
  main: {
    $kind: '$local/SimplePassingParticle',
    $inputs: ['private', 'public'],
    $outputs: ['output'],
    // handler_name -> [tag -> downgraded-tag]
    $events: {'onClick': ['private', 'public']}
  }
};
