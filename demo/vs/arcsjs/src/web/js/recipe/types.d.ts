/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import { Dictionary } from '../utils/types.js';
export { Dictionary };
export { StoreMeta } from '../core/types.js';
declare type pojo = Record<string, unknown>;
declare type Type = string;
export declare type Tag = string;
export declare type StoreSpec = {
    name: string;
    type: string;
    value?: any;
    tags?: [string];
};
export declare type SlotSpec = {
    $meta?: any;
    $stores?: Dictionary<StoreSpec>;
    $type: Type;
    $tags: Tag[];
    $value?: any;
};
export declare type RecipeSpec = SlotSpec;
export declare type Recipe = {
    $meta?: any;
    $stores?: Dictionary<StoreSpec>;
    $type: Type;
    $tags: Tag[];
    $value?: any;
};
export declare type Container = string;
export declare type ParticleId = string;
export declare type Store = any;
export declare type Slot = {
    $name: string;
    $parent?: string;
} & Recipe;
export declare type Plan = {
    stores: StoreSpec[];
};
export declare type ParticleSpec = {
    $kind: string;
    $bindings?: pojo;
    $inputs?: pojo;
    $outputs?: pojo;
    $staticInputs?: pojo;
    $container: string;
    $slots?: Dictionary<SlotSpec>;
    $meta?: {
        surface: '';
    };
    $claims?: pojo;
    $checks?: pojo;
};
export declare type ParticleNode = {
    id: string;
    container: string;
    spec: ParticleSpec;
};
