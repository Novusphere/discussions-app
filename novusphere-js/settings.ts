import { DEFAULT_EOS_NETWORK } from './eos';
import { DEFAULT_NSDB_ENDPOINT } from './nsdb';
import { NetworkConfig } from 'eos-transit';

export class Settings {
    novusphereEndPoint : string;
    eosNetwork : NetworkConfig;

    constructor(){
        this.novusphereEndPoint = DEFAULT_NSDB_ENDPOINT;
        this.eosNetwork = Object.assign({}, DEFAULT_EOS_NETWORK);
    }
    
    async init() {
        
    }
}