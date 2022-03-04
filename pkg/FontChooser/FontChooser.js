/**
 * Copyright 2022 Google LLC
 * 
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

// TODO(sjmiles): any relative path would be based on the document the Frame is in,
// which could be completely unrelated to where this module is located.
// Therefore we build an absolute path based on the location of this module.
// Warning: this process will not survive bundling.
const moduleRef = import.meta.url.split('/').slice(0, -1).join('/');
const defaultFrameRef = `${moduleRef}/app/chooser.html`;

let frameRef;

const {assign} = Object;
const {body} = document;

const create = (tag, opts) => assign(document.createElement(tag), opts);

let privateFontData;

export const FontChooser = {
  async requestFont({webFonts, suggested, ...options}) {
    frameRef = options.frameRef || defaultFrameRef;
    if (!privateFontData) {
      await init();
      privateFontData = [...privateFontData, ...webFonts];
    }
    return new Promise(resolve => ux({...options, suggested}, resolve));
  }
};

const init = async () => {
  if (navigator?.fonts?.query) {
    // TODO(wkorman): Note we're punting the `blob` in the real-API-provided `FontMetadata` instance for now.
    // We can maintain the blob reference and provide back to the caller on egress, or even particles in some
    // runtime-managed way, if we determine this is needed down the line.
    const startstamp = performance.now();
    const queryFonts = await navigator.fonts.query({persistentAccess: true});
    const endstamp = performance.now();
    console.log(`Completed native local fonts query [elapsed=${Math.floor(endstamp - startstamp)} ms].`);
    privateFontData = queryFonts.map(({family, fullName, italic, postscriptName, stretch, style, weight}) => ({family, fullName, italic, postscriptName, stretch, style, weight}));
  } else {
    const startstamp = performance.now();
    const {SAMPLE_FONTS} = await import('./app/LargeFontSet.js');
    privateFontData = SAMPLE_FONTS;
    const endstamp = performance.now();
    console.log(`Completed large driver local font set load [elapsed=${Math.floor(endstamp - startstamp)} ms].`);
  }
};

const ux = ({chooser, kind, suggested}, handler) => {
  createFrame(chooser || createChooser(), kind, handler, suggested);
};

const createFrame = (root, kind, handler, suggested) => {
  const iframeOpts = kind ? `?kind=${kind}` : '';
  const iframe = create('iframe', {
    src: `${frameRef}${iframeOpts}`,
    style: 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; box-sizing: border-box; border: none; background: white;',
    onload: () => onFrameLoaded(iframe, root, handler, suggested)
  });
  return root.appendChild(iframe);
};

const createChooser = () => {
  return body.appendChild(create('div', {
    style: 'position: fixed; inset: 0; background-color: transparent;'
  }));
};


const onFrameLoaded = (iframe, root, handler, suggested) => {
  // attach listener to `window` (aka `top`) that hears messages sent from 'iframe'
  window.addEventListener('message', makeListener(iframe, root, handler, suggested));
  setTimeout(() => root.setAttribute('show', ''), 300);
  console.log('iframe loaded');
};

// attaches listener to `window` (aka `top`) that hears messages sent from 'iframe'
const makeListener = (iframe, root, handler, suggested) => {
  const listener = e => {
    if (e.data === 'hello') {
      iframe.contentWindow.postMessage({
        fontData: privateFontData,
        suggested: suggested
      }, '*');
    }
    if (e.data?.font) {
      root.removeAttribute('show');
      setTimeout(() => {
        window.removeEventListener('message', listener);
        iframe.remove();
        handler(e.data?.font);
      }, 300);
    }
  };
  return listener;
};
