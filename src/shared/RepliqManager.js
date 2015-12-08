/// <reference path="references.d.ts" />
/// <reference path="../../typings/tsd.d.ts" />
var Repliq_1 = require("./Repliq");
var Operation_1 = require("./Operation");
var Round_1 = require("./Round");
var Debug = require("debug");
var guid = require("node-uuid");
var RepliqData_1 = require("./RepliqData");
var debug = Debug("Repliq:local");
var RepliqManager = (function () {
    function RepliqManager() {
        this.id = guid.v4();
        this.roundNr = 0;
        this.templates = {};
        this.repliqs = {};
        this.repliqsData = {};
        this.current = this.newRound();
        this.pending = [];
        this.confirmed = [];
        this.incoming = [];
    }
    RepliqManager.prototype.getId = function () {
        return this.id;
    };
    RepliqManager.prototype.forEachData = function (f) {
        var _this = this;
        Object.keys(this.repliqsData).forEach(function (key) { return f(key, _this.repliqsData[key]); });
    };
    RepliqManager.prototype.declare = function (template) {
        this.templates[template.getId()] = template;
    };
    RepliqManager.prototype.create = function (template, args) {
        var data = new RepliqData_1.RepliqData(template.defaults, args);
        var repl = new Repliq_1.Repliq(template, data, this, this.id);
        this.repliqs[repl.getId()] = repl;
        this.repliqsData[repl.getId()] = data;
        return repl;
    };
    RepliqManager.prototype.add = function (template, args, id) {
        var data = new RepliqData_1.RepliqData(template.defaults, args);
        var repl = new Repliq_1.Repliq(template, data, this, this.id, id);
        this.repliqs[repl.getId()] = repl;
        this.repliqsData[repl.getId()] = data;
        return repl;
    };
    RepliqManager.prototype.getTemplate = function (id) {
        return this.templates[id];
    };
    RepliqManager.prototype.getRepliq = function (id) {
        return this.repliqs[id];
    };
    RepliqManager.prototype.getRepliqData = function (id) {
        return this.repliqsData[id];
    };
    RepliqManager.prototype.call = function (repliq, data, selector, args) {
        debug("calling " + selector + "(" + args + ")");
        var startReplay = false;
        var fun = (selector == "set") ? (function () { console.log('calling set'); data.setTentative(args[0], args[1]); }) : repliq.getTemplate().getMethod(selector);
        if (!fun) {
            throw new Error("Undefined method " + selector + " in " + repliq);
        }
        if (this.replaying) {
            if (repliq !== this.replaying) {
                throw new Error("Cannot call repliq method from within another repliq method");
            }
        }
        else {
            startReplay = true;
            this.current.add(new Operation_1.Operation(repliq.getId(), selector, args));
            this.replaying = repliq;
        }
        var res = fun.apply(repliq, args);
        if (startReplay) {
            this.replaying = undefined;
        }
        return res;
    };
    RepliqManager.prototype.execute = function (selector, args) {
        if (selector === "CreateRepliq") {
            var template = args[0];
            var id = args[1];
            debug("creating repliq with id " + id + "(" + args.slice(2) + " )");
            this.add(template, args[2], id);
        }
        else {
            return new Error(selector + " does not exist");
        }
    };
    RepliqManager.prototype.play = function (round) {
        var _this = this;
        debug("playing round " + round.getNr() + " (" + round.operations.length + ")");
        round.operations.forEach(function (op) {
            debug(op.targetId + " . " + op.selector);
            if (op.targetId === undefined) {
                _this.execute(op.selector, op.args);
            }
            else {
                _this.call(_this.getRepliq(op.targetId), _this.getRepliqData(op.targetId), op.selector, op.args);
            }
        });
    };
    RepliqManager.prototype.newRound = function () {
        return new Round_1.Round(this.roundNr++, this.getId());
    };
    return RepliqManager;
})();
exports.RepliqManager = RepliqManager;
//# sourceMappingURL=RepliqManager.js.map