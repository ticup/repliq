var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RepliqData_1 = require("./RepliqData");
var events_1 = require("events");
var immutable_1 = require("immutable");
require("harmony-reflect");
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
        if (args === void 0) { args = []; }
        var data = new RepliqData_1.RepliqData();
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
        var repl = new Stub(this, data);
        var proxy = createProxy(repl);
        if (repl.getMethod("init")) {
            repl.getMethod("init").apply(proxy, args);
        }
        return proxy;
    };
    Repliq.create = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        if (typeof this.manager === "undefined") {
            throw new Error("Repliq must first be declared to a manager");
        }
        return this.manager.create.apply(this.manager, [this].concat(args));
    };
    Repliq.extend = function (props) {
        if (props === void 0) { props = {}; }
        var F = function F() { };
        F.prototype = Object.assign(Object.create(Repliq.prototype), props);
        Object.keys(Repliq).forEach(function (key) { return F[key] = Repliq[key]; });
        return F;
    };
    Repliq.toStrings = function () {
        return "P: " + this.getId().toString().slice(-5);
    };
    Repliq.prototype.getMethod = function (op) {
        var method = this[op];
        if (typeof method === "function") {
            return method;
        }
        return undefined;
    };
    Repliq.prototype.get = function (key) {
        return this.data.getTentative(key);
    };
    Repliq.prototype.has = function (key) {
        return this.data.has(key);
    };
    Repliq.prototype.set = function (key, value) {
        return this.data.setTentative(key, value);
    };
    Repliq.prototype.confirmed = function () {
        return !this.data.hasTentative();
    };
    Repliq.prototype.fields = function () {
        return this.data.getKeys();
    };
    Repliq.prototype.getCommit = function (key) {
        return this.data.getCommit(key);
    };
    Repliq.prototype.getTemplate = function () {
        return this.template;
    };
    Repliq.prototype.getId = function () {
        return this.id;
    };
    Repliq.prototype.toString = function () {
        return "{" + this.getId().slice(-5) + "}";
    };
    Repliq.CHANGE_EXTERNAL = "change_external";
    Repliq.CHANGE = "change";
    Repliq.CREATE_SELECTOR = "createRepliq";
    Repliq.isRepliq = true;
    Repliq.isPrototype = true;
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
function createProxy(repl) {
    var proxy = new Proxy(repl, {
        has: function (target, key) {
            return target.has(key);
        },
        get: function (target, key, receiver) {
            var rmethod = Repliq.prototype[key];
            if (typeof rmethod === "function") {
                return rmethod.bind(target);
            }
            var method = target.getMethod(key);
            if (typeof method !== "undefined") {
                return function repliqMethod() {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i - 0] = arguments[_i];
                    }
                    var val = repl.manager.call(target, target.data, proxy, key, method, args);
                    return val;
                };
            }
            return target.get(key);
        },
        set: function (target, key, value, receiver) {
            target.set(key, value);
            return true;
        },
        preventExtensions: function () { return true; },
        setPrototypeOf: function () { return false; },
        deleteProperty: function (target, key) { return false; },
        defineProperty: function (target, key, attributes) { return false; },
        enumerate: function (target) { return target.fields(); },
        ownKeys: function (target) { return target.fields(); }
    });
    return proxy;
}
exports.createProxy = createProxy;
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