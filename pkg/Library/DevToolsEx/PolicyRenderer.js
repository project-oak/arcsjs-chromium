({
  /**
   * Copyright 2022 Google LLC
   *
   * Use of this source code is governed by a BSD-style
   * license that can be found in the LICENSE file or at
   * https://developers.google.com/open-source/licenses/bsd
   */

  async update({show}, state, {service}) {
    const policy = await service({msg: 'currentPolicyIr'});
    assign(state, {policy});
  },

  render(inputs, state) {
    return {
      policy: state.policy,
      jsonPolicy: {foo: 42, bar: 20}
    }
  },

  get template() {
    return html`
<div>
  <pre>{{policy}}</pre>
</div>`;
  }
})