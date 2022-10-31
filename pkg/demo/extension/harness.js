/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import './conf/config.js';
import {makeId} from './conf/allowlist-harness.js';
import {PortBus} from './portbus.js';
import {toJSON} from './dom2json.js';
import {RemoteXen} from './remote-xen.js';
import {HARNESS_ID} from './constants.js';

let lastFocus = null;

export async function bootHarness() {
  console.log("listening");
  var port = chrome.runtime.connect({name: "arcsharness" + Date.now()});
  const backgroundPageBus = new PortBus(port);
  const remote_xen = new RemoteXen(backgroundPageBus);
  backgroundPageBus.sendVibration({kind: 'loaded'});
  captureFocusToArcs(backgroundPageBus);
}

function randomid(element) {
  return makeId(4,4);
}

function captureFocusToArcs(backgroundPageBus) {
  document.body.addEventListener('focus', (event) => {
    if (lastFocus != event.target) {
      console.log("focus event " + event);
      const bounds = event.target?.getBoundingClientRect();
      // probably unsafe, uses timeMillis as unique ID, should be a random #
      if (!event.target.hasAttribute(HARNESS_ID)) {
        event.target.setAttribute(HARNESS_ID, randomid());
      }
      backgroundPageBus.sendVibration({
        kind: 'focus',
        focusElement: {
          ...toJSON(event.target),
          value: event.target.value,
          // this exist to position the UI near the focused element if desired
          bounds,
          host: window.location.host
        }
      });
      lastFocus = event.target;
    }
  }, true);
}


