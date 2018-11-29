import { Disposable, workspace, } from 'vscode';

import { Sites } from '../classes/class-sites';

export class SitesController {
    // private _statusBarItem: StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
    private _disposable: Disposable;

    private _sites: Sites;
    private _folders = [];

    constructor(sites: Sites) {
        this._sites = sites;

        let subscriptions: Disposable[] = [];
        workspace.onDidChangeWorkspaceFolders(this._updateWorkspaceFolders, this, subscriptions);

        this._updateWorkspaceFolders();

        // this._statusBarItem.show();

        this._disposable = Disposable.from(...subscriptions);
    }

    private _setFolders(folders){
        this._folders = folders;
    }

    private _getFolders(){
        return this._folders;
    }

    private _compareFolders(from,to){
        if (to.length === 0) return from;

        if (from.length === 0) return [];

        return from.filter(folderPath => to.indexOf(folderPath) < 0);
    }

    private _updateWorkspaceFolders() {
        let sites = this.getSites();
        let folders = workspace.workspaceFolders
        let newFolders = folders ? folders.map(folder => folder.uri.path) : [];
        let oldFolders = this._getFolders();

        if (newFolders.length > oldFolders.length) {
            let changed = this._compareFolders(newFolders, oldFolders);
            for (let folder of changed) {
                sites.addSite(folder);
            }
        } else {
            let changed = this._compareFolders(oldFolders, newFolders);
            for (let folder of changed) {
                sites.removeSite(folder);
            }
        }

        // let quantity = sites.getSites().length;
        // this._statusBarItem.text = quantity == 1 ? `${quantity} Site` : `${quantity} Sites`;

        this._setFolders(newFolders);
    }

    public getSites() {
        return this._sites;
    }

    dispose() {
        this._disposable.dispose();
    }
}