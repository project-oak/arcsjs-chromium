/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import { logKinds, errKinds } from './types.js';
const { fromEntries } = Object;
const _logFactory = (enable, preamble, color, kind = 'log') => {
    if (!enable) {
        return () => { };
    }
    if (kind === 'dir') {
        return console.dir.bind(console);
    }
    const style = `background: ${color || 'gray'}; color: white; padding: 1px 6px 2px 7px; border-radius: 6px 0 0 6px;`;
    return console[kind].bind(console, `%c${preamble}`, style);
};
export const logFactory = (enable, preamble, color = '') => {
    const debugLoggers = fromEntries(logKinds.map(kind => [kind, _logFactory(enable, preamble, color, kind)]));
    const errorLoggers = fromEntries(errKinds.map(kind => [kind, _logFactory(true, preamble, color, kind)]));
    const loggers = { ...debugLoggers, ...errorLoggers };
    // Inject `log` as default, keeping all loggers available to be invoked by name.
    const log = loggers.log;
    Object.assign(log, loggers);
    return log;
};
logFactory.flags = globalThis.config.logFlags || {};
