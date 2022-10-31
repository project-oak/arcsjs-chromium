/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import './conf/config.js';
import {App, MessageBus, logFactory, themeRules, paths, makeId} from './conf/allowlist.js';
import {HARNESS_ID} from '../../constants.js';
import {
  ChromePersistor
} from '../../ChromePersistor.js';

const log = logFactory(true, 'PasswordApp', 'red');

const PasswordAppRecipe = {
  $stores: {
    focusedElement: {
      $type: 'Element',
      $tags: ['private']
    },
    focusedElementOut: {
      $type: 'Element',
      $tags: ['private']
    },
    passwords: {
      $type: '[KeyValue]',
      $tags: ['persisted']
    }
  },
  passwordapp: {
    $kind: '$app/PasswordFill.js',
    $inputs: ['focusedElement', 'passwords'],
    $outputs: ['focusedElementOut', 'passwords']
  }
};



export const PasswordApp = class extends App {
  constructor(path, root, options) {
    super(path, root, options);
    this.services = [];
    this.userAssembly = [PasswordAppRecipe];
    this.persistor = new ChromePersistor('user');
    log('Password lives!');
  }
  
  async spinup(resultCallback, bus) {
    let workerRef;
    let workerBus;
    this.contentBus = bus;

    // This is an ugly hack because Core Arcs  doesn't expose the worker or
    // message bus
    this.arcs.blargTheWorker = async ({paths}) => {
      const code = [
        `import '${paths.$config}';`,
        `import '${paths.$library}/App/Worker/ArcsWorker.js';`
      ];
      const text = code.join('\n');
      const blob = new Blob([text], {type: 'application/javascript'});
      const oUrl = URL.createObjectURL(blob);
      const worker = new Worker(oUrl, {type: 'module', name: 'arcsjs'});
      setTimeout(() => URL.revokeObjectURL(oUrl), 5000);
      log.groupCollapsed('Worker launched (blarg!)');
      log.log(text);
      log.groupEnd();
      workerBus = new MessageBus(worker);
      workerRef = worker;
      return worker;
    };

    await App.Arcs.init({
      paths: this.paths,
      root: null,
      onservice: this.service.bind(this),
      injections: {themeRules, ...this.injections, HARNESS_ID}
    });
    this.workerBus = workerBus;
    await this.workerBus.receiveVibrations(msg => {
      if (msg.type === 'render') {
        // forward vibrations from worker to Xen in content-script
        this.fowardToContentBus(msg);
      }
    });

    // await loadCss(`${this.paths.$library
    // ?? '.'}/Dom/Material/material-icon-font/icons.css`);
    // TODO(sjmiles): pick a syntax
    const assembly = [...(this.userAssembly ?? this.recipes ?? [])];
    await App.Arcs.addAssembly('user', assembly);
    this.arcs.watch('user', 'focusedElementOut', focusElement => {
      resultCallback({result: {focusElement}});
    });

    return this;
  }

  fowardToContentBus(vibration) {
    try {
      this.contentBus.sendVibration(vibration);
    } catch (x) {
      log.error(x);
      log.error(packet);
    }
  }

  forwardToWorkerBus(vibration) {
    try {
      this.workerBus.sendVibration(vibration);
    } catch (x) {
      log.error(x);
      log.error(packet);
    }
  }

  focus(focusElement) {
    this.arcs.set('user', 'focusedElement', focusElement);
  }

  // application service
  async onservice(runtime, host, {msg, data}) {
    switch (msg) {
      case 'secureRandom':
        return secureRandom(data);
    }
  }
};

function secureRandom(numInts) {
  return crypto.getRandomValues(new Uint32Array(numInts));
}


// For now we spin up 1-arc per extension, but later we should
// consider multiple extensions in the same arc?
export async function bootPasswordExt(name, socket, resultCallback) {
  try {
    const div = document.createElement('div')
    // div.style.display = 'none';
    div.id = "composer" + name;
    const app = new PasswordApp(paths, div);
    return await app.spinup(resultCallback, socket);
  } catch(x) {
    console.error(x);
  }
};