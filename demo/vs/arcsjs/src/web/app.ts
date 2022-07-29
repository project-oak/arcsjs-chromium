import * as vscode from 'vscode';

declare global {
	var config: any;
};

const config = {
	// false to use CDN resources
	localArcsjs: true,
	// identifies the p2p meeting place, peers must be in this same aeon
	// also identifies offline storage node
	aeon: 'vscode-arcsjs/00x00',
	// each flag below set true enables logging for the named subsystem
	// TODO(wkorman): Understand and document each of below (and aeon).
	logFlags: {
		recipe: true,
		host: true,
		decorator: true,
		particles: true,
		surfaces: true
	}
};
globalThis.config = config;

import { Runtime, Chef, Arc, Paths } from './arcs';
import { Services } from './ServicePortal';

export async function bootArcs(context: vscode.ExtensionContext, 
	updater: (html: string) => void): Promise<Arc> {
	globalThis.config = config;
	const MarkdownRecipe = eval(await fetch(Paths.resolve('$root/MarkdownRecipe.js')).then(p => p.text()));
	const MarkdownParticle = await fetch(Paths.resolve('$root/MarkdownParticle.js')).then(p => p.text());
    Runtime.particleOptions = { code: MarkdownParticle };

	const system = new Runtime('system');

	const arc = await system.bootstrapArc('system', {}, null, Services.system);
	console.log('arc booted ' + arc);
		
	arc.listen('store-changed', (storeId: any) => {
	   const store = arc.stores[storeId];
		if (storeId === 'html') {
		  updater(store.data);
		}
		console.log("Store " + storeId + " = " + store.json);
	});
	
	await Chef.execute(MarkdownRecipe, system, arc);
	return arc;
}




