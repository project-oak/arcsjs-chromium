({

  render(inputs, state) {
    return {
      harnessid: state.harnessid, display: (!!state.display + ""),
      action: state.use ? 'Use Password?' : 'Generate Password?'
    };
  },

  get template() {
    return html`
      <style>
        :host {
          position: absolute;
          flex: 0 !important;
          --ui-page-background: #202124;
          --ui-nav-red: #C3291C;
          --ui-bright-red: #E24741;
          --mdc-icon-button-size: 32px;
          --mdc-theme-primary: #ffffff;
          --mdc-tab-text-label-color-default: var(--ui-bright-red);
          font-family: 'Google Sans', sans-serif;
          font-size: 14px;
        }

        [hidden], [hide]:not([hide="false"]), [display="hide"], [display="false"], [show="false"] {
          display: none !important;
        }

        [box] {
          background-color: white;
          border: 1px solid black;
        }

        ${themeRules}
      </style>
      <div display$="{{display}}" box>
        <button on-click="generatePw" value="{{harnessid}}">{{action}}</button>
        <button on-click="decline">Decline</button>
      </div>
    `;
  },
  generatePw({eventlet: {value: harnessid}}, state, {invalidate}) {
    assign(state, {generate: true, decline: false, rand: Date.now()});
    invalidate();
  },

  decline(inputs, state, {invalidate}) {
    assign(state, {generate: false, decline: true});
    invalidate();
  },

  getAttribute(element, name) {
    const attr = element?.attributes?.find(x => x[0] === name);
    return attr && attr[1] || '';
  },

  async makePw(service) {
    const random = await service({msg: 'secureRandom', data: 2});
    const randByte = await service({msg: 'secureRandom', data: 1}) % 256;

    return random.reduce(
        (prev, curr, index) => (
            !index ? prev : prev.toString(36)
        ) + (
            index % 2 ? curr.toString(36).toUpperCase() : curr.toString(36)
        )
    ).split('').sort(() => 128 -
        randByte
    ).join('');
  },

  async update({focusedElement, passwords}, state, {service}) {
    log(`update {focusedElement}`);
    if (focusedElement?.tagName == 'input') {
      if (this.getAttribute(focusedElement, 'type') === 'password') {
        const harnessid = this.getAttribute(focusedElement, HARNESS_ID);
        assign(state, {lastFocus: focusedElement, harnessid, password: true});
      }
    }

    let savedPassword = passwords && passwords[focusedElement?.host] || '';

    if (state?.password) {
      state.use = !!savedPassword;
      // if pw field is empty and haven't declined, show UI
      if (!state.lastFocus.value && !state.decline) {
        assign(state, {display: true});
      }

      // if we should generate or use a pw
      if (state.generate) {
        const lastFocus = state.lastFocus;
        const harnessid = state.harnessid;
        // reset
        assign(state, {
          generate: false,
          decline: false,
          display: false,
          lastFocus: {},
          harnessid: null
        });

        const pw = savedPassword || await this.makePw(service);
        if (!passwords) {
          passwords = {};
        }
        passwords[focusedElement.host] = pw;
        return {
          focusedElementOut: {...lastFocus, value: pw},
          passwords
        };
      } else if (state.decline) {
        assign(state, {
          display: false,
          lastFocus: {},
          harnessid: null
        });
      }
    }
  }

})
