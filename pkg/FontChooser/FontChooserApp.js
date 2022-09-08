/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {TensorFlowService} from '../Chooser/conf/allowlist.js';
import {ChooserApp} from '../Chooser/ChooserApp.js';
import {FontsByFamilyRecipe} from '../demo/fonts/Library/FontsByFamilyRecipe.js';

function requireArray(arg) {
  if (Array.isArray(arg)) {
    return arg;
  }
  if (arg) {
    return [arg];
  }
  return arg;
}

export const FontChooserApp = class extends ChooserApp {
  constructor(paths, root, options) {
    super(paths, root);
    this.fontData = options?.fontData;
    this.suggested = options?.suggested;
    this.userAssembly = requireArray(options?.recipe) || [FontsByFamilyRecipe];
    this.services = {TensorFlowService};
  }

  async spinup() {
    await super.spinup();
    // input startup data
    this.arcs.setOpaqueData('fonts', this.fontData);
    this.arcs.set('user', 'fonts', 'fonts');
    this.arcs.set('user', 'suggested', this.suggested);
    // look for data egress
    this.arcs.watch('user', 'pickedFont', pickedFont => {
      const font = this.fontData.find(r => r.fullName === pickedFont);
      this.onresult(font);
    });
  }
  onresult(font) {
    // client should override
  }
};