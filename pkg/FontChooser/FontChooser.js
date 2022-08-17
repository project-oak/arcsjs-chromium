/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {Paths} from './allowlist.js';
import {FontChooserApp} from './FontChooserApp.js';
import {Chooser} from '../Chooser/Chooser.js';

const here = Paths.getAbsoluteHereUrl(import.meta);

export class FontChooser extends Chooser {
  static async requestFont({webFonts, suggested, container, ...options}) {
      return super.request({
            container,
            appData: webFonts,
            obtainPrivateData: requirePrivateFontData,
            suggested
          }
      )
    }
  static buildApp(paths, root, ...options) {
    paths.$local = `${here}/../demo/fonts/Library`;
    return new FontChooserApp(paths, root, options);
  }
};

const requirePrivateFontData = async () => {
  return await init();
};

const init = async () => {
  if (navigator?.fonts?.query) {
    // TODO(wkorman): Note we're punting the `blob` in the real-API-provided `FontMetadata` instance for now.
    // We can maintain the blob reference and provide back to the caller on egress, or even particles in some
    // runtime-managed way, if we determine this is needed down the line.
    const startstamp = performance.now();
    const queryFonts = await navigator.fonts.query({persistentAccess: true});
    const endstamp = performance.now();
    console.log(`Completed native local fonts query [elapsed=${Math.floor(endstamp - startstamp)} ms].`);
    return queryFonts.map(({family, fullName, italic, postscriptName, stretch, style, weight}) => ({family, fullName, italic, postscriptName, stretch, style, weight}));
  } else {
    const startstamp = performance.now();
    const {SAMPLE_FONTS} = await import('./smoke/LargeFontSet.js');
    return SAMPLE_FONTS;
    const endstamp = performance.now();
    console.log(`Completed large driver local font set load [elapsed=${Math.floor(endstamp - startstamp)} ms].`);
  }
};
