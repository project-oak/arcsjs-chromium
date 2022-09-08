import {App,loadCss, themeRules} from './conf/allowlist.js';
import {DevToolsRecipeEx} from '../Library/DevToolsEx/DevToolsRecipeEx.js';
import {PolicyGenerator} from '../policy/recipe2policy.js';

export const ChooserApp = class extends App {
  constructor(paths, root) {
    super(paths, root);
  }

  async spinup() {
    await App.Arcs.init({
      paths: this.paths,
      root: this.root || document.body,
      onservice: this.service.bind(this),
      injections: {themeRules, ...this.injections}
    });
    await loadCss(`${this.paths.$library
    ?? '.'}/Dom/Material/material-icon-font/icons.css`);
    // TODO(sjmiles): pick a syntax
    const assembly = [DevToolsRecipeEx,
      ...(this.userAssembly ?? this.recipes ?? [])];
    await App.Arcs.addAssembly(assembly, 'user');
  }

  onservice(user, host, {msg, data}) {
    switch (msg) {
      case 'currentPolicy':
        return new PolicyGenerator(this.userAssembly[0], "Chooser").recipeToPolicy();
      case 'currentPolicyIr':
        return new PolicyGenerator(this.userAssembly[0], "Chooser").recipeToIr();
    }
    ;
  }
}