/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {PhotoChooser} from '../../PhotoChooser/PhotoChooser.js';
import {FontChooser} from '../../FontChooser/FontChooser.js';
import {fonts} from '../fonts/CustomFontSet.js';

// we need an absolute url to the location of the local library
const localPhoto = `${import.meta.url.split('/').slice(0, -1).join(
    '/')}/../photos/Library`;
const localFont = `${import.meta.url.split('/').slice(0, -1).join(
    '/')}/Library`;

window.choosePhoto = async (kind, container, fileSystem, maxPhotos) => {
  const args = {
    kind: `${localPhoto}/${kind}Recipe.js`,
    chooser: window[container],
    fileSystem,
    maxPhotos
  };
  const photo = await PhotoChooser.requestPhoto(args);
  console.warn('Chosen Photo:', photo);
  return photo.photoUrl;
  // test.src = photo && photo.photoUrl;
};

window.chooseFont = async (kind, container) => {
  const args = {
    kind: `${localFont}/${kind}Recipe.js`,
    chooser: container,
    webFonts: fonts,
    suggested: [
      'DejaVu Sans Oblique',
      'DejaVu Sans Bold Oblique',
      'DejaVu Sans Condensed Oblique',
      'DejaVu Sans Condensed Bold Oblique',
      'DejaVu Sans Mono Bold Oblique',
      'DejaVu Sans Mono Oblique',
      'Arial',
      'Futura',
      'Comic Sans MS',
      'Papyrus',
      'Impact',
      'Chalkduster'
    ]
  };
  const font = await FontChooser.requestFont(args);
  console.warn('Chosen Font:', font);
  return font;
  // test.src = photo && photo.photoUrl;
};

const choosePhoto = window.choosePhoto;
const chooseFont = window.chooseFont;

export {choosePhoto, chooseFont};


