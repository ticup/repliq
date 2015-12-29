/// <reference path="references.d.ts" />
/// <reference path="../../typings/tsd.d.ts" />
var Operation_1 = require("./Operation");
var Round_1 = require("./Round");
var Debug = require("debug");
var guid = require("node-uuid");
var RepliqData_1 = require("./RepliqData");
var debug = Debug("Repliq:local");
var RepliqManager = (function () {
    function RepliqManager(schema) {
        this.id = guid.v4();
        this.roundNr = 0;
        this.templates = {};
        this.repliqs = {};
        this.repliqsData = {};
        this.current = this.newRound();
        this.pending = [];
        this.confirmed = [];
        this.incoming = [];
        if (schema) {
            this.declareAll(schema);
        }
    }
    RepliqManager.prototype.getId = function () {
        return this.id;
    };
    RepliqManager.prototype.forEachData = function (f) {
        var _this = this;
        Object.keys(this.repliqsData).forEach(function (key) { return f(key, _this.repliqsData[key]); });
    };
    RepliqManager.prototype.declare = function (template) {
        template.id = computeHash(template);
        this.templates[template.getId()] = template;
    };
    RepliqManager.prototype.declareAll = function (templates) {
        var _this = this;
        Object.keys(templates).forEach(function (key) { return _this.declare(templates[key]); });
    };
    RepliqManager.prototype.create = function (template, args) {
        if (args === void 0) { args = {}; }
        var data = new RepliqData_1.RepliqData(args);
        var repl = new template(template, data, this, this.id);
        this.repliqs[repl.getId()] = repl;
        this.repliqsData[repl.getId()] = data;
        return repl;
    };
    RepliqManager.prototype.add = function (template, args, id) {
        var data = new RepliqData_1.RepliqData(args);
        var repl = new template(template, data, this, this.id, id);
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
    RepliqManager.prototype.call = function (repliq, data, selector, fun, args) {
        debug("calling " + selector + "(" + args + ")");
        var startReplay = false;
        if (!this.replaying) {
            startReplay = true;
            this.current.add(new Operation_1.Operation(repliq.getId(), selector, args));
            this.replaying = repliq;
        }
        var res = fun.apply(data, args);
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
        debug("playing round " + round.getOriginNr() + " (" + round.operations.length + ")");
        round.operations.forEach(function (op) {
            debug(op.targetId + " . " + op.selector);
            if (op.targetId === undefined) {
                _this.execute(op.selector, op.args);
            }
            else {
                var rep = _this.getRepliq(op.targetId);
                rep[op.selector].call(rep, op.args);
            }
        });
    };
    RepliqManager.prototype.newRound = function () {
        return new Round_1.Round(this.newRoundNr(), this.getId());
    };
    RepliqManager.prototype.newRoundNr = function () {
        return this.roundNr++;
    };
    RepliqManager.prototype.notifyChanged = function () {
    };
    return RepliqManager;
})();
exports.RepliqManager = RepliqManager;
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
//# sourceMappingURL=RepliqManager.js.map