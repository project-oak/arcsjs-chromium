/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {terser} from 'rollup-plugin-terser';

export default {
  input: 'xen-async.js',
  treeshake: false,
  output: {
    name: 'Xen',
    file: 'build/xen.js',
    format: 'umd',
    plugins: [terser({output: {comments: false}})]
  }
};
