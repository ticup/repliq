///<reference path="./references.d.ts" />

import {Repliq, sync} from "./Repliq";
import {RepliqManager} from "./RepliqManager";
import {List} from "immutable";

export interface RpcRequest {
    selector: string;
    args: ValueJSON[];
}

export interface ValueJSON {
    val: any;
    type?: string;
}

export function serializeArgs(args: Object[]) {
    return args.map(toJSON);
}

// Highly inefficient serialization/deserialization :)

export function toJSON(val: Object): ValueJSON {
    let type = typeof val;
    if (type === "number") {
        return { val, type: "number" };
    }
    if (type === "string") {
        return { val, type: "string" };
    }
    if (type === "boolean") {
        return {val, type: "boolean"};
    }
    //if (type === "function") {
    //    return {val: val.toString(), type: "function" };
    //}
    if (type === "object") {
        if (val instanceof List) {
            console.log((<List<any>>val).toArray());
            return { val: (<List<any>>val).toArray().map(toJSON), type: "Array" };
        }
        if (val instanceof Array) {
            return { val: (<Array<Object>>val).map(toJSON), type: "Array" };
        }
        if (val instanceof Repliq) {
            let obj = {id: val.getId(), values: {}, templateId: val.getTemplate().getId()};
            val.committedKeys().forEach((key) => obj.values[key] = toJSON(val.getCommit(key)));
            return { val: obj, type: "Repliq" };
        }
        let obj = {};
        for (let key in val) {
            obj[key] = toJSON(val[key]);
        }
        return { val: obj, type: "object" };
    }
    if (type === "function" && (<any>val).isRepliq) {
        return { val: (<any>val).getId(), type: "RepliqTemplate" };
    }
    if (type === "undefined") {
        return {val, type: "undefined" };
    }

    throw new Error("unknown serialize value: " + val);
}


export function fromJSON({val, type}: ValueJSON, client: RepliqManager) {
    console.log("deserializing: " + JSON.stringify(val));
    if ((type === "number") || (type === "string") || (type === "boolean")) {
        return val;
    }
    if (type === "Array") {
        return List((<Array<ValueJSON>>val).map((v) => fromJSON(v, client)));
    }
    if (type === "object") {
        for (let key in val) {
            val[key] = fromJSON(val[key], client);
        }
        return val;
    }
    if (type === "Repliq") {
        let repl = client.getRepliq(val.id);
        if (repl)
            return repl;
        let template = client.getTemplate(val.templateId);
        if (!template) {
            throw new Error("undefined template: " + val.templateId);
        }
        let obj = {};
        for (let key in val.values) {
            obj[key] = fromJSON(val.values[key], client);
        }
        return client.add(template, obj, val.id);
    }
    if (type === "RepliqTemplate") {
        return client.getTemplate(val);
    }
    //if (type === "function") {
    //    eval("var result = " + val);
    //    return result;
    //}
    if (type === "undefined") {
        return undefined;
    }
    throw new Error("unknown serialize value" + val);
}

export function getRepliqReferences(val) {
    let type = typeof val;

    if (type === "object") {

        if (val instanceof List) {
            return getRepliqReferences((<List<any>>val).toArray());
        }
        if (val instanceof Array) {
            return val.reduce((acc, val) => acc.concat(getRepliqReferences), []);
        }

        if (val instanceof Repliq) {
            let repl = <Repliq>val;
            return [repl.getId()].concat(repl.committedKeys().reduce((acc, key) => acc.concat(getRepliqReferences(repl.get(key))), []));
        }



        return Object.keys(val).reduce((acc, key) => acc.concat(getRepliqReferences(val[key])), []);
    }

    if (type === "function" && (<any>val).isRepliq) {
        return Object.keys(val.fields).reduce((acc, name) => acc.concat(getRepliqReferences(val.fields[name])), []);
    }

    return [];
}