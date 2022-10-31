/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {HARNESS_ID} from './constants.js';

/**
 * A XenComposer instance that runs in a content-script with a polyfilled
 * webcomponents stack that is lazily injected, and communicates with
 * a remote background page.
 */
export class RemoteXen {
  constructor(bus) {
    this.bus = bus;
    this.init()
  }

  init() {
    this.bus.receiveVibrations(this.receiveVibrations.bind(this));
  }

  async injectComposer() {
    if (this.composer) {
      return;
    }

    const harnessDiv = document.createElement('div');
    harnessDiv.id = "arcsharness";
    document.body.appendChild(harnessDiv);
    const {Composer} = await import("./conf/allowlist-composer.js");
    this.composer = new Composer(harnessDiv, true);
    this.composer.onevent = (pid, eventlet) => {
      this.bus.sendVibration({kind: 'handleEvent', pid, eventlet});
    };
  }

  renderPacket(packet) {
    this.composer?.render(packet);
  }

  async receiveVibrations(msg) {
    if (msg.type === 'render') {
      await this.injectComposer();
      // channel vibrations to the local composer
      this.renderPacket(msg.packet);
    }
    if (msg.kind === 'extension-result') {
      // patch result back in
      const harnessid = msg.result.focusElement.attributes.find(
          x => x[0] == HARNESS_ID) || ['', ''];

      // TODO: use json2dom to patch the element
      const r = document.querySelectorAll(
          '[' + HARNESS_ID + '="' + harnessid[1] + '"]')
      if (r && r[0]) {
        r[0].value = msg.result.focusElement.value;
      }
    }
  };
}