/**
 * @license
 * Copyright 2021 Google LLC.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/* globals log, html */
({

  render({fonts}) {
    return {
      sans_not_sans: {
        models: fonts,
        decorator: 'decorator',
        mysublist: {
          collateBy: 'sansType'
        }
      }
    };
  },

  decorator({family, fullName, weight, style}) {
    const fweight = style.includes('Bold') ? 'bold' : weight;
    const fstyle = style.includes('Italic') ? 'italic' : style.includes('Oblique') ? 'oblique' : '';
    return {
      key: fullName,
      sortKey: `family`,
      name: fullName,
      displayStyle: `font-family: "${family}"; font-weight: ${fweight}; font-style: ${fstyle};`,
      sansType: fullName.includes('Sans') ? 'sans' : 'notsans',
      header: fullName.includes('Sans') ? 'The Sans' : 'The Not Sans',
    };
  },

  onFontClick({eventlet: {key}}, {}) {
    return {pickedFont: key};
  },

  template: html`
    
<style>
  :host {
    display: block;
    height: 100%;
    border: 1px solid #f3f3f3;
    box-sizing: border-box;
  }
  [pickedFontBox] {
    background-color: yellow;
  }
  [list] {
    cursor: pointer;
    padding: 12px;
    box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
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
  [banner] {
    padding: 2px 8px;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    background-color: lightgreen;
    color: #333;
    font-size: 9px;
    font-weight: bold;
    display: flex;
    flex-direction: row;
    align-items: center;
    line-height: 2em;
  }
  [banner] > * {
    margin: 0 4px;
  }
  [indent] {
    margin-left: 20px;
  }
</style>

<div banner>
  <icon>lock</icon>
  <span>Fonts</span>
</div>


<div scrolling fonts list repeat="sans_not_sans_t">{{sans_not_sans}}</div>

<template sans_not_sans_t>
  <div>
    <div banner>{{header}}</div>
    <div repeat="fontlist_t">{{mysublist}}</div>
  </divbanner>
</template>

<template fontlist_t>
  <div indent on-click="onFontClick" key="{{key}}">
    <span flex name>{{fullName}}</span>
    <span sample style$="{{displayStyle}}">Sample</span>
  </div>
</template>


`
});

