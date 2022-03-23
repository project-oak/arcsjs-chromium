/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

// load helpers
import {define, loadCss, loadScript} from 'https://arcsjs-apps.web.app/Library/Common/dom/dom.js';
// Xen (DOM) surface implementation
export {XenSurface} from 'https://arcsjs-apps.web.app/Library/Common/dom/surfaces/xen/xen-surface.js';

// All of this is for DevTools

// material icon font
loadCss('https://arcsjs-apps.web.app/Library/Common/dom/material-icon-font/icons.css');
// Material Web Components
import 'https://arcsjs-apps.web.app/Library/Common/dom/mwc/mwc.js';
// more
import 'https://arcsjs-apps.web.app/Library/Common/dom/material-xen/material-xen.js';
// other
import 'https://arcsjs-apps.web.app/Library/Common/dom/arcs-elements/expandable-item.js';
