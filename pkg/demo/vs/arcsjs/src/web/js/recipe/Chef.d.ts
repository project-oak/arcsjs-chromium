/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import { Arc } from '../core/Arc.js';
import { Runtime } from '../Runtime.js';
import { RecipeSpec } from './types.js';
export declare class Chef {
    static execute(recipe: RecipeSpec, runtime: Runtime, arc: Arc): Promise<void>;
    static evacipate(recipe: RecipeSpec, runtime: Runtime, arc: Arc): Promise<void>;
    static executeAll(recipes: RecipeSpec[], runtime: Runtime, arc: Arc): Promise<void[]>;
    static evacipateAll(recipes: RecipeSpec[], runtime: Runtime, arc: Arc): Promise<void[]>;
}
