/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
// load a loader
import {loadCss} from '../../dom.js';

// common surface implementation
export {XenSurface as Surface} from '../xen/xen-surface.js';

// locate self relative to document
const moduleRef = import.meta.url.split('/').slice(0, -3).join('/');
// material icon font
await loadCss(`${moduleRef}/material-icon-font/icons.css`);

// Material Web Components
import '../../mwc/mwc.js';
import '../../material-xen/material-xen.js';

// used in DevTools
//import '../../arcs-elements/arcs-elements.js';
