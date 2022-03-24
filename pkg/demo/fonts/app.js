/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

// get FontChooer API
import {FontChooser} from '../../FontChooser/FontChooser.js';

// get application specific fonts
import {fonts} from './CustomFontSet.js';

// we need an absolute url to the location of the local library
const local = `${import.meta.url.split('/').slice(0, -1).join('/')}/Library`;

// two FontChooser request examples
const SimpleRequest = {
  // custom recipe
  kind: `${local}/LocalFontsRecipe`,
  // custom fonts
  webFonts: fonts,
  // custom container
  chooser: window.menu,
};

const FamilyRequest = {
  // custom recipe
  kind: `${local}/FontsByFamilyRecipe`,
  // custom fonts
  webFonts: fonts,
  // custom container
  chooser: window.chooser,
  suggested: [
    'DejaVu Sans Oblique',
    'DejaVu Sans Bold Oblique',
    'DejaVu Sans Condensed Oblique',
    'DejaVu Sans Condensed Bold Oblique',
    'DejaVu Sans Mono Bold Oblique',
    'DejaVu Sans Mono Oblique'
  ]
};

// ui

// event hooks
window.onFontsMenu = async () => doit(SimpleRequest);
window.onFontsPanel = async () => doit(FamilyRequest);

const doit = async request => setFont(await requestFont(request));

const setFont = font => {
  console.warn('Chosen font:', font);
  buttonsOn(true);
  test.style.cssText = font && fontMetaToStyle(font);
};

const fontMetaToStyle = ({family, weight, style}) => {
  const fweight = style.includes('Bold') ? 'bold' : weight;
  const fstyle = style.includes('Italic') ? 'italic' : style.includes('Oblique') ? 'oblique' : '';
  return `font-family: "${family}"; font-weight: ${fweight}; font-style: ${fstyle};`;
};

const requestFont = async request => {
  buttonsOn(false);
  return FontChooser.requestFont(request);
};

// express button state
const {b0, b1} = window;
const buttonsOn = trueToEnable => [b0, b1].forEach(e => e.disabled = !trueToEnable);

buttonsOn(true);