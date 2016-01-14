var Repliq_1 = require("./Repliq");
var immutable_1 = require("immutable");
function serializeArgs(args) {
    return args.map(toJSON);
}
exports.serializeArgs = serializeArgs;
function toJSON(val) {
    var type = typeof val;
    if (type === "number") {
        return { val: val, type: "number" };
    }
    if (type === "string") {
        return { val: val, type: "string" };
    }
    if (type === "boolean") {
        return { val: val, type: "boolean" };
    }
    if (type === "object") {
        if (val instanceof immutable_1.List) {
            console.log(val.toArray());
            return { val: val.toArray().map(toJSON), type: "Array" };
        }
        if (val instanceof Array) {
            return { val: val.map(toJSON), type: "Array" };
        }
        if (val instanceof Repliq_1.Repliq) {
            var obj_1 = { id: val.getId(), values: {}, templateId: val.getTemplate().getId() };
            val.committedKeys().forEach(function (key) { return obj_1.values[key] = toJSON(val.getCommit(key)); });
            return { val: obj_1, type: "Repliq" };
        }
        var obj = {};
        for (var key in val) {
            obj[key] = toJSON(val[key]);
        }
        return { val: obj, type: "object" };
    }
    if (type === "function" && val.isRepliq) {
        return { val: val.getId(), type: "RepliqTemplate" };
    }
    if (type === "undefined") {
        return { val: val, type: "undefined" };
    }
    throw new Error("unknown serialize value: " + val);
}
exports.toJSON = toJSON;
function fromJSON(_a, client) {
    var val = _a.val, type = _a.type;
    console.log("deserializing: " + JSON.stringify(val));
    if ((type === "number") || (type === "string") || (type === "boolean")) {
        return val;
    }
    if (type === "Array") {
        return immutable_1.List(val.map(function (v) { return fromJSON(v, client); }));
    }
    if (type === "object") {
        for (var key in val) {
            val[key] = fromJSON(val[key], client);
        }
        return val;
    }
    if (type === "Repliq") {
        var repl = client.getRepliq(val.id);
        if (repl)
            return repl;
        var template = client.getTemplate(val.templateId);
        if (!template) {
            throw new Error("undefined template: " + val.templateId);
        }
        var obj = {};
        for (var key in val.values) {
            obj[key] = fromJSON(val.values[key], client);
        }
        return client.add(template, obj, val.id);
    }
    if (type === "RepliqTemplate") {
        return client.getTemplate(val);
    }
    if (type === "undefined") {
        return undefined;
    }
    throw new Error("unknown serialize value" + val);
}
exports.fromJSON = fromJSON;
function getRepliqReferences(val) {
    var type = typeof val;
    if (type === "object") {
        if (val instanceof immutable_1.List) {
            return getRepliqReferences(val.toArray());
        }
        if (val instanceof Array) {
            return val.reduce(function (acc, val) { return acc.concat(getRepliqReferences(val)); }, []);
        }
        if (val instanceof Repliq_1.Repliq) {
            var repl = val;
            return [repl.getId()].concat(repl.committedKeys().reduce(function (acc, key) { return acc.concat(getRepliqReferences(repl.get(key))); }, []));
        }
        return Object.keys(val).reduce(function (acc, key) { return acc.concat(getRepliqReferences(val[key])); }, []);
    }
    if (type === "function" && val.isRepliq) {
        return Object.keys(val.fields).reduce(function (acc, name) { return acc.concat(getRepliqReferences(val.fields[name])); }, []);
    }
    return [];
}
exports.getRepliqReferences = getRepliqReferences;
//# sourceMappingURL=Communication.js.map