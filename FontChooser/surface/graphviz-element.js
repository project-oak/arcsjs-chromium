/**
 * Copyright 2022 Google LLC
 * 
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {Xen} from 'https://web-arcs.web.app/Library/Common/dom/xen/xen-async.js';

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

<div id="root"></div>
`;


class GraphvizElement extends Xen.Async {
  static get observedAttributes() {
    return ['dot'];
  }
  get template() {
    return template;
  }

  async update({dot}, state) {
    // console.warn(dot);

    if (dot) {
      try {
        var graphviz = await d3.select(
            this._dom.root.getElementById('root')).graphviz().renderDot(dot);
      } catch (e) {
        console.log(e);
      }
    }
  }
}

// make sure that the <hello-world></hello-world>
// or simply <hello-world /> is recognised as this element
customElements.define("graphviz-element", GraphvizElement);