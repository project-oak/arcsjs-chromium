/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {publish} from './client.js';

export class BridgeComposer {
  activate() {
    this.fire('activate');
  }
  render(packet) {
    publish({kind: 'packet', data: packet});
  }
}

export class BridgeSurface {
  activate() {
  }
  deactivate() {
  }
  async createComposer(id) {
    const composer = this.createComposerInstance(id);
    this.composer = composer;
    //composer.listen('activate', () => this.composerActivated(composer));
    return composer;
  }
  createComposerInstance(id) {
    return new BridgeComposer();
  }
  composerActivated(composer) {
    //this.activeComposer = composer;
  }
  activateComposer(composer) {
    // this.activate();
    // this.composerActivated(composer);
  }
  onevent(pid, eventlet) {
    this.composer.onevent(pid, eventlet);
  }
}
