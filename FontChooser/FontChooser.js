/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import './conf/config.js';
import {Paths} from './conf/allowlist.js';
import {FontChooserApp} from './FontChooserApp.js';

const here = Paths.getAbsoluteHereUrl(import.meta);

const paths = {
  $app: `${here}`,
  $config: `${here}/conf/config.js`,
  $library: `${globalThis.config.arcsjs}/Library`,
  $local: `${here}/../demo/fonts/Library`
};

let privateFontData;

export const FontChooser = {
  async requestFont({webFonts, suggested, container, ...options}) {
    const privateFontData = await requirePrivateData();
    const fontData = [...privateFontData, ...webFonts];
    //
    const app = new FontChooserApp(options?.paths || paths, container || document.body, {fontData, suggested, recipe: options.kind});
    await app.spinup();
    //
    return new Promise(resolve => {
      app.onresult = font => {
        resolve(font);
      };
    });
  }
};

const requirePrivateData = async () => {
  if (!privateFontData) {
    await init();
  }
  return privateFontData;
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
    privateFontData = queryFonts.map(({family, fullName, italic, postscriptName, stretch, style, weight}) => ({family, fullName, italic, postscriptName, stretch, style, weight}));
  } else {
    const startstamp = performance.now();
    const {SAMPLE_FONTS} = await import('./LargeFontSet.js');
    privateFontData = SAMPLE_FONTS;
    const endstamp = performance.now();
    console.log(`Completed large driver local font set load [elapsed=${Math.floor(endstamp - startstamp)} ms].`);
  }
};
