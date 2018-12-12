import { Disposable, workspace, window, commands, StatusBarItem, StatusBarAlignment, WorkspaceFoldersChangeEvent, TextEditor, Event, EventEmitter } from 'vscode';
import * as path from 'path';

import Uri from 'vscode-uri';

import { Site } from '../classes/class-site';
import { Sites } from '../classes/class-sites';
import { Explorer } from '../classes/class-explorer';

export class SitesController {
    private _disposable: Disposable;
    private _statusBarItem: StatusBarItem;

    private _active: Site;
    private _sites: Sites;
    private _explorer: Explorer;

    private _onDidChangeSite = new EventEmitter<Site>();
    readonly onDidChangeSite: Event<Site> = this._onDidChangeSite.event;

    constructor(sites: Sites, explorer: Explorer) {
        this._sites = sites;
        this._explorer = explorer;

        let subscriptions: Disposable[] = [];

        workspace.onDidChangeWorkspaceFolders(this.onDidChangeWorkspaceFolders, this, subscriptions);
        window.onDidChangeVisibleTextEditors(this.onDidChangeVisibleTextEditors, this, subscriptions);
        this._explorer.treeView.onDidChangeSelection(this.onDidChangeSelection, this, subscriptions);
        subscriptions.push(commands.registerCommand('extension.add-root', this.addRoot, this));
        
        this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right);
        this._statusBarItem.show();
        this._statusBarItem.text = 'Loading';
        subscriptions.push(this._statusBarItem); 

        this.onDidChangeWorkspaceFolders({ added: workspace.workspaceFolders || [], removed: []});
        this.onDidChangeVisibleTextEditors(window.visibleTextEditors);
        this.onDidUpdateWorspaceContext();

        this._disposable = Disposable.from(...subscriptions);
    }

    private setContext(key, value){
        commands.executeCommand('setContext', key, value);
    }

    private onDidChangeWorkspaceFolders({ added, removed }: WorkspaceFoldersChangeEvent) {
        const sites = this.getSites();

        if (added.length) {
            let paths = added.map(folder => folder.uri.fsPath);
            for (let folder of paths) {
                sites.addSite(folder, site => {
                    if (!site) return;
                    window.setStatusBarMessage("WordPress Suite: Added " + site.getName(), 3000);
                });
            }
        }

        if (removed.length) {
            let paths = removed.map(folder => folder.uri.fsPath);
            for (let folder of paths) {
                sites.removeSite(folder, site => {
                    if (!site) return;
                    window.setStatusBarMessage("WordPress Suite: Removed " + site.getName(), 3000);
                });
            }
        }

        this.onDidUpdateWorspaceContext();
    }

    private onDidChangeVisibleTextEditors(editors: TextEditor[]){
        const sites = this.getSites();
        editors.forEach(editor => {
            const uri = editor.document.uri;

            if (uri.scheme !== 'file') {
                return;
            }

            const folder = workspace.getWorkspaceFolder(uri);

            if (folder) {
                let site = sites.getSite(uri.fsPath);

                if (site) {
                    this.setActiveSite(site);
                }
            }
        });

        this.onDidUpdateWorspaceContext();
    }

    private onDidChangeSelection(event){
        if (!event.selection.length || event.selection.length > 1) return;

        const sites = this.getSites();
        const element = event.selection.shift();

        const id = element.uri.scheme == 'wp' ? path.basename(element.uri.path) : element.uri.fsPath;

        let site = sites.getSite(id);

        if (site) {
            this.setActiveSite(site);
        }

        this.onDidUpdateWorspaceContext();
    }

    private onDidUpdateWorspaceContext(){
        const sites = this.getSites();
        this.setContext('isWordPressSuite', sites.hasSites());

        if (sites.hasSites()) {
            this._statusBarItem.show();
        } else {
            this._statusBarItem.hide();
        }

        const site = this.getActiveSite();
        if (site && workspace.workspaceFolders) {
            this._statusBarItem.text = site.getName();

            const root    = site.getRoot();
            const uris    = workspace.workspaceFolders;
            const folders = uris.map(folder => folder.uri.fsPath);
            const hasRoot = folders.indexOf(root) > -1 ? true: false;

            this.setContext('hasWordPressSuiteRoot', hasRoot);
        }
    }

    private setActiveSite(site){
        this._onDidChangeSite.fire(site);

        this._active = site;
    }

    private getActiveSite(){
        return this._active ? this._active : this._sites.getSite();
    }

    private addRoot(uri:any = false){
        if (!uri) {
            window.showInformationMessage('Please Select A Site');
            return;
        }
        const sites = this.getSites();
        const site = sites.getSite(uri.fsPath);

        if (site) {
            const root = site.getRoot();
            const uri = Uri.file(root);

            workspace.updateWorkspaceFolders(workspace.workspaceFolders ? workspace.workspaceFolders.length : 0, null, { uri: uri });
        }
    }

    public getSites() {
        return this._sites;
    }

    public dispose() {
        this._disposable.dispose();
    }
}