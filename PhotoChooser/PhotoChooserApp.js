/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {ChooserApp} from '../Chooser/ChooserApp.js';
import {PhotosByDateRecipe} from '../demo/photos/Library/PhotosByDateRecipe.js';
import {ExifService} from './ExifService.js';

export const PhotoChooserApp = class extends ChooserApp {
  constructor(paths, root, options) {
    super(paths, root);
    this.photoData = options?.photoData;
    //this.suggested = options?.suggested;
    this.userAssembly = options?.recipe || [PhotosByDateRecipe];
    this.services = {ExifService};
  }
  async spinup() {
    await super.spinup();
    // input startup data
    this.arcs.setOpaqueData('photos', this.photoData);
    this.arcs.set('user', 'photos', 'photos');
    //this.arcs.set('user', 'suggested', this.suggested);
    // look for data egress
    this.arcs.watch('user', 'pickedPhoto', pickedPhoto => {
      const photo = this.photoData.find(r => r.photoUrl === pickedPhoto);
      this.onresult(photo);
    });
  }
  onresult(photo) {
    // client should override
  }
};