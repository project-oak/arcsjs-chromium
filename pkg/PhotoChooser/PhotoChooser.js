/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {Paths} from './allowlist.js';
import {PhotoChooserApp} from './PhotoChooserApp.js';
import {SAMPLE_PHOTOS} from './smoke/SmallPhotoSet.js';
import {getFileSystemPhotoSet} from './FileSystemPhotoSet.js';
import {Chooser} from '../Chooser/Chooser.js';

const here = Paths.getAbsoluteHereUrl(import.meta);

export class PhotoChooser extends Chooser {
  static async requestPhoto({fileSystem, maxPhotos, chooser}) {
    return super.request({
          container: chooser,
          appData: [],
          obtainPrivateData: requirePrivatePhotoData
        }
    )
  }

  static buildApp(paths, root, ...options) {
    paths.$local = `${here}/../demo/photos/Library`;
    return new PhotoChooserApp(paths, root, options);
  }
};

const requirePrivatePhotoData = async (fileSystem, maxPhotos) => {
  return await init(fileSystem, maxPhotos);
};


const init = async (fileSystem, maxPhotos) => {
  let data;
  if (fileSystem) {
    data = await getFileSystemPhotoSet();
  }
  if (!data) {
    data = SAMPLE_PHOTOS
  }

  return data.slice(0, maxPhotos || 12);
}