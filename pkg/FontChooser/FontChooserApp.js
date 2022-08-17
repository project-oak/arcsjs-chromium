/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import './config.js';
import {App/*, TensorFlowService*/} from './allowlist.js';
import {ChooserApp} from '../Chooser/ChooserApp.js';

import {FontsByFamilyRecipe} from '../demo/fonts/Library/FontsByFamilyRecipe.js';

export class FontChooserApp extends ChooserApp {
  constructor(paths, root, options) {
    super(paths, root, 'pickedFont', FontsByFamilyRecipe, ...options);
  }

  setupBindings() {
    this.arcs.setOpaqueData('fonts', this.chooserData);
    this.arcs.set('user', 'fonts', 'fonts');
    this.arcs.set('user', 'suggested', this.suggested);
  }

  findResult(data) {
    return this.chooserData.find(r => r.fullName == data);
  }
};