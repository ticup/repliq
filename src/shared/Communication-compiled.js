"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.serializeArgs = serializeArgs;
exports.serialize = serialize;
exports.deserialize = deserialize;

var _Repliq = require("./Repliq");

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; } ///<reference path="./Repliq" />

function serializeArgs(args) {
    return args.map(serialize);
}
function serialize(val) {
    var type = typeof val === "undefined" ? "undefined" : _typeof(val);
    if (type === "number") {
        return { val: val, type: "number" };
    }
    if (type === "string") {
        return { val: val, type: "string" };
    }
    if (type === "Array") {
        return { val: val.map(serialize), type: "Array" };
    }
    if (type === "Object") {
        if (val instanceof _Repliq.Repliq) {
            var obj = {};
            val.committedKeys().forEach(function (key) {
                return obj[key] = val.getCommit(key);
            });
            return { val: obj, type: "Repliq" };
        }
        return { val: val, type: "Object" };
    }
    throw new Error("unknown serialize value" + val);
}
function deserialize(_ref) {
    var val = _ref.val;
    var type = _ref.type;

    if (type === "number" || type === "string") {
        return val;
    }
    if (type === "Array") {
        return val.map(deserialize);
    }
    if (type === "Object") {
        for (var key in val) {
            val[key] = deserialize(val[key]);
        }
        return val;
    }
    if (type === "Repliq") {
        for (var key in val) {
            val[key] = deserialize(val[key]);
        }
        return (0, _Repliq.defineRepliq)(val);
    }
    throw new Error("unknown serialize value" + val);
}
//# sourceMappingURL=Communication.js.map

//# sourceMappingURL=Communication-compiled.js.map