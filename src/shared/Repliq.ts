///<reference path="../../typings/tsd.d.ts" />
/// <reference path="references.d.ts" />

import {RepliqManager} from "./RepliqManager";
import {RepliqData} from "./RepliqData";
import {ClientId} from "./Types";
import {EventEmitter} from "events";
import {List} from "immutable";
require("harmony-reflect");

declare var Proxy;
//
//interface RepliqPrototype {
//    id: number;
//    isRepliq: boolean;
//    manager: RepliqManager;
//    getId(): number;
//    stub(Object: args): any;
//    create(Array<any>):
//
//
//}


export class Repliq extends EventEmitter {
    public static id: number;

    public static CHANGE_EXTERNAL = "change_external";
    public static CHANGE = "change";
    public static CREATE_SELECTOR = "createRepliq";

    static isRepliq : boolean = true;

    static isPrototype : boolean = true;

    public static manager: RepliqManager;

    static getId() {
        return this.id;
    }

    static stub(args: Array<any> = []) : any {
        let data = new RepliqData();
        //let repl = new this(this, data, null, null);
        //if (typeof repl["init"] === "function") {
        //    repl["init"].apply(repl, args);
        //}

        class Stub extends this {
            constructor(template: typeof Repliq, data: RepliqData) {
                super(Stub, data, null, null);
            }

            call(op, ...args) {
                return this.getMethod(op).call(args);
            };

            confirmed() {
                return false;
            }
        }

        let repl = new Stub(this, data);
        let proxy = createProxy(repl);
        if (repl.getMethod("init")) {
            repl.getMethod("init").apply(proxy, args);
        }
        return proxy;
    }

    static create(...args) {
        if (typeof this.manager === "undefined") {
            throw new Error("Repliq must first be declared to a manager");
        }
        return this.manager.create.apply(this.manager, [this].concat(args));
    }

    static extend(props = {})  {
        let F = <typeof Repliq> <any>function F() {};
        F.prototype = Object.assign(Object.create(Repliq.prototype), props);
        Object.keys(Repliq).forEach((key) => F[key] = Repliq[key]);
        //F.extend = Repliq.extend;
        //F.create = Repliq.create;
        //F.getId = Repliq.getId;
        //F.isRepliq = true;
        //F.stub = Repliq.stub;
        return F;
    }

    // cannot be toString(), because that is used to get the text representation
    static toStrings() {
        return "P: " + this.getId().toString().slice(-5);
    }






    private clientId: ClientId;
    public  manager : RepliqManager;
    private template: typeof Repliq;
    private data    : RepliqData;
    private id      : string;


    constructor(template: typeof Repliq, data: RepliqData, manager: RepliqManager, clientId: ClientId, id?: string) {
        super();
        this.clientId = clientId;
        this.manager = manager;
        this.data = data;
        this.template = template;
        this.id = id ? id : clientId + "@" + this.getTemplate().getId() + ":" + (manager ? manager.getNextTemplateId(template.getId()) : "0");
    }


    getMethod(op) {
        let method = this[op];
        if (typeof method === "function") {
            return method;
        }
        return undefined;
    }


    // user interface:

    get(key) {
        return this.data.getTentative(key);
    }

    has(key) {
        return this.data.has(key);
    }

    set(key, value) {
        return this.data.setTentative(key, value);
    }

    confirmed() {
        return !this.data.hasTentative();
    }

    fields() {
        return this.data.getKeys();
    }

    //set(key, val) {
    //    this.call("set", key, val);
        //return this.data.setTentative(key, val);
    //}

    getCommit(key) {
        return this.data.getCommit(key);
    }


    // internals

    getTemplate() {
        return this.template;
    }

    getId() {
        return this.id;
    }


    //committedKeys() {
    //    return this.data.getCommittedKeys();
    //}

    toString() {
        return "{" + this.getId().slice(-5) + "}";
        //return "{" + this.clientId.slice(-5) + "@" + this.getId().slice(-5) + "}";
    }
}


export function sync(target: any, key: string, prop: any) {
    return {
        value: function (...args: any[]) {
            args.forEach(validate);
            return this.call(key, prop.value, args);
        }
    };
}

export function createProxy(repl) {
    let proxy = new Proxy(repl, {
        has(target, key) {
            return target.has(key);
        },
        get(target, key, receiver) {
            // a standard repliq method
            let rmethod = Repliq.prototype[key];
            if (typeof rmethod === "function") {
                return rmethod.bind(target);
            }

            // a custom repliq method
            let method = target.getMethod(key);
            if (typeof method !== "undefined") {
                return function repliqMethod(...args) {
                    let val = repl.manager.call(target, target.data, proxy, key, method, args);
                    return val;
                };
            }

            // a repliq property
            return target.get(key);
        },
        set(target, key, value, receiver) {
            target.set(key, value);
            return true;
        },
        preventExtensions() { return true; },
        setPrototypeOf() { return false; },
        deleteProperty(target, key) { return false; },
        defineProperty(target, key, attributes) { return false },
        enumerate(target) { return target.fields(); },
        ownKeys(target) { return target.fields(); }
    });
    return proxy;
}

function validate(val) {
    let type = typeof val;
    if (type === "number" || type === "string" || type == "boolean" || type == "undefined") {
        return true;
    }
    if (type === "object") {
        if (val instanceof List) {
            return true;
        }
        if (val instanceof Array) {
            return true;
        }
        if (val instanceof Repliq) {
            return true;
        }
    }
    throw Error("cannot use " + val + " as an argument to a repliq method");
}