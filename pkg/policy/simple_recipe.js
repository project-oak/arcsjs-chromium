/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
export const SimpleRecipe = {
  $meta: {
    description: 'A very simple recipe',
  },
  $stores: {
    public_texts: {
      $type: '[Text]',
      $tags: ['public'],
      $value: [],
    },
    ignored_data: {
      $type: '[Text]',
      // $tags: ['public'],
      $value: [],
    },
    output: {
      $type: '[Text]',
      $tags: ['public'],
      $value: [],
    }
  },
  exfil_particle: {
    $kind: './Library/ExfilParticle',
    $inputs: [
      {bar: 'public_texts'},
      {foo: 'ignored_data'},
    ],
    $outputs: [
      {baz: 'output'},
    ],
  }
};