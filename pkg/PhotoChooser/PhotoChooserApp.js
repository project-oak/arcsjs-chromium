/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import './config.js';
import {App/*, TensorFlowService*/} from './allowlist.js';

import {PhotosByDateRecipe} from '../demo/photos/Library/PhotosByDateRecipe.js';
import {EXIF_MSG, ExifService} from './ExifService.js';
import {ChooserApp} from '../Chooser/ChooserApp.js';

export const PhotoChooserApp = class extends ChooserApp {
  constructor(paths, root, options) {
    super(paths, root, 'pickedPhoto', PhotosByDateRecipe, ...options);
  }

  onservice(runtime, host, request) {
    if (request.kind == EXIF_MSG) {
      return ExifService(request.url);
    }
  }

  setupBindings() {
    this.arcs.setOpaqueData('photos', this.chooserData);
    this.arcs.set('user', 'photos', 'photos');
  }

  findResult(data) {
    return this.chooserData.find(r => r.photoUrl == data);
  }
};