///<reference path="./Repliq" />

import {Repliq, define as defineRepliq} from "./Repliq";

export interface RpcRequest {
    selector: string;
    args: SerializedObject[];
}

export interface SerializedObject {
    val: Object;
    type?: string;
}

export function serializeArgs(args: Object[]) {
    return args.map(serialize);
}

// Highly inefficient serialization/deserialization :)

export function serialize(val: Object): SerializedObject {
    let type = typeof val;
    if (type === "number") {
        return { val, type: "number" };
    }
    if (type === "string") {
        return { val, type: "string" };
    }
    if (type === "function") {
        return {val: val.toString(), type: "function" };
    }
    if (type === "object") {
        if (val instanceof Array) {
            return { val: (<Array<Object>>val).map(serialize), type: "Array" };
        }
        if (val instanceof Repliq) {
            let obj = {};
            val.commitKeys().forEach((key) => obj[key] = val.getCommit(key));
            return { val: obj, type: "Repliq" };
        }
        let obj = {};
        for (let key in val) {
            obj[key] = serialize(val[key]);
        }
        return { val: obj, type: "object" };
    }
    if (type === "undefined") {
        return {val, type: "undefined" };
    }
    throw new Error("unknown serialize value: " + val);
}


export function deserialize({val, type}: SerializedObject) {
    if ((type === "number") || (type === "string")) {
        return val;
    }
    if (type === "Array") {
        return (<Array<SerializedObject>>val).map(deserialize);
    }
    if (type === "object") {
        for (let key in val) {
            val[key] = deserialize(val[key]);
        }
        return val;
    }
    if (type === "Repliq") {
        for (let key in val) {
            val[key] = deserialize(val[key]);
        }
        return defineRepliq(val);
    }
    if (type === "function") {
        return
    }
    if (type === "undefined") {
        return undefined;
    }
    throw new Error("unknown serialize value" + val);
}