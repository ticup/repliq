///<reference path="./Repliq" />
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
            var obj_1 = {};
            val.commitKeys().forEach(function (key) { return obj_1[key] = val.getCommit(key); });
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
function deserialize(_a) {
    var val = _a.val, type = _a.type;
    if ((type === "number") || (type === "string")) {
        return val;
    }
    if (type === "Array") {
        return val.map(deserialize);
    }
    if (type === "object") {
        for (var key in val) {
            val[key] = deserialize(val[key]);
        }
        return val;
    }
    if (type === "Repliq") {
        for (var key in val) {
            val[key] = deserialize(val[key]);
        }
        return Repliq_1.define(val);
    }
    if (type === "function") {
        return;
    }
    if (type === "undefined") {
        return undefined;
    }
    throw new Error("unknown serialize value" + val);
}
exports.deserialize = deserialize;
//# sourceMappingURL=Communication.js.map