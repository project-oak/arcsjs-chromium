({
/**
 * Copyright 2022 Google LLC
 * 
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
  initialize({}, state) {
    log("Initialize Called");
    assign(state, {
      starFilter: 1,
      star1: true,
      star2: false,
      star3: false,
      star4: false,
      star5: false,
    });
  },

  ranker({fullName, photoUrl, timestamp, rating, privateData}, inputs, state) {
    // note that although the ranker can read 'state', it cannot write it
    const {starFilter} = state;

    // We either have previous saved rating for this, or we initialize from data
    const starRating = privateData.starRating || rating;
    return {
      key: photoUrl,
      sortKey: timestamp,
      name: fullName,
      starRating,
      starFilter,
      renderedStars: '*****'.substring(0, starRating),
      // pure function, we return a new privateData, no in-place mutation
      privateData: {
        starRating
      }
    };
  },

  filter({starRating, starFilter}) {
    return starRating >= starFilter;
  },

   onPhotoClick({eventlet: {key}}, {}) {
    return {
      pickedPhoto: key
    };
  },

  onStarClick({eventlet: {value}}) {
    const currentStars = Math.max(((value.starRating || 1) + 1) % 6, 1);
    // TODO(cromwellian): mutation! would be better if we could return somehow
    // We want to update the privateData but in a 'pure' way
    value.starRating = currentStars;
    log("CurrentStars " + currentStars);
  },

  async onPhotoHover({eventlet: {value: photoUrl}}) {
    log(photoUrl);
    return {hoverUrl: photoUrl};
  },

  onStarSet({eventlet: {value}}, state) {
    log('onStarSet', value);
    assign(state, { starFilter: value});
  },

  render({photos}, {starFilter}) {
    return {
      photos: {
        $template: 'photo_t',
        models: photos,
        decorator: 'ranker',
        filter: 'filter',
      },
      starFilter,
      star1: starFilter >= 1,
      star2: starFilter >= 2,
      star3: starFilter >= 3,
      star4: starFilter >= 4,
      star5: starFilter >= 5,
    };
  },

  get template() {
    return html`
<style>
  :host {
    display: block;
    height: 100%;
    width: 100%;
    border: 1px solid #f3f3f3;
    box-sizing: border-box;
    background-color: black;
  }
  [photogrid] {
    cursor: pointer;
    padding: 12px;
    box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
    display: grid;
    grid-template-columns: repeat(3, 200px);
    grid-auto-rows: 200px;
    grid-gap: 1px;
    background-color: black;
  }
  [scrolling][photogrid] {
    overflow-x: hidden !important;
  }
  [photo] {
    width: 100%;
    padding: 8px 8px 8px 8px;
    background-color: darkgray;
    place-self: center
  }
  [photo]:hover {
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
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    background-color: darkgray;
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
  [star1] {
    color: yellow !important;
  }
  [star2] {
    color: yellow !important;
  }
  [star3] {
    color: yellow !important;
  }
  [star4] {
    color: yellow !important;
  }
  [star5] {
    color: yellow !important;
  }
  [star] {
    cursor: pointer;
    font-size: 150%;
    color: black;
    vertical-align: middle;
  }
  img {
    object-fit: cover;
    width: 172px;
    height: 172px;
    margin: auto;
  }
  [photoinfo] {
    border-top: 1px solid white;
    height: 256px;
  }
 
</style>

<div flex rows>
  <div banner>
    <icon>lock</icon>
    <span>Photos</span>
    <div on-click="onStarSet">
      <span>Filter:&nbsp;</span>
      <span star star1$="{{star1}}" value="1">*</span>
      <span star star2$="{{star2}}" value="2">*</span>
      <span star star3$="{{star3}}" value="3">*</span>
      <span star star4$="{{star4}}" value="4">*</span>
      <span star star5$="{{star5}}" value="5">*</span>
    </div>
  </div>

  <div scrolling flex photos photogrid>{{photos}}</div>

  <div photoinfo columns>
    <div slot="exif"></div>
    <div flex rows slot="histogram"></div>
  </div>
</div>

<template photo_t>
  <div photo on-click="onPhotoClick" key="{{key}}" on-mouseover="onPhotoHover" value="{{photoUrl}}">
    <img src="{{photoUrl}}">
    <div>
      <small>Rating: <span on-click="onStarClick" value="{{privateData}}">{{renderedStars}}</span></small>
    </div>
  </div>
</template>
    `;
  }
})
