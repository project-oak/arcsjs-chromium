/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const TensorFlow = await new Promise(async resolve => {
  if (!globalThis.tf) {
    await import(`./tf.3.16.0.min.js`); // ./tf.js
  }
  resolve(globalThis.tf);
});
