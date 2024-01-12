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

  render({photos}) {
    return {
      photos: {
        models: photos,
        decorator: 'decorator',
        // filter: 'searchFilter',
      }
    };
  },

  searchFilter({name, searchFilter}) {
    return name?.toLowerCase().includes(searchFilter?.toLowerCase());
  },

  searchFilter({name, myFilter, suggested}) {
    return suggested?.indexOf(name) != -1 && name?.toLowerCase().includes(myFilter?.toLowerCase());
  },

  decorator({fullName, photoUrl, timestamp}, inputs, {searchFilter}) {
    return {
      key: photoUrl,
      sortKey: timestamp,
      name: fullName,
      searchFilter: searchFilter,
      photoUrl,
      fullName,
      timestamp
    };
  },

  onPhotoClick({eventlet: {key}}) {
    return {pickedPhoto:  key};
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
  [pickedPhotoBox] {
    background-color: yellow;
  }
  [list] {
    cursor: pointer;
    padding: 12px;
  }
  [photogrid] {
    cursor: pointer;
    padding: 12px;
    box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
    display: grid;
    grid-template-columns: repeat(3, 200px);
    grid-auto-rows: 200px;
    grid-gap: 1px;
  }
  [scrolling][photogrid] {
    overflow-x: hidden !important;
  }
  [photo] {
    width: 100%;
    padding: 8px 8px 8px 8px;
    place-self: center
  }
  [photo]:hover {
    background-color: lightblue;
  }
  [photoimg] {
    object-position: center;
    object-fit: scale-down;
    width: 172px;
    height: 172px;
    margin: auto;
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

<!--<div search><span>Search: </span><input type="text" on-change="onChange" value="{{searchFilter}}"></div>-->
<div head>Photos</div>
<div scrolling flex photos photogrid repeat="photos_t">{{photos}}</div>

<template photos_t>
  <div photo toolbar on-click="onPhotoClick" key="{{key}}">
     <img photoimg src="{{photoUrl}}"></img>
  </div>
</template>
`});
