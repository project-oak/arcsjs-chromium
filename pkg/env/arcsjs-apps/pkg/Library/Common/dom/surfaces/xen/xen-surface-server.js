/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {logFactory} from '../../../../env/arcs/js/utils/log.js';
import {Paths} from '../../../../env/arcs/js/utils/paths.js';
import {dom} from '../../dom.js';

const log = logFactory(logFactory.flags.surfaces, 'Surfaces', 'goldenrod');

/**
 * Surfaces
 *
 * Produce out-of-context Surface objects loaded via iframe documents.
 */

const defaultSurfacePath = `$surfaces/default/surface.html`;

export class Composer {
}

export class Surface {
  constructor(childWindow) {

  }
  async createComposer(id) {
  }
}

export class SurfaceServer {
  static async create(id, container, surfacePath) {
    log.groupCollapsed(`Surfaces::create("${id}"): creating context...`);
    const path = Paths.resolve(surfacePath || defaultSurfacePath);
    const surface = container ? this.createEmbeddedSurface(id, container, path) : this.createWindowedSurface(id, path);
    return surface;
  }
  static async createWindowedSurface(id, path) {
    return new Promise(resolve => {
      var win = window.open(path); //, id); //'_blank');
      window.addEventListener('message', e => {
        console.warn(e);
      });
      // win.focus();
      // win.onload = this.onloadFactory(win, resolve);
    });
  }
  static async createEmbeddedSurface(id, container, path) {
    return new Promise(resolve => {
      const props = this.getIframeProps(path);
      const iframe = dom('iframe', props, container);
      window.addEventListener('message', ({data: {msg}}) => {
        if (msg === 'bye') {
          iframe.remove();
          // detach listener
        }
        if (msg === '')
        console.warn(e);
      });
      //iframe.onload = this.onloadFactory(iframe.contentWindow, resolve);
    });
  }
  static getIframeProps(src) {
    return {
      id: 'arc',
      style: 'flex: 1; display: flex; flex-direction: column; border: none;',
      hidden: true,
      src
    };
  }
  // static onloadFactory(win, loaded) {
  //   return () => {
  //     log.groupEnd();
  //     log(`context ready.`);
  //     if (!win || !win.surface) {
  //       throw 'failed to locate surface in iframe';
  //     }
  //     const {surface} = win;
  //     // we only return the surface,
  //     // so the surface points-back to the window
  //     surface.win = win;
  //     return loaded(surface);
  //   };
  // }
  static async testRender(surface) {
    const composer = await surface.createComposer('test');
    const packet = {
      id: 'test',
      container: 'root',
      content: {
        template: '<div style="padding: 12px;">{{msg}}</div>',
        model: {msg: 'Hello World'}
      }
    };
    composer.render(packet);
  }
}
