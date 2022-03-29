# Creating WebArcs Specs


Arcs components can be declared in WebArcs using Specs. Each spec is a type in
Javascript. To create a recipe/slot/particle/store, the developer creates an
instance (object) of the desired type.

There are three types of Specs in WebArcs:

1.  Recipes
2.  Particles
3.  Stores

The relationship between these elements is shown in the diagram below.

![Recipe-Particle-Store Relationship Diagram](https://cdn.glitch.global/6953c84a-d321-4a8e-ad29-622befcc1c2e/web-arcs-spec-relationships.png?v=1646946882828 "WebArc Specs")

It is easiest to start by explaining a particle.

## Particle Specs

In a basic Particle, we simply include a string representing where to find the
particle’s implementation as the `$kind`. We can also include any inputs as
`$bindings`. In the code example below, the particle can be found in the
`particles/User` file and we have one input: the tenant store.

```
const userDialogParticle = userDialogParticle: {
  $kind: 'particles/User',
  $bindings: {
    tenant: ''
  }
};
```

This is a fairly simple particle, but it is enough to get started.

## Recipe Specs

A Recipe can be as simple as a wrapper around a Particle. For example, the
recipe shown below is a wrapper for the userDialogParticle:

```
const UserDialogRecipe = {
 // particle
 userDialogParticle: {
   $kind: 'particles/User',
   $bindings: {
     tenant: ''
   }
 }
};
```

Because specs are Javascript code, we can refactor this recipe to have the
particle declared separately and then used within the recipe as shown below.

```
const userDialogParticle = userDialogParticle: {
  $kind: 'particles/User',
  $bindings: {
    tenant: ''
  }
};

const UserDialogRecipe = {
 // particle
 userDialogParticle
};
```

While this refactor may seem trivial in our case, for more complex recipes, it
can greatly improve readability. For example, we can compose more complex
systems by "slotting" a recipe into a particle using the `$slots` field:

```
const mainRecipe = {
  $kind: 'particles/Builder',
  $bindings: {
    actions: '',
  },
  $slots: {
    // Slots contain recipes.
    userDialogRecipe
  }
};
```

## Store Specs

Stores are declared very directly. In WebArcs, a store can hold a primitive,
object or an array. Tags such as persisted and public can also be placed on
stores. An initial $value of the store can also be provided. All of this is
shown in the code example below.

```
const $stores = {
  // The most basic store simply holds a primitive value.
  // The only required field is "$type"
  switch: {
    $type: 'Boolean'
  }
  actions: {
     // This store holds an array of Action objects.
    $type: ['Action'],
    // Tags can be applied to a store.
    $tags: ['persisted'],
    // The store should start by holding an empty array.
    $value: []
  }
};
```

## Full Example

We can take this knowledge of stores and include it in our recipes. We can also
have the recipe contain metadata as shown below:

```
// Here we define the stores we will use within the recipe.
const stores = {
  switch: {
    $type: 'Boolean'
  }
  actions: {
     // This store holds an array of Action objects.
    $type: ['Action'],
    // Tags can be applied to a store.
    $tags: ['persisted'],
    // The store should start by holding an empty array.
    $value: []
  }
 };

// Here we define a recipe we will want to use within the main recipe.
const UserDialogRecipe = {
 // particle
 userDialogParticle: {
   $kind: 'particles/User',
   $bindings: {
     tenant: ''
   }
 }
};

const Home = {
 $meta: {
   description: 'My App'
 },
 $stores: stores,
 main: {
   $kind: 'particles/Home',
   $bindings: {
     actions: ''
   },
   $slots: {
     // slot
     selector: {
       // particle
       actionChooser: {
         $kind: 'particles/ActionChooser',
         $bindings: {
           switch: ''
         }
       }
     }, // end selection Recipe
     // Here we use the UserDialogRecipe defined above
     userDialog: UserDialogRecipe
   }
  }
};
```