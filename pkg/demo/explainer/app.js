import {FontChooser} from '../../FontChooser/FontChooser.js';
import {fonts} from './CustomFontSet.js';

// we need an absolute url to the location of the local library
let local = `${window.location.href}`;
if (local.endsWith('.html')) {
  local = local.substring(0, local.lastIndexOf('/') + 1);
}

local = local + 'Library';

// express button state
const {b0, e1, e2, e3, e4, e5, e6, e7, e8, e9} = window;
const buttonsOn = trueToEnable => [b0, e1, e2, e3, e4, e5, e6, e7, e8, e9].forEach(e => e.disabled = !trueToEnable);

// two FontChooser request examples

const SampleRequest = {
  // custom recipe
  kind: `${local}/LocalFontsRecipe`,
  // custom fonts
  webFonts: fonts,
  // custom container
  chooser: window.menu
};

const SimpleRequest = {
  // custom recipe
  kind: `${local}/LocalFontsRecipe`,
  // custom fonts
  webFonts: fonts,
  // custom container
  chooser: window.menu
};

const FamilyRequest = {
  // custom recipe
  kind: `${local}/FullDemo`,
  // custom fonts
  webFonts: fonts,
  // custom container
  chooser: window.chooser
};

// ui

window.onFontsMenu = async () => {
  doit(SimpleRequest);
};

window.onFontsPanel = async () => {
  doit(FamilyRequest);
};

window.onSamplePanel = async (recipe) => {
  SampleRequest.kind = `${local}/${recipe}Recipe`;
  console.log(SampleRequest.kind);
  doit(SampleRequest);
};

const doit = async request => {
  setFont(await requestFont(request));
};

const requestFont = async request => {
  buttonsOn(false);
  return FontChooser.requestFont(request);
};

const setFont = font => {
  buttonsOn(true);
  console.warn('Chosen font:', font);
  test.style.cssText = font && fontMetaToStyle(font);
};

const fontMetaToStyle = ({family, fullName, weight, style}) => {
  const fweight = style.includes('Bold') ? 'bold' : weight;
  const fstyle = style.includes('Italic') ? 'italic' : style.includes('Oblique') ? 'oblique' : '';
  return `font-family: "${family}"; font-weight: ${fweight}; font-style: ${fstyle};`;
};

buttonsOn(true);
