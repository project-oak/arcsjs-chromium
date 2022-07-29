/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

/**
 * @packageDocumentation
 * @module devices
**/

import {logFactory, Surface} from '../../../../../arcs-import.js';
import {dom, deepQuerySelector} from '../../dom.js';
import {XenComposer} from './xen-composer.js';

const log = logFactory(logFactory.flags.composer, 'xen-surface', 'tomato');

export class XenSurface extends Surface {
  constructor(container, useShadowRoot) {
    super();
    this.useShadowRoot = useShadowRoot;
    this.container = container;
    this.root = this.createContainer('arcs-surface', container);
  }
  activate() {
    this.root.style.display = 'flex';
  }
  deactivate() {
    this.root.style.display = 'none';
  }
  createSubSurface(id, options) {
    const node = deepQuerySelector(options?.root || this.root, `#${id}`);
    if (node) {
      const subSurface = new XenSurface(node, !(options?.noShadowRoot));
      subSurface.service = req => this.service(req);
      //subSurface.root.style.display = 'none';
      return subSurface;
    }
  }
  createContainer(id, parent) {
    return dom('div', {
      id,
      style: 'flex: 1; display: flex; flex-direction: column; overflow: hidden;'
    }, parent);
  }
  async createComposerInstance(id) {
    log(`createComposerInstance("${id}")`);
    const node = this.createContainer('arc', this.root);
    //const node = this.root;
    const composer = new XenComposer(node, this.useShadowRoot);
    //this.composerActivated(composer);
    return composer;
  }
  // composerActivated(composer) {
  //   if (this.activeComposer !== composer) {
  //     this.setActiveDisplay('none');
  //   }
  //   super.composerActivated(composer);
  //   this.setActiveDisplay('flex');
  //    // manual adjustment
  //    if (composer) {
  //     this.aframeFixup(composer);
  //   }
//   // }
//   setActiveDisplay(display) {
//     if (this.activeComposer) {
//       this.activeComposer.root.style.display = display;
//     }
//   }
//  aframeFixup(composer) {
//     // TODO(sjmiles): a-scene does resize() on window.resize, but
//     // not when container resizes; maybe we can fix it there
//     const scene = deepQuerySelector(composer.root, `a-scene`);
//     if (scene) {
//       setTimeout(() => scene.resize(), 1);
//     }
//   }
}
