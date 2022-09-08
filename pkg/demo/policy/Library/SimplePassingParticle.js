/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({

  initialize({}, state) {
    assign(state, {count: 1})
  },
  render({private, public}, {count}) {
    return {input: `Private:${private}, Public:${public}, Count ${count}`};
  },
  onClick({eventlet: {value}}, state) {
    assign(state, {count: state.count + 1});
    return {output: 'Result: ' + value};
  },
  template: html`
<style>
  :host {
    display: block;
    height: 5em;
  }
  hr {
    width: 100%;
  }
  [pickedFontBox] {
    background-color: yellow;
  }
  [list] {
    cursor: pointer;
    padding: 12px;
  }
  [fonts] {
    font-family: monospace, sans-serif;
    font-size: 11px;
  }
  [font]:hover {
    background-color: lightblue;
  }
  [toolbar] {
    padding: 2px 8px 2px 0 !important;
    line-height: 12px;
  }
  [name] {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  [head] {
    padding: 8px;
    border-bottom: 1px solid gray;
  }
  [families] {
    flex: 1;
  }
</style>

<div style="padding: 4px; border-bottom: 1px solid #eee;">Simple Passing Recipe<br><span on-click="onClick" value="{{input}}">{{input}}</span></div>
`
});
