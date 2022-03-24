/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

export async function getFileSystemPhotoSet() {
  const directory = await window.showDirectoryPicker({startIn: 'pictures'});
  const allFiles = await recurseAllFiles(directory);
  const files = await Promise.all(
    allFiles
      .filter(f => /(jpg|jpeg|png|webp|gif)$/i.test(f.name.toLowerCase()))
      .map(fileHandle => fileHandle.getFile())
  );
  return files.map(file => ({
    fullName: file.name,
    photoUrl: URL.createObjectURL(file),
    starRating: 5
  }));
}

async function recurseAllFiles(dir) {
  let results = [];
  for await (const handle of dir.values()) {
    if (handle.kind == 'file') {
      results.push(handle);
    } else {
      results = results.concat(await recurseAllFiles(handle));
    }
  }
  return results;
}
