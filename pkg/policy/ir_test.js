/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {PolicyGenerator} from './recipe2policy.js';
import {SimpleRecipeIr} from './simplerecipe_test_ir.js';
import {SimpleRecipe} from './simple_recipe.js';


const policyGen = new PolicyGenerator(SimpleRecipe, "SimpleRecipe");
const ir = policyGen.recipeToIr();
console.log(ir);
console.assert(ir.trim() == SimpleRecipeIr.trim(),
    "IR don't match");
