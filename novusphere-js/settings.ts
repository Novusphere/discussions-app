import { DEFAULT_EOS_NETWORK } from './eos';
import { NetworkConfig } from 'eos-transit';

export class Settings {
    novusphereEndPoint : string;
    eosNetwork : NetworkConfig;

    constructor(){
        this.novusphereEndPoint = 'https://db.novusphere.io';
        this.eosNetwork = Object.assign({}, DEFAULT_EOS_NETWORK);
    }
    
    async init() {
        
    }
}