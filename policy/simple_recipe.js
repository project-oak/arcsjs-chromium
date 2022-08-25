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