///<reference path="../../typings/tsd.d.ts" />
/// <reference path="references.d.ts" />

import {RepliqManager} from "./RepliqManager";
import {RepliqData} from "./RepliqData";
import {ClientId} from "./Types";
import {EventEmitter} from "events";

export class Repliq extends EventEmitter {
    public static id: number;

    public static CHANGE_EXTERNAL = "change_external";
    public static CHANGE = "change";

    static isRepliq : boolean = true;

    static getId() {
        return this.id;
    }

    static stub(args = {}) : any {
        let data = new RepliqData(args);
        let repl = new this(this, data, null, null);

        class Stub extends this {
            constructor(template: typeof Repliq, data: RepliqData) {
                super(Stub, data, null, null);
            }

            call(op, ...args) {
                return this.getMethod(op).call(args);
            };
        }

        return new Stub(this, data);
    }






    private clientId: ClientId;
    public  manager : RepliqManager;
    private template: typeof Repliq;
    private data    : RepliqData;
    private id      : string;


    constructor(template: typeof Repliq, data: RepliqData, manager: RepliqManager,  clientId: ClientId, id?: string) {
        super();
        this.clientId = clientId;
        this.manager = manager;
        this.data = data;
        this.template = template;

        this.id = id ? id : clientId + "@" + this.getTemplate().getId() + ":" + (manager ? manager.getNextTemplateId(template.getId()) : "0");
    }


    getMethod(op) {
        return this[op];
    }


    // user interface:

    get(key) {
        return this.data.getTentative(key);
    }

    set(key, value) {
        return this.data.setTentative(key, value);
    }

    //set(key, val) {
    //    this.call("set", key, val);
        //return this.data.setTentative(key, val);
    //}

    getCommit(key) {
        return this.data.getCommitted(key);
    }

    call(op, fun: Function, args) {
        let val = this.manager.call(this, this.data, op, fun, args);
        //this.manager.notifyChanged();
        return val;
    }


    // internals

    getTemplate() {
        return this.template;
    }

    getId() {
        return this.id;
    }


    committedKeys() {
        return this.data.getCommittedKeys();
    }
}


export function sync(target: any, key: string, prop: any) {
    return {
        value: function (...args: any[]) {
            return this.call(key, prop.value, args);
        }
    };
}