/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const particle = ({Particle, log}) => {

const template = Particle.html`
<style>
  :host {
    margin: 0;
    padding: 6px;
    height: 130px;
    font-family: monospace;
    font-size: 0.8em;
    border-top: 1px dotted silver;
  }
  [message] {
    font-weight: bold;
    text-decoration: underline;
    display: inline-block;
  }
  [stack] {
    padding-left: 10px;
    display: inline-block;
  }
</style>

<pre dark scrolling console hidden="{{hideConsole}}">{{console}}</pre>

<template console_t>
  <div>
    <span message>{{message}}</span>
    <span stack>{{stack}}</span>
  </div>
</template>

`;

const {values} = Object;

return class extends Particle {
  get template() {
    return template;
  }
  update({action, console}, state) {
    const kinds = values(action?.particles || {})?.map(p => p.kind);
    const records = console.filter?.(record => !kinds || kinds.includes(record.kind));
    if (!this.recordsEqual(records, state.records)) {
      state.records = records;
      this.output({showConsole: records?.length > 0});
    }
  }
  render({}, {records}) {
    return {
      console: this.renderConsole(records),
      hideConsole: !Boolean(records?.length)
    };
  }
  renderConsole(records) {
    return {
      $template: `console_t`,
      models: records?.map?.(({message, stack}) => ({message, stack}))
    }
  }

  recordsEqual(records, lastSeenRecords) {
    return Boolean(!records && !lastSeenRecords) ||
      (records?.length === lastSeenRecords?.length &&
        records?.every((record, i) => record.message === lastSeenRecords[i].message && record.stack === lastSeenRecords[i].stack));
  }
};

};
