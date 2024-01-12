/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {Persistor} from './conf/allowlist.js';

export class ChromePersistor extends Persistor {

  upload(key, serial) {
    if (serial) {
      chrome.storage.local.set({[key]: serial}, (result) => {
        console.log("Storing " + serial + " at key " + key);
      });
    }
  }

  async download(key) {
    return await new Promise((resolve, reject) => {
      console.log("Getting " + key);
      chrome.storage.local.get([key], (result) => {
        console.log("Found " + JSON.stringify(result));
        resolve(result[key] || "null")
      });
    });
  }
};