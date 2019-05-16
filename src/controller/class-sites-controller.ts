import { Disposable, workspace, window, commands, StatusBarItem, StatusBarAlignment, WorkspaceFoldersChangeEvent, TextEditor, Event, EventEmitter } from 'vscode';
import * as path from 'path';

import Uri from 'vscode-uri';

import { Site } from '../classes/class-site';
import { Sites } from '../classes/class-sites';
import { Explorer } from '../classes/class-explorer';

export class SitesController {
    private _disposable: Disposable;
    private _statusBarItem: StatusBarItem;

    private sites: Sites;
    private explorer: Explorer;

    private _onDidChangeSite = new EventEmitter<Site>();
    readonly onDidChangeSite: Event<Site> = this._onDidChangeSite.event;

    private _onDidAddSite = new EventEmitter<Site>();
    readonly onDidAddSite: Event<Site> = this._onDidAddSite.event;

    private _onDidRemoveSite = new EventEmitter<Site>();
    readonly onDidRemoveSite: Event<Site> = this._onDidRemoveSite.event;

    constructor(sites: Sites, explorer: Explorer) {
        this.sites = sites;
        this.explorer = explorer;

        let subscriptions: Disposable[] = [];

        workspace.onDidChangeWorkspaceFolders(this.onDidChangeWorkspaceFolders, this, subscriptions);
        window.onDidChangeVisibleTextEditors(this.onDidChangeVisibleTextEditors, this, subscriptions);
        this.explorer.treeView.onDidChangeSelection(this.onDidChangeSelection, this, subscriptions);
        subscriptions.push(commands.registerCommand('extension.add-root', this.addRoot, this));
        
        subscriptions.push(this.statusBarName());

        this.onDidChangeWorkspaceFolders({ added: workspace.workspaceFolders || [], removed: []});
        this.onDidChangeVisibleTextEditors(window.visibleTextEditors);
        this.onDidUpdateWorkspaceContext();

        this._disposable = Disposable.from(...subscriptions);
    }

    private setContext(key, value){
        commands.executeCommand('setContext', key, value);
    }

    private statusBarName(){
        this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right);
        this._statusBarItem.show();
        this._statusBarItem.text = 'Loading';
        return this._statusBarItem; 
    }

    private onDidChangeWorkspaceFolders({ added, removed }: WorkspaceFoldersChangeEvent) {
        if (added.length) {
            let paths = added.map(folder => folder.uri.fsPath);
            for (let folder of paths) {
                this.sites.addSite(folder, site => {
                    if (!site) return;
                    this._onDidAddSite.fire(site);
                    window.setStatusBarMessage("WordPress Suite: Added " + site.getName(), 3000);
                });
            }
        }

        if (removed.length) {
            let paths = removed.map(folder => folder.uri.fsPath);
            for (let folder of paths) {
                this.sites.removeSite(folder, site => {
                    if (!site) return;
                    this._onDidRemoveSite.fire(site);
                    window.setStatusBarMessage("WordPress Suite: Removed " + site.getName(), 3000);
                });
            }
        }

        if (added.length || removed.length) {
            this.onDidUpdateWorkspaceContext();
        }
    }

    private onDidChangeVisibleTextEditors(editors: TextEditor[]){
        editors.forEach(editor => {
            const uri = editor.document.uri;

            if (uri.scheme !== 'file') {
                return;
            }

            const folder = workspace.getWorkspaceFolder(uri);

            if (folder) {
                this.changeSite(uri.fsPath);
            }
        });
    }

    private onDidChangeSelection(event){
        if (!event.selection.length || event.selection.length > 1) return;

        const element = event.selection.shift();

        const id = element.uri.scheme == 'wp' ? path.basename(element.uri.path) : element.uri.fsPath;

        this.changeSite(id);
    }

    private onDidUpdateWorkspaceContext(){
        this.setContext('isWordPressSuite', this.sites.hasSites());

        if (this.sites.hasSites()) {
            this._statusBarItem.show();
        } else {
            this._statusBarItem.hide();
        }

        const site = this.sites.getActive();
        if (site && workspace.workspaceFolders) {
            this._statusBarItem.text = site.getName();

            const root    = site.getRoot();
            const uris    = workspace.workspaceFolders;
            const folders = uris.map(folder => folder.uri.fsPath);
            const hasRoot = folders.indexOf(root) > -1 ? true: false;

            this.setContext('hasWordPressSuiteRoot', hasRoot);
        }

        this.explorer.refresh();
    }

    private addRoot(uri:any = false){
        if (!uri) {
            window.showInformationMessage('Please Select A Site');
            return;
        }
        const site = this.sites.getSite(uri.fsPath);

        if (site) {
            const root = site.getRoot();
            const uri = Uri.file(root);

            workspace.updateWorkspaceFolders(workspace.workspaceFolders ? workspace.workspaceFolders.length : 0, null, { uri: uri });
        }
    }

    public changeSite(id){
        let index = this.sites.siteExists(id);

        if (index !== -1) {
            this.sites.setActive(index);

            let site = this.sites.getSite(id);

            if (site) {
                this._onDidChangeSite.fire(site);

                this.onDidUpdateWorkspaceContext();
            }
        }
    }

    public dispose() {
        this._disposable.dispose();
    }
}