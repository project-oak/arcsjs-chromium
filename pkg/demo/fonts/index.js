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
import {FontsByFamilyRecipe} from './Library/FontsByFamilyRecipe.js';
import {LocalFontsRecipe} from './Library/LocalFontsRecipe.js';
// two FontChooser request examples
const SimpleRequest = {
  // custom recipe
  kind: LocalFontsRecipe,
  // custom fonts
  webFonts: fonts
};

const FamilyRequest = {
  // custom recipe
  kind: FontsByFamilyRecipe,
  // custom fonts
  webFonts: fonts,
  // custom values
  suggested: [
    'DejaVu Sans Oblique',
    'DejaVu Sans Bold Oblique',
    'DejaVu Sans Condensed Oblique',
    'DejaVu Sans Condensed Bold Oblique',
    'DejaVu Sans Mono Bold Oblique',
    'DejaVu Sans Mono Oblique'
  ]
};

// can request font chooser here
const requestFont = async request => {
  buttonsOn(false);
  return FontChooser.requestFont(request);
};

// ui

// event hooks
window.onFontsMenu = async () => {
  const ux = window.menu;
  ux.setAttribute('show', '');
  SimpleRequest.container = ux;
  const font = await requestFont(SimpleRequest);
  ux.removeAttribute('show');
  setFont(font);
};

window.onFontsPanel = async () => {
  const ux = window.chooser;
  ux.setAttribute('show', '');
  FamilyRequest.container = ux;
  const font = await requestFont(FamilyRequest);
  ux.removeAttribute('show');
  setFont(font);
};

const setFont = font => {
  console.warn('Chosen font:', font);
  buttonsOn(true);
  window.test.style.cssText = font && fontMetaToStyle(font);
};

const fontMetaToStyle = ({family, weight, style}) => {
  const fweight = style.includes('Bold') ? 'bold' : weight;
  const fstyle = style.includes('Italic') ? 'italic' : style.includes('Oblique') ? 'oblique' : '';
  return `font-family: "${family}"; font-weight: ${fweight}; font-style: ${fstyle};`;
};

// express button state
const {b0, b1} = window;
const buttonsOn = trueToEnable => [b0, b1].forEach(e => e.disabled = !trueToEnable);

buttonsOn(true);