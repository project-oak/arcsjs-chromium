/**
 * Copyright 2022 Google LLC
 * 
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
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
