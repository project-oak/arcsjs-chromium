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
    private_texts: {
      $type: '[Text]',
      $tags: ['private'],
      $value: [],
    },
    downgrade_intent: {
      $type: 'Intent',
      $tags: [],
      $value: [],
    },
    output: {
      $type: '[Text]',
      $tags: ['public'],
      $value: [],
    }
  },
  exfil_particle: {
    $kind: './Library/ExfilWithConsentParticle',
    $inputs: [
      {secrets: 'private_texts'}
    ],
    $outputs: [
      {share: 'output'},
      {intent: 'downgrade_intent'},
    ],
    $events: {'onClick': ['private', 'public']}
  },
};