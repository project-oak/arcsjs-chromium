export const particle = ({log, resolve}) => {

/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

//const assets = resolve('/arcsjs-chromium/pkg/env/arcsjs-apps/pkg/Library/Common/shell/assets');
const assets = resolve('https://arcsjs-apps.web.app/Library/App/assets');

const template = html`
<style>
  :host {
    flex: 0 !important;
    --ui-page-background: #202124;
    --ui-nav-red: #C3291C;
    --ui-bright-red: #E24741;
    --mdc-icon-button-size: 32px;
    --mdc-theme-primary: #ffffff;
    --mdc-tab-text-label-color-default: var(--ui-bright-red);
    font-size: 14px;
  }
  data-explorer {
    padding: 8px;
  }
  [title] {
    font-size: 1.3em;
  }
  [devtools] {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 60%;
    min-width: 320px;
    max-width: 100vw;
    z-index: 6000;
    transform: translateX(100%);
    transition: transform 200ms ease-in;
    box-shadow: rgb(38, 57, 77) 0px 20px 30px -10px;
    color: lightblue;
    background: #333;
  }
  [devtools][show] {
    transform: translateX(0);
  }
  [toolbar] {
    color: #ececec;
    background-color: var(--ui-nav-red);
  }
  /* beachball */
  [tools-button] {
    position: fixed;
    top: -15px;
    right: -15px;
    width: 32px;
    height: 32px;
    z-index: 9999;
    opacity: 0;
    transition: opacity 1s ease-out;
    border-radius: 50%;
  }
  [tools-button]:hover {
    opacity: 1;
  }
  [tools-button] > img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
</style>

<!-- dev tools button -->
<div tools-button on-click="onToggleDevToolsClick">
  <img src="${assets}/rainbow-128-opt.gif">
</div>

<div devtools flex rows show$="{{showTools}}">
  <div toolbar>
    <mwc-icon-button icon="close" on-click="onToggleDevToolsClick"></mwc-icon-button>
    <div flex title>Tools</div>
    <mwc-icon-button icon="refresh" on-click="onRefreshClick"></mwc-icon-button>
  </div>
  <mxc-tab-pages dark flex tabs="Stores,Particles,Context,Graph,Policy">
    <data-explorer flex scrolling object="{{stores}}" expand></data-explorer>
    <data-explorer flex scrolling object="{{particles}}" expand></data-explorer>
    <div flex rows>
      <data-graph object="{{context}}" flex x3></data-graph>
      <!-- <data-graph flex></data-graph> -->
    </div>
    <div flex scrolling>
      <graphviz-element dot="{{currentDot}}"></graphviz-element>
    </div>
    <div flex scrolling>
      <div slot="policy">
      </div>
    </div>
  </mxc-tab-pages>
</div>
`;

const {entries, assign, values} = Object;

return {
  get template() {
    return template;
  },
  async update({show}, state, {service}) {
    if (show === true) {
      state.showTools = true;
      this.refresh(state, service);
    }
  },
  async refresh(state, service) {
    const context = await service({msg: 'request-context'});
    const currentPolicy = await service({msg: 'currentPolicy'});
    assign(state, context);
    assign(state, {currentPolicy: currentPolicy});
  },
  render(inputs, {runtime, showTools, currentPolicy}) {
    // there may be other runtimes too
    const users = {runtime, ...runtime?.users};
    const context = this.renderContext(users);
    const stores = context.stores;
    return {
      showTools,
      particles: this.renderAllHosts(users),
      stores,
      context,
      currentDot: currentPolicy?.dot_output
    };
  },
  map(object, visitor) {
    const result = {};
    object && entries(object).map(([name, elt]) => result[name] = visitor(elt));
    return result;
  },
  renderAllHosts(users) {
    const mapHosts = arcs => this.map(arcs, arc => this.renderHosts(arc.hosts));
    return this.map(users, user => mapHosts(user?.arcs));
  },
  renderHosts(hosts) {
    return this.map(hosts, ({meta, particle: {internal: {state, inputs}}}) => {
      const {runtime, ...filtered} = state;
      return {meta, inputs, state: filtered};
    });
  },
  renderContext(users) {
    const user = users?.user ?? users?.runtime;
    if (user?.arcs) {
      const arc = values(user.arcs)[0];
      return {
        stores: this.renderSimpleStores(arc?.stores),
        hosts: this.renderHosts(arc?.hosts)
      };
    } else {
      return {};
    }
  },
  renderSimpleStores(stores) {
    const result = this.map(stores, ({data, meta}) => ({value: data, meta}));
    const kbSize = value => !isNaN(value) ? `${(value / 1024).toFixed(1)} Kb` : '';
    entries(result).forEach(([name, store]) => {
      delete result[name];
      result[`${name} (${kbSize(stores[name]?.save()?.length)})`] = store;
    });
    return result;
  },
  async onToggleDevToolsClick(inputs, state, {service}) {
    if (this.toggleState(state, 'showTools')) {
      await this.refresh(state, service);
    }
  },
  toggleState(state, name) {
    return (state[name] = !state[name]);
  },
  async onRefreshClick(inputs, state, {service}) {
    await this.refresh(state, service);
  }
};

};
