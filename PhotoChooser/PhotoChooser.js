/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {SAMPLE_PHOTOS} from './app/SmallPhotoSet.js';
import {getFileSystemPhotoSet} from './app/FileSystemPhotoSet.js';

// TODO(sjmiles): any relative path would be based on the document the Frame is in,
// which could be completely unrelated to where this module is located.
// Therefore we build an absolute path based on the location of this module.
// Warning: this process may not survive bundling.
const moduleRef = import.meta.url.split('/').slice(0, -1).join('/');
const defaultFrameRef = `${moduleRef}/app/chooser.html`;

let frameRef;

const {assign} = Object;
const {body} = document;

const create = (tag, opts) => assign(document.createElement(tag), opts);

let privatePhotoData;

export const PhotoChooser = {
  async requestPhoto({fileSystem, maxPhotos, ...options}) {
    frameRef = options.frameRef || defaultFrameRef;
    if (!privatePhotoData) {
      await init(fileSystem);
    }
    return new Promise(resolve => ux(options, resolve));
  }
};

const init = async (fileSystem, maxPhotos) => {
  if (fileSystem) {
    privatePhotoData = await getFileSystemPhotoSet();
  }
  // fallback if user cancels permission
  if (!privatePhotoData) {
    privatePhotoData = SAMPLE_PHOTOS;
  }
  privatePhotoData = privatePhotoData.slice(0, maxPhotos || 12);
};

let urlsWithStars = [];

const ux = ({chooser, kind}, handler) => {
  createFrame(chooser || createChooser(), kind, handler);
};

const createFrame = (root, kind, handler) => {
  const iframeOpts = kind ? `?kind=${kind}` : '';
  const iframe = create('iframe', {
    src: `${frameRef}${iframeOpts}`,
    style: 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; box-sizing: border-box; border: none; background: white;',
    onload: () => onFrameLoaded(iframe, root, handler)
  });
  return root.appendChild(iframe);
};

const createChooser = () => {
  return body.appendChild(create('div', {
    style: 'position: fixed; inset: 0; background-color: transparent;'
  }));
};

const onFrameLoaded = (iframe, root, handler) => {
  // attach listener to `window` (aka `top`) that hears messages sent from 'iframe'
  window.addEventListener('message', makeListener(iframe, root, handler));
  setTimeout(() => root.setAttribute('show', ''), 300);
  console.log('iframe loaded');
};

// attaches listener to `window` (aka `top`) that hears messages sent from 'iframe'
const makeListener = (iframe, root, handler) => {
  const listener = e => {
    if (e.data === 'hello') {
      // apply any persisted star ratings to data set
      for (let urlWithStar of urlsWithStars) {
        const [url, rating] = urlWithStar.split(/::/);
        const photo = privatePhotoData.find(p => p.photoUrl == url);
        if (photo) {
          photo.rating = rating;
        }
      }
      iframe.contentWindow.postMessage(privatePhotoData, '*');
    }
    if (e.data?.urlsWithStars) {
      urlsWithStars = e.data?.urlsWithStars;
    }
    if (e.data?.photo) {
      root.removeAttribute('show');
      setTimeout(() => {
        window.removeEventListener('message', listener);
        iframe.remove();
        handler(e.data?.photo);
      }, 300);
    }
  };
  return listener;
};