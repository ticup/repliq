///<reference path="../../typings/tsd.d.ts" />
/// <reference path="references.d.ts" />

import {RepliqManager} from "./RepliqManager";
import {RepliqData} from "./RepliqData";
import {ClientId} from "./Types";

declare interface ProxyHandlerInterface<T> {
    get?: (target: T, property: string, receiver: T) => any;
    set?: (target: T, property: string, key: any, receiver: T) => boolean;
}

declare class Proxy<T> {
    constructor(target: T, handler: ProxyHandlerInterface<T>);
}

function computeHashString(str: string): number {
    var hash = 0, i, chr, len;
    if (str.length == 0) return hash;
    for (i = 0, len = str.length; i < len; i++) {
        chr   = str.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

function computeHash(obj: Object): number {
    let str = Object.keys(obj).reduce((acc, key) => (acc + key + obj[key].toString()), "");
    return computeHashString(str);
}

export class RepliqTemplate {
    private id: number;
    private methods;
    public defaults;

    private curId: number;

    constructor(props: Object = {}) {
        this.methods = {};
        this.defaults = {};

        Object.keys(props).forEach((key) => {
            let val = props[key];
            if (typeof val === "function") {
                this.methods[key] = val;
            } else {
                this.defaults[key] = val;
            }
        });

        this.id = computeHash(props);
        this.curId = 0;
    }

    getId() {
        return this.id;
    }

    getNextId() {
        return this.curId++;
    }

    getMethod(op) {
        return this.methods[op];
    }
}

export class Repliq {
    private id: string;
    private clientId: string;

    private manager: RepliqManager;
    private data: RepliqData;

    private template;

    constructor(template: RepliqTemplate, data: RepliqData, manager: RepliqManager,  clientId: ClientId, id?: string) {
        this.template = template;
        this.clientId = clientId;
        this.manager = manager;
        this.data = data;

        this.id = id ? id : clientId + "@" + this.template.getId() + ":" + this.template.curId++;
    }

    // user interface:

    get(key) {
        return this.data.getTentative(key);
    }

    set(key, val) {
        this.call("set", key, val);
        //return this.data.setTentative(key, val);
    }

    getCommit(key) {
        return this.data.getCommitted(key);
    }

    call(op, ...args) {
        return this.manager.call(this, this.data, op, args);
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

export function define(props) {
    return new RepliqTemplate(props);
}