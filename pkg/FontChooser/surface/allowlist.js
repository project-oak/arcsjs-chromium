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
const dom = Paths.resolve(`$library/Dom`);
// import CSS loader
const {loadCss} = await import(`${dom}/dom.js`);
// provide common surface implementation
export const {XenSurface: Surface} = await import(`${dom}/surfaces/xen/xen-surface.js`);
// material icon font
await loadCss(`${dom}/material-icon-font/icons.css`);
// Material Web Components
await import(`${dom}/arcs-elements/expandable-item.js`);
await import(`${dom}/mwc/mwc.min.js`);
await import(`${dom}/material-xen/material-xen.js`);
await import(`${dom}/data-explorer/data-item.js`);
await import('https://arcsjs-apps.web.app/Library/DevTools/resource-view.js');
await import(`./graphviz-element.js`);
await import(`${dom}/surfaces/xen/surface-walker.js`);
