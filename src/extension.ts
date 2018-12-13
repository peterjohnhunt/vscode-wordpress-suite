'use strict';

import { ExtensionContext } from 'vscode';

import { SitesController } from './controller/class-sites-controller';
import { Sites } from './classes/class-sites';
import { Explorer } from './classes/class-explorer';

export function activate(context: ExtensionContext) {
    let sites      = new Sites();
    let explorer   = new Explorer(sites, context);
    let controller = new SitesController(sites, explorer);

    context.subscriptions.push(controller);

    return controller;
}

export function deactivate() {
}