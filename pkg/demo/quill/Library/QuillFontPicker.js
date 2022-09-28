/**
 * @license
 * Copyright 2021 Google LLC.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/* globals decorator, filter html */
({
  initialize({}, state) {
    assign(state, {
      searchFilter: ''
    });
  },

  async update({show}, state, {service}) {
    const policy = await service({msg: 'currentPolicyIr'});
    assign(state, {policy});
  },

  render({fonts, suggested}, {policy}) {
    return {
      styles: {
        models: fonts,
        decorator: 'decorator'
      },

      friends: {
        models: fonts,
        decorator: 'decorator',
        suggested,
        policy,
        filter: 'suggestedfilter',
      },
      families: {
        models: fonts,
        decorator: 'decorator',
        fonts: {
          collateBy: 'family'
        },
        policy,
        filter: 'filter'
      }
    };
  },

  filter({name, myFilter}) {
    return name?.toLowerCase().includes(myFilter?.toLowerCase());
  },

  suggestedfilter({name, myFilter, suggested}) {
    return suggested?.indexOf(name) != -1 && name?.toLowerCase().includes(myFilter?.toLowerCase());
  },

  decorator({family, fullName, weight, style, postscriptName}, {suggested}, {searchFilter, policy}) {
    const fweight = style.includes('Bold') ? 'bold' : weight;
    const fstyle = style.includes('Italic') ? 'italic' : style.includes('Oblique') ? 'oblique' : '';
    const fontFace =  `@font-face {
      font-family: '${family}';
      src: local('${family}'), local('${postscriptName}');
    }`;

    return {
      key: fullName,
      sortKey: family,
      name: fullName,
      myFilter: searchFilter,
      suggested,
      postscriptName,
      fontFace,
      displayStyle: `font-family: "${family}"; font-weight: ${fweight}; font-style: ${fstyle};`,
      valid: policy?.valid || false
    };
  },

  onFontClick({eventlet: {key, value}}) {
    if (value) {
      return {pickedFont: key};
    }
  },

  onBadFontClick({eventlet: {key}}) {
    return {pickedFont: key};
  },

  onChange({eventlet: {value}}, state) {
    assign(state, { searchFilter: value});
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
    /*height: 120px;*/
  }
  [families] {
    flex: 1;
  }
  
  [search] {
    padding-left: 5px;
    padding-right: 2px;
    margin-top: 2px;
    display: inline-block;
    width: 100%;
    border-bottom: 2px solid gray;
    padding-bottom: 2px;
  }
  
  [search] > span {
    padding-left: 5px;
    align-content: baseline;
  }
  
  [search] > input {
    width: 90%
  }
</style>


<div search><span>Search: </span><input type="text" on-change="onChange" value="{{searchFilter}}"></div>
<div head>Suggested</div>
<div scrolling suggested fonts list repeat="font_t">{{friends}}</div>

<div head>All Fonts</div>
<div scrolling fonts families list repeat="family_t">{{families}}</div>


<template font_t>
  <div font toolbar>
    <span flex name xen:style="{{displayStyle}}" on-click="onFontClick" key="{{key}}" value="{{valid}}">{{fullName}}</span>
    <span sample xen:style="{{displayStyle}}" on-click="onBadFontClick" key="{{key}}">Sample</span>
  </div>
</template>

<template family_t>
  <div fonts>
    <expandable-item single="{{single}}">
      <span slot="top" font toolbar >
        <span style="font-size: 15px; line-height: 10px;">&#9734;</span>
        <span flex name xen:style="{{displayStyle}}" on-click="onFontClick" key="{{key}}">{{family}}</span>
        <span sample xen:style="{{displayStyle}}" on-click="onBadFontClick" key="{{key}}">Sample</span>
      </span>
      <div slot="bottom" flex>
        <div rows repeat="font_t">{{fonts}}</div>
      </div>
    </expandable-item>
  </div>
</template>

`});
