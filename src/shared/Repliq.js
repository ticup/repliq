var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RepliqData_1 = require("./RepliqData");
var events_1 = require("events");
var Repliq = (function (_super) {
    __extends(Repliq, _super);
    function Repliq(template, data, manager, clientId, id) {
        _super.call(this);
        this.clientId = clientId;
        this.manager = manager;
        this.data = data;
        this.template = template;
        this.id = id ? id : clientId + "@" + this.getTemplate().getId() + ":" + (manager ? manager.getNextTemplateId(template.getId()) : "0");
    }
    Repliq.getId = function () {
        return this.id;
    };
    Repliq.stub = function (args) {
        if (args === void 0) { args = {}; }
        var data = new RepliqData_1.RepliqData(args);
        var repl = new this(this, data, null, null);
        var Stub = (function (_super) {
            __extends(Stub, _super);
            function Stub(template, data) {
                _super.call(this, Stub, data, null, null);
            }
            Stub.prototype.call = function (op) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                return this.getMethod(op).call(args);
            };
            ;
            return Stub;
        })(this);
        return new Stub(this, data);
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
    Repliq.CHANGE_EXTERNAL = "change_external";
    Repliq.CHANGE = "change";
    Repliq.isRepliq = true;
    return Repliq;
})(events_1.EventEmitter);
exports.Repliq = Repliq;
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