///<reference path="../../typings/tsd.d.ts" />
/// <reference path="references.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RepliqData_1 = require("./RepliqData");
var Repliq = (function () {
    function Repliq(template, data, manager, clientId, id) {
        this.clientId = clientId;
        this.manager = manager;
        this.data = data;
        this.template = template;
        this.id = id ? id : clientId + "@" + this.getTemplate().getId() + ":" + this.getTemplate().curId++;
    }
    Repliq.stub = function () {
        var data = new RepliqData_1.RepliqData({});
        var repl = new RepliqStub(this, data);
        return repl;
    };
    Repliq.getId = function () {
        return this.id;
    };
    Repliq.getNextId = function () {
        return this.curId++;
    };
    Repliq.prototype.getMethod = function (op) {
        return this[op];
    };
    Repliq.prototype.get = function (key) {
        return this.data.getTentative(key);
    };
    Repliq.prototype.set = function (key, value) {
        return this.data.setTentative(key, value);
    };
    Repliq.prototype.getCommit = function (key) {
        return this.data.getCommitted(key);
    };
    Repliq.prototype.call = function (op, fun, args) {
        var val = this.manager.call(this, this.data, op, fun, args);
        this.manager.notifyChanged();
        return val;
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
    Repliq.curId = 0;
    Repliq.isRepliq = true;
    return Repliq;
})();
exports.Repliq = Repliq;
var RepliqStub = (function (_super) {
    __extends(RepliqStub, _super);
    function RepliqStub(template, data) {
        _super.call(this, template, data, null, null);
    }
    RepliqStub.prototype.call = function (op) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return this.getMethod(op).call(args);
    };
    return RepliqStub;
})(Repliq);
exports.RepliqStub = RepliqStub;
function sync(target, key, prop) {
    return {
        value: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            return this.call(key, prop.value, args);
        }
    };
}
exports.sync = sync;
//# sourceMappingURL=Repliq.js.map