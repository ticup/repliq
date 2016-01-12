var Repliq_1 = require("./Repliq");
var Operation_1 = require("./Operation");
var Round_1 = require("./Round");
var Debug = require("debug");
var guid = require("node-uuid");
var RepliqData_1 = require("./RepliqData");
var debug = Debug("Repliq:local");
var RepliqManager = (function () {
    function RepliqManager(schema, yieldEvery) {
        this.id = guid.v4();
        this.roundNr = 0;
        this.templates = {};
        this.repliqs = {};
        this.repliqsData = {};
        this.current = this.newRound();
        this.pending = [];
        this.confirmed = [];
        this.incoming = [];
        this.replaying = false;
        this.templateIds = {};
        if (schema) {
            this.declareAll(schema);
        }
        if (yieldEvery)
            this.yieldEvery(yieldEvery);
    }
    RepliqManager.prototype.getId = function () {
        return this.id;
    };
    RepliqManager.prototype.forEachData = function (f) {
        var _this = this;
        Object.keys(this.repliqsData).forEach(function (key) { return f(key, _this.repliqsData[key]); });
    };
    RepliqManager.prototype.declare = function (template) {
        template.id = computeHash(template.prototype);
        this.templates[template.getId()] = template;
        this.templateIds[template.getId()] = 0;
        debug("declaring template with id " + template.id);
    };
    RepliqManager.prototype.declareAll = function (templates) {
        var _this = this;
        Object.keys(templates).forEach(function (key) { return _this.declare(templates[key]); });
    };
    RepliqManager.prototype.create = function (template, args) {
        if (args === void 0) { args = {}; }
        if (typeof this.getTemplate(template.getId()) == "undefined") {
            throw new Error("cannot create a repliq that is not declared ");
        }
        var wasReplaying = this.replaying;
        this.replaying = true;
        var data = new RepliqData_1.RepliqData(template.fields);
        var repl = new template(template, data, this, this.id);
        this.replaying = wasReplaying;
        this.repliqs[repl.getId()] = repl;
        this.repliqsData[repl.getId()] = data;
        Object.keys(args).forEach(function (key) {
            repl.set(key, args[key]);
        });
        data.commitValues();
        this.current.add(new Operation_1.Operation(repl.getId(), Repliq_1.Repliq.CREATE_SELECTOR, [template].concat(args)));
        return repl;
    };
    RepliqManager.prototype.add = function (template, args, id) {
        if (typeof this.getRepliq(id) !== "undefined") {
            return this.getRepliq(id);
        }
        var wasReplaying = this.replaying;
        this.replaying = true;
        var data = new RepliqData_1.RepliqData(template.fields);
        var repl = new template(template, data, this, this.id, id);
        this.replaying = wasReplaying;
        this.repliqs[repl.getId()] = repl;
        this.repliqsData[repl.getId()] = data;
        Object.keys(args).forEach(function (key) {
            repl.set(key, args[key]);
        });
        data.commitValues();
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
    RepliqManager.prototype.getRoundNr = function () {
        return this.roundNr;
    };
    RepliqManager.prototype.getNextTemplateId = function (id) {
        console.assert(typeof this.templateIds[id] !== "undefined");
        var val = this.templateIds[id];
        this.templateIds[id] += 1;
        return val;
    };
    RepliqManager.prototype.call = function (repliq, data, selector, fun, args) {
        debug("calling " + selector + "(" + args.map(function (arg) { return arg.toString(); }).join(", ") + ")");
        var startReplay = false;
        if (!this.replaying) {
            startReplay = true;
            debug("recording " + selector + "(" + args + ")");
            this.current.add(new Operation_1.Operation(repliq.getId(), selector, args));
            this.replaying = true;
        }
        var res = fun.apply(repliq, args);
        if (startReplay) {
            this.replaying = false;
            this.notifyChanged();
            repliq.emit(Repliq_1.Repliq.CHANGE);
        }
        return res;
    };
    RepliqManager.prototype.execute = function (selector, id, args) {
        if (selector === Repliq_1.Repliq.CREATE_SELECTOR) {
            var template = args[0];
            debug("creating repliq with id " + id + "(" + args.slice(1) + " )");
            this.add(template, args[1], id);
        }
        else {
            return new Error(selector + " does not exist");
        }
    };
    RepliqManager.prototype.replay = function (rounds) {
        var _this = this;
        this.replaying = true;
        var affected = rounds.reduce(function (acc, round) {
            return acc.concat(_this.play(round));
        }, []);
        this.forEachData(function (_, r) {
            return r.commitValues();
        });
        this.replaying = false;
        return affected;
    };
    RepliqManager.prototype.play = function (round) {
        var _this = this;
        debug("playing round o:" + round.getOriginNr() + " s: " + round.getServerNr());
        var affected = [];
        round.operations.forEach(function (op) {
            debug(op.targetId + " . " + op.selector);
            if (op.selector === Repliq_1.Repliq.CREATE_SELECTOR) {
                _this.execute(op.selector, op.targetId, op.args);
            }
            else {
                var rep = _this.getRepliq(op.targetId);
                rep[op.selector].apply(rep, op.args);
                affected.push(rep);
            }
        });
        return affected;
    };
    RepliqManager.prototype.newRound = function () {
        return new Round_1.Round(this.newRoundNr(), this.getId());
    };
    RepliqManager.prototype.newRoundNr = function () {
        return this.roundNr++;
    };
    RepliqManager.prototype.notifyChanged = function () {
    };
    RepliqManager.prototype.yieldEvery = function (ms) {
        var _this = this;
        if (this.yieldTimer)
            this.stopYielding();
        this.yieldTimer = setInterval(function () { return _this.yield(); }, ms);
    };
    RepliqManager.prototype.stopYielding = function () {
        if (this.yieldTimer) {
            clearInterval(this.yieldTimer);
        }
    };
    RepliqManager.prototype.yield = function () { throw Error("should be implemented by client/server"); };
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
    var str = Object.keys(obj).reduce(function (acc, key) { return (obj.hasOwnProperty(key) ? (acc + key + obj[key].toString()) : ""); }, "");
    return computeHashString(str);
}
//# sourceMappingURL=RepliqManager.js.map