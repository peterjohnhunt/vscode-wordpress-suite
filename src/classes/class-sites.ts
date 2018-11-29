import { Site } from './class-site';

export class Sites {
    private _sites: Site[] = [];

    public addSite(folderPath) {
        let site;
        let index = this._siteExists(folderPath);

        if ( index === -1 ) {
            site = new Site(folderPath);
            this._addSite(site);
        } else {
            site = this._getSite(index);
            site.addFolder(folderPath);
        }
    }

    public removeSite(folderPath){
        let index = this._siteExists(folderPath);

        if (index > -1) {
            let site = this._getSite(index);
            site.removeFolder(folderPath);

            if (!site.hasFolders()) {
                this._removeSite(index)
            }
        }
    }

    public getSite(folderPath) {
        let index = this._siteExists(folderPath);

        if ( index === -1 ) return;
        
        return this._getSite(index);
    }

    public getSites() {
        return this._sites;
    }

    private _addSite(site) {
        this._sites.push(site);
    }

    private _removeSite(index){
        this._sites.splice(index, 1);
    }

    private _getSite(index){
        let sites = this.getSites();

        return sites[index];
    }

    private _siteExists(folderPath) {
        let sites = this.getSites();

        if (sites.length === 0) return -1;

        for (let index = 0; index < sites.length; index++) {
            let site: any = sites[index];

            if (site.isFolderRelated(folderPath)) {
                return index;
            }
        }

        return -1;
    }
}