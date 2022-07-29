/**
 * Copyright 2022 Google LLC
 * 
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import '../../third_party/exif-reader/exif-reader.js';

export const EXIF_MSG = 'exif';

export function ExifService(url) {
  return ExifReader.load(url);
}