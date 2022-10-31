({

  render({extensions}) {
    return {extensions};
  },

  onChange({extensions, eventlet: {key, value}}) {
    extensions.find(x => x.name == key).enabled = !value;
    return {extensions};
  },

  get template() {
    return html`
      <style>
        :host {
          --ui-page-background: #202124;
          --ui-nav-red: #C3291C;
          --ui-bright-red: #E24741;
          --mdc-icon-button-size: 32px;
          --mdc-theme-primary: #ffffff;
          --mdc-tab-text-label-color-default: var(--ui-bright-red);
          font-family: 'Google Sans', sans-serif;
          font-size: 14px;
          ${themeRules}
        }
        
        .container {
          background-color: var(--theme-color-bg-0);
        }
      </style>
        <div class="container" slot="appContent">
          <mwc-top-app-bar-fixed>
            <mwc-icon-button slot="navigationIcon" icon="menu"></mwc-icon-button>
            <div slot="title">Extension Manager</div>
          </mwc-top-app-bar-fixed>
        </div>
      <div><mwc-list repeat="list_t">{{extensions}}</mwc-list></div>
      
      </div>
      <template list_t>
          <mwc-list-item><span>{{name}}</span><mwc-checkbox style="vertical-align: middle" checked="{{enabled}}" on-change="onChange" key="{{name}}" value="{{enabled}}"></mwc-checkbox></mwc-list-item>
      </template>
    `;
  }
})
