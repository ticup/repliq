///<reference path="../../typings/tsd.d.ts" />

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
    private defaults;

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
}

export class Repliq {
    private id: string;
    private clientId: string;
    private committed;
    private tentative;
    private template;

    constructor(template: RepliqTemplate, clientId, args = {}) {
        this.template = template;
        this.clientId = clientId;

        this.committed = {};
        this.tentative = {};


        let defs = this.template.defaults;
        Object.keys(defs).forEach((key) => {
            let val = defs[key];
            if (typeof val !== "function") {
                this.committed[key] = defs[key];
                this.tentative[key] = defs[key];
            }
        });

        Object.keys(args).forEach((key) => {
            let val = args[key];
            if (typeof val !== "function") {
                return args[key] = val;
            }
            this.committed[key] = args[key];
            this.tentative[key] = args[key];
        });

        this.id = clientId + "@" + this.template.getId() + ":" + this.template.curId++;
    }

    getId() {
        return this.id;
    }

    get(key) {
        return this.tentative[key];
    }

    getCommit(key) {
        return this.committed[key];
    }

    commitKeys() {
        return Object.keys(this.committed);
    }
}

export function define(props) {
    return new RepliqTemplate(props);
}