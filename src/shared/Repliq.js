///<reference path="../../typings/tsd.d.ts" />
/// <reference path="references.d.ts" />
function computeHashString(str) {
    var hash = 0, i, chr, len;
    if (str.length == 0)
        return hash;
    for (i = 0, len = str.length; i < len; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return hash;
}
function computeHash(obj) {
    var str = Object.keys(obj).reduce(function (acc, key) { return (acc + key + obj[key].toString()); }, "");
    return computeHashString(str);
}
var RepliqTemplate = (function () {
    function RepliqTemplate(props) {
        var _this = this;
        if (props === void 0) { props = {}; }
        this.methods = {};
        this.defaults = {};
        Object.keys(props).forEach(function (key) {
            var val = props[key];
            if (typeof val === "function") {
                _this.methods[key] = val;
            }
            else {
                _this.defaults[key] = val;
            }
        });
        this.id = computeHash(props);
        this.curId = 0;
    }
    RepliqTemplate.prototype.getId = function () {
        return this.id;
    };
    RepliqTemplate.prototype.getNextId = function () {
        return this.curId++;
    };
    RepliqTemplate.prototype.getMethod = function (op) {
        return this.methods[op];
    };
    return RepliqTemplate;
})();
exports.RepliqTemplate = RepliqTemplate;
var Repliq = (function () {
    function Repliq(template, data, manager, clientId, id) {
        this.template = template;
        this.clientId = clientId;
        this.manager = manager;
        this.data = data;
        this.id = id ? id : clientId + "@" + this.template.getId() + ":" + this.template.curId++;
    }
    Repliq.prototype.get = function (key) {
        return this.data.getTentative(key);
    };
    Repliq.prototype.set = function (key, val) {
        this.call("set", key, val);
    };
    Repliq.prototype.getCommit = function (key) {
        return this.data.getCommitted(key);
    };
    Repliq.prototype.call = function (op) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return this.manager.call(this, this.data, op, args);
    };
    Repliq.prototype.getTemplate = function () {
        return this.template;
    };
    Repliq.prototype.getId = function () {
        return this.id;
    };
    Repliq.prototype.committedKeys = function () {
        return this.data.getCommittedKeys();
    };
    return Repliq;
})();
exports.Repliq = Repliq;
function define(props) {
    return new RepliqTemplate(props);
}
exports.define = define;
//# sourceMappingURL=Repliq.js.map