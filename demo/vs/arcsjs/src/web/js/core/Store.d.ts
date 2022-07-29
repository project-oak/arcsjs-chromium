/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import { EventEmitter } from './EventEmitter.js';
import { Dictionary, Tag, StoreMeta } from './types.js';
declare class RawStore extends EventEmitter {
    protected _data: any;
    constructor();
    toString(): string;
    get data(): any;
    set data(data: any);
    get isObject(): boolean;
    get pojo(): any;
    get json(): string;
    get pretty(): string;
    get keys(): string[];
    get length(): number;
    get values(): unknown[];
    get entries(): [string, unknown][];
    protected change(mutator: (doc: RawStore) => void): void;
    doChange(): void;
    set(key: string, value: any): void;
    push(...values: any[]): void;
    removeValue(value: any): void;
    has(key: string): boolean;
    get(key: string): any;
    getByIndex(index: number): any;
    delete(key: string): void;
    deleteByIndex(index: number): void;
    assign(dictionary: Dictionary<any>): void;
    clear(): void;
    onChange(store: any): void;
}
export declare class Store extends RawStore {
    meta: Partial<StoreMeta>;
    persistor: any;
    willPersist: boolean;
    constructor(meta: StoreMeta);
    toString(): string;
    isCollection(): boolean;
    get tags(): Tag[];
    is(...tags: Tag[]): boolean;
    doChange(): Promise<void>;
    persist(): Promise<void>;
    restore(value: any): Promise<void>;
    getDefaultValue(): {};
    remove(): Promise<void>;
    save(): string;
    load(value: string): void;
}
export {};
