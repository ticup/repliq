///<reference path="../../typings/tsd.d.ts" />
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
    return RepliqTemplate;
})();
exports.RepliqTemplate = RepliqTemplate;
var Repliq = (function () {
    function Repliq(template, clientId, args) {
        var _this = this;
        if (args === void 0) { args = {}; }
        this.template = template;
        this.clientId = clientId;
        this.committed = {};
        this.tentative = {};
        var defs = this.template.defaults;
        Object.keys(defs).forEach(function (key) {
            var val = defs[key];
            if (typeof val !== "function") {
                _this.committed[key] = defs[key];
                _this.tentative[key] = defs[key];
            }
        });
        Object.keys(args).forEach(function (key) {
            var val = args[key];
            if (typeof val !== "function") {
                return args[key] = val;
            }
            _this.committed[key] = args[key];
            _this.tentative[key] = args[key];
        });
        this.id = clientId + "@" + this.template.getId() + ":" + this.template.curId++;
    }
    Repliq.prototype.getId = function () {
        return this.id;
    };
    Repliq.prototype.get = function (key) {
        return this.tentative[key];
    };
    Repliq.prototype.getCommit = function (key) {
        return this.committed[key];
    };
    Repliq.prototype.commitKeys = function () {
        return Object.keys(this.committed);
    };
    return Repliq;
})();
exports.Repliq = Repliq;
function define(props) {
    return new RepliqTemplate(props);
}
exports.define = define;
//# sourceMappingURL=Repliq.js.map