/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {Xen} from '../xen/xen-async.js';

const surfaces = [];

export class ArcsSurface extends Xen.Async {
  constructor() {
    super();
    surfaces.push(this);
  }
  static get surfaces() {
    return surfaces;
  }
  static get observedAttributes() {
    return [];
  }
  get template() {
    return template;
  }
  _didMount() {
    // this.state = {
    //   panel0: this._dom.$('#panel0'),
    //   panel1: this._dom.$('#panel1')
    // };
  }
  update({}, state) {
  }
  // render({}, {}) {
  // }
}

customElements.define('arcs-surface', ArcsSurface);

const template = Xen.Template.html`
  <h1>arc-surface element test</h1>
  <slot></slot>
`;
