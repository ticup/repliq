var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RepliqData_1 = require("./RepliqData");
var events_1 = require("events");
var immutable_1 = require("immutable");
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
            Stub.prototype.confirmed = function () {
                return false;
            };
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
    Repliq.prototype.confirmed = function () {
        return !this.data.hasTentative();
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
    Repliq.prototype.init = function () { };
    Repliq.prototype.toString = function () {
        return "{" + this.clientId.slice(-5) + "@" + this.getId().slice(-5) + "}";
    };
    Repliq.CHANGE_EXTERNAL = "change_external";
    Repliq.CHANGE = "change";
    Repliq.CREATE_SELECTOR = "createRepliq";
    Repliq.isRepliq = true;
    Repliq.fields = {};
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
            args.forEach(validate);
            return this.call(key, prop.value, args);
        }
    };
}
exports.sync = sync;
function validate(val) {
    var type = typeof val;
    if (type === "number" || type === "string" || type == "boolean" || type == "undefined") {
        return true;
    }
    if (type === "object") {
        if (val instanceof immutable_1.List) {
            return true;
        }
        if (val instanceof Array) {
            return true;
        }
        if (val instanceof Repliq) {
            return true;
        }
    }
    throw Error("cannot use " + val + " as an argument to a repliq method");
}
//# sourceMappingURL=Repliq.js.map