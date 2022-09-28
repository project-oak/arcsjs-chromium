
import {App, Paths} from './conf/allowlist.js'
import {SimplePassingRecipe} from './Library/SimplePassingRecipe.js';
import {loadCss, themeRules} from '../../Chooser/conf/allowlist.js';
import {DevToolsRecipeEx} from '../../Library/DevToolsEx/DevToolsRecipeEx.js';
import {PolicyGenerator} from '../../policy/recipe2policy.js';

const here = Paths.getAbsoluteHereUrl(import.meta);

const paths = {
  $app: `${here}/..`,
  $config: `${here}/conf/config.js`,
  $library: `${globalThis.config.arcsjs}/Library`,
  $local: `${here}/Library`
};

class SimplePassingApp extends App {
  constructor() {
    super(paths, window['passing']);
    this.userAssembly = [SimplePassingRecipe];
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
    this.arcs.watch('user', 'output', output => {
      this.onresult(output);
    });
  }

  onresult(result) {
    window['result'].innerText = result;
  }

  onservice(user, host, {msg, data}) {
    switch (msg) {
      case 'currentPolicyIr':
        const ir = new PolicyGenerator(this.userAssembly[0], "Chooser").recipeToIr();
        fetch('/raksha', {
          method: "POST",
          headers: {
            "Content-Type": "text/plain"
          },
          body: ir
        });
        return ir;
    }
    ;
  }
}

new SimplePassingApp().spinup();

