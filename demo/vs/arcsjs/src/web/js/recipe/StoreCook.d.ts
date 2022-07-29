/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import { Runtime } from '../Runtime.js';
import { Arc } from '../core/Arc.js';
import { StoreMeta, StoreSpec, Plan } from './types.js';
declare type StoreMapFunc<T> = (runtime: Runtime, arc: Arc, store: {}) => T;
export declare class StoreCook {
    static execute(runtime: Runtime, arc: Arc, plan: Plan): Promise<Promise<void>[]>;
    static evacipate(runtime: Runtime, arc: Arc, plan: Plan): Promise<Promise<void>[]>;
    static forEachStore<T>(runtime: Runtime, arc: Arc, plan: Plan, func: StoreMapFunc<T>): Promise<T[]>;
    static realizeStore(runtime: Runtime, arc: Arc, spec: StoreSpec): Promise<void>;
    static derealizeStore(runtime: Runtime, arc: Arc, spec: StoreSpec): Promise<void>;
    static constructMeta(runtime: Runtime, arc: Arc, spec: StoreSpec): StoreMeta;
}
export {};
