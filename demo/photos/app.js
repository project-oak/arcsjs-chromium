/**
 * Copyright 2022 Google LLC
 * 
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {PhotoChooser} from '../../PhotoChooser/PhotoChooser.js';

// we need an absolute url to the location of the local library
const local = `${import.meta.url.split('/').slice(0, -1).join('/')}/Library`;

window.choose = async (kind, container, fileSystem, maxPhotos) => {
  const args = {
    kind: `${local}/${kind}Recipe.js`,
    chooser: window[container],
    fileSystem,
    maxPhotos
  };
  const photo = await PhotoChooser.requestPhoto(args);
  console.warn('Chosen Photo:', photo);
  test.src = photo && photo.photoUrl;
};