/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {MessageBus} from './conf/allowlist-harness.js';

export class PortBus extends MessageBus {
  constructor(port) {
    // TODO: ugly, add better support in Core
    port.addEventListener = (x, y) => {
      if (x === 'message') {
        port.onMessage.addListener(y);
      }
    };
    super(port);
  }
}
