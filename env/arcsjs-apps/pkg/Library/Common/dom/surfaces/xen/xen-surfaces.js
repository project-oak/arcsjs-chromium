/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {dom} from '../../dom.js';
import {logFactory, Paths} from '../../../../../arcs-import.js';

const log = logFactory(logFactory.flags.surfaces, 'Surfaces', 'goldenrod');

/**
 * Surfaces
 *
 * Produce out-of-context Surface objects loaded via iframe documents.
 */

const defaultSurfacePath = `$surfaces/default/surface.html`;

export class Surfaces {
  static async create(id, container, surfacePath) {
    log.groupCollapsed(`Surfaces::create("${id}"): creating context...`);
    const path = Paths.resolve(surfacePath || defaultSurfacePath);
    const surface = container ? this.createEmbeddedSurface(id, container, path) : this.createWindowedSurface(id, path);
    return surface;
  }
  static async createWindowedSurface(id, path) {
    return new Promise(resolve => {
      var win = window.open(path, id, {width: 400, height: 400, resizable: false});
      win.focus();
      win.onload = this.onloadFactory(win, resolve);
    });
  }
  static async createEmbeddedSurface(id, container, path) {
    return new Promise(resolve => {
      const props = this.getIframeProps(path);
      const iframe = dom('iframe', props, container);
      iframe.onload = this.onloadFactory(iframe.contentWindow, resolve);
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
  static onloadFactory(win, loaded) {
    const finish = () => {
      log(`context ready.`);
      log.groupEnd();
      // we only return the surface,
      // so the surface points-back to the window
      win.surface.win = win;
      loaded(win.surface);
    };
    return () => {
      log(`context handshake...`);
      if (win?.surface) {
        finish();
      } else {
        // use this to fail eventually
        //setTimeout(ready, surfaceTimeout);
        window.onmessage = (...args) => {
          window.onmessage = null;
          if (!win?.surface) {
            throw 'failed to locate surface in iframe';
          }
          finish();
        }
      }
    };
  }
}
