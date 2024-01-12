({
/**
 * Copyright 2022 Google LLC
 * 
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
  render(inputs) {
    return inputs;
  },

  get template() {
    return html`
<style>
  [photoinfo] {
    border-top: 1px solid white;
    height: 256px;
  }
</style>
<div flex rows>
   <photo-histogram flex src="{{url}}"></photo-histogram>
</div>`;
  }
})
