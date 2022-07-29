/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */


import {Runtime} from '../../../env/arcs/js/Runtime.js';
import {realmsParticle} from '../../env/arcs/js/isolation/realms.js';

Runtime.lateBindParticle = async (runtime, kind, options) => {
  return realmsParticle(kind, options);
};
