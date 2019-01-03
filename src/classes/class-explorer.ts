import { TreeView, ExtensionContext, TreeDataProvider, TreeItemCollapsibleState, TreeItem, Uri, EventEmitter, Event, window } from 'vscode';
import * as path from 'path';
import { Sites } from './class-sites';

interface Item {
    uri: Uri,
    expandable: Boolean
}

export class Provider implements TreeDataProvider<Item> {

    private _onDidChangeTreeData: EventEmitter<Item | undefined> = new EventEmitter<Item | undefined>();
    readonly onDidChangeTreeData: Event<Item | undefined> = this._onDidChangeTreeData.event;

    constructor(private sites: Sites) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    async getChildren(element?: Item): Promise<Item[]> {
        if (element) {
            if (element.uri.scheme == 'wp') {
                const id = path.basename(element.uri.path);
                const site = this.sites.getSite(id);

                if (!site) return;

                let folders = site.getFolders();

                return folders.map((folder) => ({ uri: Uri.file(folder), expandable: false }));
            }

            return [];
        }

        const sites = this.sites.getSites();

        if (sites.length) {
            return sites.map((site) => ({ uri: Uri.parse(path.join('wp://site', site.getName())), expandable: site.getFolders().length > 1 }));
        }

        return [];
    }

    getTreeItem(element: Item): TreeItem {
        const treeItem = new TreeItem(element.uri, element.expandable ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None);
        return treeItem;
    }
}

export class Explorer {

    provider: Provider;
    treeView: TreeView<Item>;

    constructor(sites: Sites, context: ExtensionContext) {
        const treeDataProvider = new Provider(sites);
        this.provider = treeDataProvider;
        this.treeView = window.createTreeView('wordpress-suite', { treeDataProvider });
    }

    refresh() {
        this.provider.refresh();
    }
}