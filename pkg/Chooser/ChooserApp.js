/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import './config.js';
import {App/*, TensorFlowService*/} from './allowlist.js';

/**
 * Base class for all Chooser apps. Use setupBindings() override to configure
 * data to be passed to the recipe, and findResult() to locate the chosen
 * data record from chooserData.
 * @type {ChooserApp}
 */
export const ChooserApp = class extends App {
  constructor(paths, root, egressName, recipe, options) {
    super(paths, root);
    this.chooserData = options?.chooserData;
    this.suggested = options?.suggested;
    this.userAssembly = [recipe];
    this.services = options?.services;
    this.egressName = egressName;
  }
  async spinup() {
    await super.spinup();
    // input startup data
    this.setupBindings();

    // look for data egress
    this.arcs.watch('user', this.egressName, pickedData => {
      const result = this.findResult(pickedData);
      this.onresult(result);
    });

  }

  setupBindings() {
    //
  }

  findResult(data) {
    // client should override
  }

  onresult(data) {
    // client should override
  }
};