/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import process from 'process';
export const port = process.env.npm_package_config_port;
console.log(port);
