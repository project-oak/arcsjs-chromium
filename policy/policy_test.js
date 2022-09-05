import {PolicyGenerator} from './recipe2policy.js';
import {SimpleRecipeProto} from './simplerecipe_test_proto.js';
import {SimpleRecipe} from './simple_recipe.js';


const policyGen = new PolicyGenerator(SimpleRecipe, "SimpleRecipe");
const proto = policyGen.recipeToPolicy();
console.assert(JSON.stringify(proto) == JSON.stringify(SimpleRecipeProto),
    "Protos don't match");
