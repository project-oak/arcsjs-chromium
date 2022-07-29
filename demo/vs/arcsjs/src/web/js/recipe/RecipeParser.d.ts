/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import { Dictionary, SlotSpec, RecipeSpec, Recipe, Container, ParticleSpec, ParticleId, Store, Slot } from './types.js';
export declare class Parser {
    stores: any[];
    particles: {
        id: ParticleId;
        container: Container;
        spec: ParticleSpec;
    }[];
    slots: Slot[];
    meta: any;
    constructor(recipe: Recipe);
    parse(recipe: Recipe): Parser;
    normalize(recipe: Recipe): Recipe;
    parseSlotSpec(spec: Recipe, slotName: string, parentName: string): void;
    parseStoresNode(stores: Dictionary<Store>): void;
    parseStoreSpec(name: string, spec: RecipeSpec): void;
    parseParticleSpec(container: Container, id: ParticleId, spec: ParticleSpec): void;
    parseSlotsNode(slots: Dictionary<SlotSpec>, parent: string): void;
}
