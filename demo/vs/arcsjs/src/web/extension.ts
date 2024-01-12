import * as vscode from 'vscode';
import { ArcsViewProvider } from './viewprovider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {


	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('arcsjs.Arcs', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from arcsjs in a web extension host!');
	});

	context.subscriptions.push(disposable);
	const provider = new ArcsViewProvider(context);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ArcsViewProvider.viewType, provider));
}

// this method is called when your extension is deactivated
export function deactivate() { }
