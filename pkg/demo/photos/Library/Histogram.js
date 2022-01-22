({
/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
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
