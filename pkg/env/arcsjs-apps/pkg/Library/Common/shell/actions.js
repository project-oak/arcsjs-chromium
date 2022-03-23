/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import * as speech from '../../Actions/SpeechRecipes.js';
import * as poems from '../../Goog/PoemRecipes.js';
import {WebPageDisplayRecipe} from '../../Actions/WebPageDisplayRecipe.js';
import {Action, cloneRecipeForDevices} from '../../RecipeBuilder/Action.js';
import {PlantAction} from '../../Goog/PlantAction.js';
import {TrainAction} from '../../Goog/TrainAction.js';
import {OpenFoodFactsAction, VivinoAction, BeerAction, TranslateAction} from '../../Actions/DefaultActions.js';

export const defaultActions = {
  vivino: VivinoAction,
  off: OpenFoodFactsAction,
  beers: BeerAction,
  plants: PlantAction,
  trains: TrainAction,
  poems: Action.create({
    recipes: [poems.HaikuPoemRecipe],
    name: 'Haiku Writer',
    description: 'Write a haiku poem',
    preview: './Library/RedOwl/assets/feather.png'
  }),
  search: Action.create({
    recipes: [
      speech.Speech2TextRecipe,
      speech.WikiSearchRecipe,
      cloneRecipeForDevices(WebPageDisplayRecipe, 'smartscreen')
    ],
    name: 'Voice search',
    descripiont: 'Search for anything in wikipedia',
    preview: './Library/RedOwl/assets/wikipedia.png'
  }),
  translate: TranslateAction,
};
