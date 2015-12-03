///<reference path="./Repliq" />
///<reference path="../shared/Client" />

import {Repliq, define as defineRepliq} from "./Repliq";
import {Client} from "../shared/Client";

export interface RpcRequest {
    selector: string;
    args: SerializedObject[];
}

export interface SerializedObject {
    val: any;
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
            let obj = {values: {}, templateId: val.getTemplate().getId()};
            val.commitKeys().forEach((key) => obj.values[key] = serialize(val.getCommit(key)));
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


export function deserialize({val, type}: SerializedObject, client: Client) {
    console.log("deserializing: " + JSON.stringify(val));
    if ((type === "number") || (type === "string")) {
        return val;
    }
    if (type === "Array") {
        return (<Array<SerializedObject>>val).map((v) => deserialize(v, client));
    }
    if (type === "object") {
        for (let key in val) {
            val[key] = deserialize(val[key], client);
        }
        return val;
    }
    if (type === "Repliq") {
        let template = client.getTemplate(val.templateId);
        if (!template) {
            throw new Error("undefined template: " + val.templateId);
        }
        let obj = {};
        for (let key in val.values) {
            obj[key] = deserialize(val.values[key], client);
        }
        return client.create(template, obj);
    }
    if (type === "function") {
        eval("var result = " + val);
        return result;
    }
    if (type === "undefined") {
        return undefined;
    }
    throw new Error("unknown serialize value" + val);
}