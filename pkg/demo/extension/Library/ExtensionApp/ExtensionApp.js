/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {App, logFactory, loadCss, makeId} from './conf/allowlist.js';
import {themeRules} from './theme.js';
import {PortBus} from '../../portbus.js';
import {ChromePersistor} from '../../ChromePersistor.js';

const log = logFactory(true, 'ExtensionApp', 'navy');

const ExtensionRecipe = {
  $stores: {
    extensions: {
      $type: '[Extension]',
      $tags: ['persisted']
    }
  },
  extensionapp: {
    $kind: '$app/ExtensionManifest.js',
    $inputs: ['extensions'],
    $outputs: ['extensions']
  }
};

export const ExtensionApp = class extends App {
  constructor(path, root, options) {
    super(path, root, options);
    this.services = [];
    this.userAssembly = [ExtensionRecipe];
    this.persistor = new ChromePersistor('user');
    log('Extension lives!');
  }

  async spinup() {
    await App.Arcs.init({
      paths: this.paths,
      root: this.root || document.body,
      onservice: this.service.bind(this),
      injections: {themeRules, ...this.injections}
    });

    await loadCss(`${this.paths.$library
    ?? '.'}/Dom/Material/material-icon-font/icons.css`);
    // await loadCss(`${this.paths.$library
    // ?? '.'}/Dom/Material/material-icon-font/icons.css`);
    // TODO(sjmiles): pick a syntax
    const assembly = [...(this.userAssembly ?? this.recipes ?? [])];
    await App.Arcs.addAssembly('user', assembly);
    let extensions = await this.arcs.get('user', 'extensions');
    const port = chrome.runtime.connect({name: "arcsextension_manager"});
    const backgroundPageBus = new PortBus(port);
    this.arcs.watch('user', 'extensions', extensions => {
      backgroundPageBus.sendVibration({kind: 'extensions-update', extensions});
    });

    if (!extensions) {
      extensions = [{
        name: 'Password Manager',
        enabled: false
      }, {
        name: 'Contacts Manager',
        enabled: false
      }];
      this.arcs.set('user', 'extensions', extensions);
    }

    backgroundPageBus.sendVibration({kind: 'extensions-update', extensions});
  }

  // application service
  async onservice(runtime, host, {msg, data}) {
    switch (msg) {
    }
  }

  // async addEditor(runtime, host, props) {
  //   this.arcs.createParticle('editor', 'user', makeEditorParticleMeta(props));
  //   return true;
  // }
  // async addParticle(runtime, host, props) {
  //   const name = makeName();
  //   const code = packageParticleSource(props);
  //   const meta = {
  //     ...this.getMeta(props),
  //     kind: name,
  //     container: 'librarian#canvas'
  //   };
  //   log(meta);
  //   this.arcs.createParticle(name, 'user', meta, code);
  //   return true;
  // }

};

const makeEditorParticleMeta = props => ({
  kind: '$app/Library/Editor.js',
  container: 'librarian#editors',
  staticInputs: {
    name: props?.name ?? makeName(),
    particle: {
      code: props?.code ?? '',
      html: props?.html ?? ''
    }
  },
  inputs: [{library: 'library'}],
  outputs: [{library: 'library'}]
});

const packageParticleSource = props =>
    `({
  ${props?.code ? `${props?.code},
  ` : ''}${props?.html ? `template: html\`
  ${props?.html}
  \`` : ''}});
`;
