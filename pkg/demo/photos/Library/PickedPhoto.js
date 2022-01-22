/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const particle = ({log}) => {

const template = html`

<style>
  :host {
    padding: 1em;
  }
</style>

<img src="{{photoUrl}}"></img>

`;

return {
  get template() {
    return template;
  },
  render({pickedPhoto}) {
    log(pickedPhoto ?? '(empty)');
    return {
      photoUrl: pickedPhoto?.photoUrl ?? 'about:blank'
    };
  }
};

};
