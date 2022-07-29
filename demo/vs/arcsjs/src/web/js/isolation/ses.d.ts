/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import '../../third_party/ses/ses.umd.min.js';
export declare const initSes: (options?: any) => void;
export declare const createSesParticleFactory: (kind: any, options?: any) => Promise<(host: any) => any>;
