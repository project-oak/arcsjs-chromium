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
      favorites: {
        models: fonts,
        $template: 'favorite_t',
        decorator: 'decorator',
        filter: 'favoriteFilter'
      },
      fonts: {
        models: fonts,
        $template: 'font_t',
        decorator: 'decorator',
      }
    };
  },

  decorator({family, fullName, weight, style, privateData}) {
    const fweight = style.includes('Bold') ? 'bold' : weight;
    const fstyle = style.includes('Italic') ? 'italic' : style.includes('Oblique') ? 'oblique' : '';
    const favorite = privateData?.favorite || false;
    return {
      key: fullName,
      sortKey: `family`,
      name: fullName,
      displayStyle: `font-family: "${family}"; font-weight: ${fweight}; font-style: ${fstyle};`,
      privateData: {
        favorite: favorite
      }
    };
  },

  favoriteFilter({privateData}) {
    return privateData?.favorite || false;
  },

  onFontClick({eventlet: {key}}, {}) {
    return {pickedFont: key};
  },

  onFavorite({eventlet: {value}}) {
    value.favorite = true;
  },

  onUnfavorite({eventlet: {value}}) {
    value.favorite = false;
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
   
  /* Workaround because <button> can't be used */
  [button] {
    margin-left: auto;
    color:#444;
    border:1px solid #CCC;
    background:#DDD;
    box-shadow: 0 0 5px -1px rgba(0,0,0,0.2);
    cursor:pointer;
    vertical-align:middle;
    max-width: 100px;
    padding: 5px;
    text-align: center;
  }
</style>

<div banner>
  <icon>lock</icon>
  <span>Fonts</span>
</div>


<div banner>Favorites</div>
<div fonts list>{{favorites}}</div>
<div banner>All Fonts</div>
<div scrolling fonts list>{{fonts}}</div>

<template favorite_t>
  <div on-click="onFontClick" key="{{key}}">
    <span>{{name}}</span>
    <span style$="{{displayStyle}}">Sample</span>
  </div>
</template>

<template font_t>
  <div on-click="onFontClick" key="{{key}}">
    <span>{{name}}</span>
    <span style$="{{displayStyle}}">Sample</span>
    <div button on-click="onFavorite" value="{{privateData}}">Fav It</div>
    <div button on-click="onUnfavorite" value="{{privateData}}">UnFav It</div>
  </div>
</template>
`
});

