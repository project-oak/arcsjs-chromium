/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {App} from '../env/arcsjs/Library/App/Worker/App.js';
import {FontsByFamilyRecipe} from '../demo/fonts/Library/FontsByFamilyRecipe.js';
export {logFactory} from '../env/arcsjs/core/utils.min.js';
import '../env/arcsjs/Library/App/surface-imports.js';

const suggested = [];

export const FontChooserApp = class extends App {
  constructor(paths, root, options) {
    super(paths, root);
    this.fontData = options?.fontData;
    this.suggestion = options?.suggested;
    this.userAssembly = [FontsByFamilyRecipe];
  }
  async spinup() {
    await super.spinup();
    // input startup data
    this.arcs.setOpaqueData('fonts', this.fontData);
    this.arcs.set('user', 'fonts', 'fonts');
    this.arcs.set('user', 'suggested', suggested);
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