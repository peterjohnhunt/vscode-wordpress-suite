import * as path from 'path';

export class Site {
    private _root = '';
    private _folders = [];

    constructor(sitePath) {
        this.setRoot(sitePath);
        this.addRelatedFolder(sitePath);
    }

    private addFolder(folderPath) {
        this._folders.push(folderPath);
    }

    private removeFolder(index) {
        this._folders.splice(index,1);
    }

    private setRoot(folderPath){
        this._root = folderPath.split(path.sep+'wp-content', 1).shift();
    }

    private isRelatedFolder(folderPath) {
        let folders = this.getFolders();

        for (let index = 0; index < folders.length; index++) {
            let folder = folders[index];
            
            if (folder == folderPath) {
                return index;
            }
        }

        return -1;
    }

    public getFolders() {
        return this._folders;
    }

    public getRoot() {
        return this._root;
    }

    public getName() {
        let root = this.getRoot();
        return path.basename(root).toUpperCase();
    }

    public addRelatedFolder(folderPath) {
        let index = this.isRelatedFolder(folderPath);

        if (index > -1) return;

        this.addFolder(folderPath);
    }

    public removeRelatedFolder(folderPath) {
        let index = this.isRelatedFolder(folderPath);
        
        if (index === -1) return;

        this.removeFolder(index);
    }

    public hasRelatedFolders(){
        return (this.getFolders().length > 0);
    }

    public isFolderRelated(folderPath) {
        let root = this.getRoot();

        if (folderPath.indexOf(root) == 0) {
            return true;
        }
    }
}