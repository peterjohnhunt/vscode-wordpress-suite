import { workspace } from 'vscode';

export class Config {
    public get(name) {
        return workspace.getConfiguration('wordpress-suite').get(name);
    }
}