import * as path from 'path';

import { Site } from './class-site';

export class Sites {
    private _active: number = 0;
    private _sites: Site[] = [];

    public setActive(index){
        this._active = index;
    }

    public getActive(){
        return this._getSite(this._active);
    }

    public addSite(folderPath, callback: any = false) {
        let site;
        let index = this.siteExists(folderPath);

        if ( index === -1 ) {
            site = new Site(folderPath);
            this._addSite(site);
        } else {
            site = this._getSite(index);
            site.addRelatedFolder(folderPath);
        }

        if (callback) {
            callback(site);
        }
    }

    public removeSite(folderPath, callback: any = false){
        let site;
        let index = this.siteExists(folderPath);

        if (index > -1) {
            site = this._getSite(index);
            site.removeRelatedFolder(folderPath);

            if (!site.hasRelatedFolders()) {
                this._removeSite(index)
            }
        }

        if (callback) {
            callback(site);
        }
    }

    public getSite(id:any = false) {
        let index = id ? this.siteExists(id) : 0;

        if ( index === -1 ) return;
        
        return this._getSite(index);
    }

    public getSites() {
        return this._sites;
    }

    public hasSites() {
        return (this.getSites().length > 0) ? true : false;
    }

    private _addSite(site) {
        this._sites.push(site);
    }

    private _removeSite(index){
        this._sites.splice(index, 1);
    }

    private _getSite(index){
        const sites = this.getSites();

        if (!sites.length) return;

        return sites[index];
    }

    public siteExists(id) {
        const sites = this.getSites();

        if (sites.length === 0) return -1;

        const type = path.basename(id.toString()) == id.toString() ? 'name' : 'path';

        for (let index = 0; index < sites.length; index++) {
            let site: any = sites[index];

            if (type == 'path' && site.isFolderRelated(id)) {
                return index;
            } else if (type == 'name' && site.getName() === id){
                return index;
            }
        }

        return -1;
    }
}