/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

// Path discovery
import {Paths} from '../../arcs-import.js';
// discover library path
const dom = Paths.resolve(`$library/Common/dom`);
// import CSS loader
const {loadCss} = await import(`${dom}/dom.js`);
// provide common surface implementation
export const {XenSurface: Surface} = await import(`${dom}/surfaces/xen/xen-surface.js`);
// material icon font
await loadCss(`${dom}/material-icon-font/icons.css`);
// Material Web Components
await import(`${dom}/mwc/mwc.js`);
await import(`${dom}/material-xen/material-xen.js`);
// bespoke elements
await import(`./photo-histogram-element.js`);