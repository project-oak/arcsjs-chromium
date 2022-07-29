/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
/* globals decorator, filter html */
({
render({fonts}) {
  return {
    families: {
      models: fonts,
      decorator: 'decorator',
      fonts: {
        collateBy: 'family'
      }
    },
  };
},

decorator({family, fullName, weight, style}) {
  const fweight = style.includes('Bold') ? 'bold' : weight;
  const fstyle = style.includes('Italic') ? 'italic' : style.includes('Oblique') ? 'oblique' : '';
  return {
    key: fullName,
    sortKey: family,
    name: fullName,
    displayStyle: `font-family: "${family}"; font-weight: ${fweight}; font-style: ${fstyle};`
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
  [families] {
    flex: 1;
  }
</style>

<div style="padding: 4px; border-bottom: 1px solid #eee;">Arcs Font Chooser</div>
<div pickedFontBox slot="pickedFontRecipe"></div>

<div head>suggested</div>
<div slot="suggested"></div>

<div head>all fonts</div>
<div scrolling fonts families list repeat="family_t">{{families}}</div>

<template family_t>
  <div fonts>
    <expandable-item single="{{single}}">
      <span slot="top" font toolbar on-click="onFontClick" key="{{key}}">
        <span style="font-size: 15px; line-height: 10px;">&#9734;</span>
        <span flex name>{{family}}</span>
        <span sample xen:style="{{displayStyle}}">Sample</span>
      </span>
      <div slot="bottom" flex>
        <div rows repeat="font_t">{{fonts}}</div>
      </div>
    </expandable-item>
  </div>
</template>

`
})
