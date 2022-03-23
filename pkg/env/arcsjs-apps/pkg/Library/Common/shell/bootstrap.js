/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {Runtime} from '../../../env/arcs/js/Runtime.js';
import {realmsParticle} from '../../env/arcs/js/isolation/realms.js';

Runtime.lateBindParticle = async (runtime, kind, options) => {
  return realmsParticle(kind, options);
};
