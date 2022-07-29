({
/**
 * Copyright 2022 Google LLC
 * 
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
  initialize({}, state, {service}) {
    assign(state, { service, exif: {}, exifCache: {} });
  },

  async exifService(url, {service, exifCache}) {
    if (!url) { return {}; }
    const exif = exifCache[url] ?? await service({msg: 'exif', url});
    exifCache[url] = exif;
    return exif;
  },

  renderExif(exif) {
    return {
      model: exif?.Model?.description || 'Unknown',
      iso: exif?.ISOSpeedRatings?.description || 'Unknown',
      fnumber: exif?.FNumber?.description || 'Unknown',
      exposure: exif?.ExposureTime?.description || 'Unknown',
      focallength: exif?.FocalLength?.description || 'Unknown'
    };
  },

  async update({url}, state) {
    const exif = await this.exifService(url, state);
    assign(state, {exif});
  },

  render({}, {exif}) {
    return {
      ...this.renderExif(exif)
    };
  },

  get template() {
    return html`
<style>
   [exif] {
    padding: 24px;
  }
  [pheader] {
    background: lightblue;
    border-radius: 16px;
    padding: 3px 5px;
    font-size: 0.5em;
    width: 8em;
    text-align: center;
  }
  [pvalue] {
    color: darkgrey;
    text-align: left;
    padding-left: 20px;
    display: inline-block;
  }
</style>
  <div exif rows>
    <div bar><span pheader>Camera</span><span pvalue><span>{{make}}</span><span>{{model}}</span></span></div>
    <div bar><span pheader>ISO</span><span pvalue>{{iso}}</span></div>
    <div bar><span pheader>Aperture</span><span pvalue>{{fnumber}}</span></div>
    <div bar><span pheader>Exposure</span><span pvalue>{{exposure}}</span></div>
    <div bar><span pheader>Focal Length</span><span pvalue>{{focallength}}</span></div>
  </div>`;
  }
})
