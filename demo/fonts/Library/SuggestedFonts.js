/* globals decorator, filter html */
({
/**
 * Copyright 2022 Google LLC
 * 
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
render({fonts}) {
  return {
    friends: {
      models: fonts,
      decorator: 'decorator',
      filter: 'filter'
    },
  };
},

filter({fullName, suggested}) {
  return suggested && suggested.indexOf(fullName) != -1;
},

decorator({family, fullName, weight, style}, {suggested}) {
  const fweight = style.includes('Bold') ? 'bold' : weight;
  const fstyle = style.includes('Italic') ? 'italic' : style.includes('Oblique') ? 'oblique' : '';
  return {
    key: fullName,
    sortKey: family,
    name: fullName,
    displayStyle: `font-family: "${family}"; font-weight: ${fweight}; font-style: ${fstyle};`,
    suggested: suggested
  };
},

onFontClick({eventlet: {key}}) {
  return {pickedFont: key};
},

template: html`

<style>
  :host {
    display: block;
    height: 100%;
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
  [suggested] {
    height: 120px;
  }
  [families] {
    flex: 1;
  }
</style>
<div scrolling suggested fonts list repeat="font_t">{{friends}}</div>

<template font_t>
  <div font toolbar on-click="onFontClick" key="{{key}}">
    <span flex name>{{name}}</span>
    <span sample xen:style="{{displayStyle}}">Sample</span>
  </div>
</template>
`
})
