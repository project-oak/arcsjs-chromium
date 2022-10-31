/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import './Library/ExtensionApp/conf/config.js';
import {paths} from './Library/ExtensionApp/conf/allowlist.js';

import {ExtensionApp} from './Library/ExtensionApp/ExtensionApp.js';

new ExtensionApp(paths).spinup();

