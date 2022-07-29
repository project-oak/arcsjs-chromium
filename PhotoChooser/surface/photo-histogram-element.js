/**
 * Copyright 2022 Google LLC
 * 
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {Xen} from 'https://web-arcs.web.app/Library/Common/dom/xen/xen-async.js';
import {PhotoHistogramUtil} from '../../third_party/photo-histogram/photo-histogram.js';
import {css} from '../../third_party/photo-histogram/photo-histogram.css.js';

const template = Xen.Template.html`
<style>
  :host {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  * {
    box-sizing: border-box;
  }
  [flex] {
    flex: 1;
  }
</style>

<img style="display:none" id="input" src="{{src}}">
<div id="histogram"></div>

<style>${css}</style>
`;


class PhotoHistogramElement extends Xen.Async {
  static get observedAttributes() {
    return ['src'];
  }
  get template() {
    return template;
  }

  async update({src}, state) {
    console.warn(src);

    if (src) {
      const input = this._dom.root.getElementById('input');
      input.crossOrigin = "Anonymous";
      input.src = src;
      const histogram = this._dom.root.getElementById('histogram');
      histogram.innerHTML = '';

      const loadPromise = new Promise((resolve, reject) => {
        input.onload = () => resolve();
        input.onerror = () => reject();
      });
      await loadPromise;
      let h = new PhotoHistogramUtil.Ui(histogram, input);

    }
  }
}

// make sure that the <hello-world></hello-world>
// or simply <hello-world /> is recognised as this element
customElements.define("photo-histogram", PhotoHistogramElement);