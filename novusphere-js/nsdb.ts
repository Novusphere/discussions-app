class NSDBSettings {
    nsEndpoint:string;
    eosEndpoint:string;
    constructor() {
        this.nsEndpoint = 'https://db.novusphere.io';
        this.eosEndpoint = 'https://api.greymass.com';
    }
}

// static shared object for NSDB for settings
const settings = new NSDBSettings();

export default class NSDB {
    settings : NSDBSettings;

    constructor() {
        this.settings = settings;
    }

    query(q : any) : any {
        
    }
};