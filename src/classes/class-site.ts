import * as path from 'path';

export class Site {
    private _root = '';
    private _folders = [];

    constructor(sitePath) {
        this._setRoot(sitePath);
        this.addFolder(sitePath);
    }

    private _addFolder(folderPath) {
        this._folders.push(folderPath);
    }

    private _removeFolder(index) {
        this._folders.splice(index,1);
    }

    private _setRoot(folderPath){
        this._root = folderPath.split(path.sep+'wp-content', 1).shift();
    }

    private _getFolders() {
        return this._folders;
    }

    private _hasFolder(folderPath) {
        let folders = this._getFolders();

        for (let index = 0; index < folders.length; index++) {
            let folder = folders[index];
            
            if (folder == folderPath) {
                return index;
            }
        }

        return -1;
    }

    public getRoot() {
        return this._root;
    }

    public addFolder(folderPath) {
        let index = this._hasFolder(folderPath);

        if (index > -1) return;

        this._addFolder(folderPath);
    }

    public removeFolder(folderPath) {
        let index = this._hasFolder(folderPath);
        
        if (index === -1) return;

        this._removeFolder(index);
    }

    public hasFolders(){
        return (this._getFolders().length > 0);
    }

    public isFolderRelated(folderPath) {
        let root = this.getRoot();

        if (folderPath.indexOf(root) == 0) {
            return true;
        }
    }
}