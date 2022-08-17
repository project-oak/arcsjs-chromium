/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {Paths} from './allowlist.js';

const here = Paths.getAbsoluteHereUrl(import.meta);

const paths = {
  $arcs: `${here}/arcs.js`,
  $app: `${here}`,
  $library: `${here}/../env/arcsjs/Library`,
};

let privateData;

export class Chooser {
  static async request({container, appData, obtainPrivateData, ...options}) {
    privateData = await obtainPrivateData(options);
    const chooserData = [...privateData, ...appData];
    //
    const app = this.buildApp(paths, chooser || document.body,
        {chooserData, ...options});
    await app.spinup();
    setTimeout(() => chooser?.setAttribute('show', ''), 300);
    //
    return new Promise(resolve => {
      app.onresult = data => {
        if (chooser) {
          chooser.innerHTML = '';
        }
        resolve(data);
      };
    });
  }
};

