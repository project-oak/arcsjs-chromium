/* tslint:disable */
/* eslint-disable */
/**
* @returns {string}
*/
export function version_info(): string;
/**
* @param {string} data
* @returns {string}
*/
export function run_ibis(data: string): string;
/**
* @param {string} data
* @returns {string}
*/
export function all_solutions(data: string): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly version_info: (a: number) => void;
  readonly run_ibis: (a: number, b: number, c: number) => void;
  readonly all_solutions: (a: number, b: number, c: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
}

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
