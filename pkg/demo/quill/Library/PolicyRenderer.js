({
  /**
   * Copyright 2022 Google LLC
   *
   * Use of this source code is governed by a BSD-style
   * license that can be found in the LICENSE file or at
   * https://developers.google.com/open-source/licenses/bsd
   */

  async update({show}, state, {service}) {
    const policy = await service({msg: 'currentPolicy'});
    assign(state, {policy});
  },

  render(inputs, state) {
    return {
      policy: state.policy,
      jsonPolicy: {foo: 42, bar: 20}
    }
  },

  // refresh({eventlet: {value}}, state) {
  //   state.service({msg: 'currentPolicy'}).then(result => {
  //     assign(state, {policy: result})
  //   });
  // },


  get template() {
    return html`
<div>
  <data-explorer scrolling object="{{policy}}" expand></data-explorer>
</div>`;
  }
})
