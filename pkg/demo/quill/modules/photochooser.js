/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

const Module = Quill.import('core/module');
const Delta = Quill.import('delta');

import {choosePhoto} from '../app.js';


class PhotoChooser extends Module {
  constructor(quill, options) {
    super(quill, options);
    this.quill = quill;
    this.toolbar = quill.getModule('toolbar');
    if (typeof this.toolbar !== 'undefined')
      this.toolbar.addHandler('image', this.photoChooser);
  }

  async photoChooser() {
    const photo = await choosePhoto('PhotosByDate', 'chooser', true, 12);
    const range = this.quill.getSelection(true);
    const delta = new Delta().retain(range.index).delete(range.length);
    delta.insert({image: photo});
    this.quill.updateContents(delta, 'user');
    this.quill.setSelection(
        range.index + 1,
        'silent',
    );
  }
}

export {
  PhotoChooser
};
