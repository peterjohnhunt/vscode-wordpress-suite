'use strict';

import { ExtensionContext, commands, window, workspace } from 'vscode';

import Uri from 'vscode-uri';

import { SitesController } from './controller/class-sites-controller';
import { Sites } from './classes/class-sites';

export function activate(context: ExtensionContext) {
    let sites      = new Sites();
    let controller = new SitesController(sites);

    context.subscriptions.push(controller);

    let rootDisposable = commands.registerCommand('extension.add-root', (uri) => {
        if (!uri) {
            window.showInformationMessage('Please Select A Site');
            return;
        }

        let site = sites.getSite(uri.path);

        if (site) {
            let root = site.getRoot();
            let uri = Uri.file(root);

            workspace.updateWorkspaceFolders(workspace.workspaceFolders ? workspace.workspaceFolders.length : 0, null, { uri: uri });
        }
    });
    context.subscriptions.push(rootDisposable);

    return sites;
}

// this method is called when your extension is deactivatedçç
export function deactivate() {
}