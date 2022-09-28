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
    log("Invalid " + !state.policy.valid + " valid " + state.policy.valid);
    return {
      policy: state.policy.ir,
      jsonPolicy: {foo: 42, bar: 20},
      invalid: ""+!state.policy.valid,
      valid: ""+state.policy.valid
    }
  },

  get template() {
    return html`
      <style>
        [display="false"] { display: none }
      </style>
<div>
  <div style="background-color: red;width: 100%;color:black" display$="{{invalid}}">Policy is Invalid</div>
  <div style="background-color: green;width: 100%;color:black" display$="{{valid}}">Policy is Valid</div>
  <pre>{{policy}}</pre>
</div>`;
  }
})