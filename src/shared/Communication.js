///<reference path="./Repliq" />
///<reference path="../shared/Client" />
var Repliq_1 = require("./Repliq");
function serializeArgs(args) {
    return args.map(serialize);
}
exports.serializeArgs = serializeArgs;
function serialize(val) {
    var type = typeof val;
    if (type === "number") {
        return { val: val, type: "number" };
    }
    if (type === "string") {
        return { val: val, type: "string" };
    }
    if (type === "function") {
        return { val: val.toString(), type: "function" };
    }
    if (type === "object") {
        if (val instanceof Array) {
            return { val: val.map(serialize), type: "Array" };
        }
        if (val instanceof Repliq_1.Repliq) {
            var obj_1 = { values: {}, templateId: val.getTemplate().getId() };
            val.commitKeys().forEach(function (key) { return obj_1.values[key] = serialize(val.getCommit(key)); });
            return { val: obj_1, type: "Repliq" };
        }
        var obj = {};
        for (var key in val) {
            obj[key] = serialize(val[key]);
        }
        return { val: obj, type: "object" };
    }
    if (type === "undefined") {
        return { val: val, type: "undefined" };
    }
    throw new Error("unknown serialize value: " + val);
}
exports.serialize = serialize;
function deserialize(_a, client) {
    var val = _a.val, type = _a.type;
    console.log("deserializing: " + JSON.stringify(val));
    if ((type === "number") || (type === "string")) {
        return val;
    }
    if (type === "Array") {
        return val.map(function (v) { return deserialize(v, client); });
    }
    if (type === "object") {
        for (var key in val) {
            val[key] = deserialize(val[key], client);
        }
        return val;
    }
    if (type === "Repliq") {
        var template = client.getTemplate(val.templateId);
        if (!template) {
            throw new Error("undefined template: " + val.templateId);
        }
        var obj = {};
        for (var key in val.values) {
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
exports.deserialize = deserialize;
//# sourceMappingURL=Communication.js.map