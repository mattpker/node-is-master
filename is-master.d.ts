declare module 'is-master' {

import { EventEmitter } from "events";

 var im : ismaster.IsMaster;

 namespace ismaster {
    
    interface IsMasterOptions{
        timeout? : number;
        mongooseConnection : any;
    }

    interface IsMaster extends EventEmitter {
        master : boolean;
        collection : string;
        hostname : string;
        pid : string;
        versions : any;
        id? : any;
        timeout : number;
        mongooseConnection? : any;

        start(options? : IsMasterOptions) : any;
        mongooseInit() : void;
        startWorker() : void;
        process() : void;
        isMaster(f : Function) : void;
    }

    
}


export = im
}