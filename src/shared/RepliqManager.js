/// <reference path="references.d.ts" />
/// <reference path="../../typings/tsd.d.ts" />
var Repliq_1 = require("./Repliq");
var Operation_1 = require("./Operation");
var Debug = require("debug");
var guid = require("node-uuid");
var debug = Debug("Repliq:local");
var RepliqManager = (function () {
    function RepliqManager() {
        this.id = guid.v4();
        this.templates = {};
        this.repliqs = {};
        this.current = [];
    }
    RepliqManager.prototype.getId = function () {
        return this.id;
    };
    RepliqManager.prototype.declare = function (template) {
        this.templates[template.getId()] = template;
    };
    RepliqManager.prototype.create = function (template, args) {
        var repl = new Repliq_1.Repliq(template, args, this.id, this);
        this.repliqs[repl.getId()] = repl;
        return repl;
    };
    RepliqManager.prototype.add = function (template, args, id) {
        var repl = new Repliq_1.Repliq(template, args, this.id, this, id);
        this.repliqs[repl.getId()] = repl;
        return repl;
    };
    RepliqManager.prototype.getTemplate = function (id) {
        return this.templates[id];
    };
    RepliqManager.prototype.getRepliq = function (id) {
        return this.repliqs[id];
    };
    RepliqManager.prototype.call = function (repliq, data, sel, args) {
        debug("calling " + sel + "(" + args + ")");
        var fun = (sel == "set") ? (function () { return data.setTentative(args[0], args[1]); }) : repliq.getTemplate().getMethod(sel);
        if (!fun) {
            throw new Error("Undefined method " + sel + " in " + repliq);
        }
        if (this.replaying) {
            if (repliq !== this.replaying) {
                throw new Error("Cannot call repliq method from within another repliq method");
            }
        }
        else {
            this.current.push(new Operation_1.Operation(repliq, sel, args));
            this.replaying = repliq;
        }
        return fun.apply(repliq, args);
    };
    return RepliqManager;
})();
exports.RepliqManager = RepliqManager;
//# sourceMappingURL=RepliqManager.js.map