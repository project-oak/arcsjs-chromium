/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {PhotoChooser} from './modules/photochooser.js';
import {BlobImage} from './formats/blobimage.js';
import {ArcsTheme} from './themes/arcs.js';


Quill.register({
  'modules/photochooser': PhotoChooser,
  'formats/blobimage': BlobImage,
  'themes/arcs': ArcsTheme
}, true);

export {
  PhotoChooser, BlobImage, ArcsTheme
}