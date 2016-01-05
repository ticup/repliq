/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="../shared/references.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Debug = require("debug");
var io = require("socket.io");
var com = require("../shared/Communication");
var RepliqManager_1 = require("../shared/RepliqManager");
var Listeners_1 = require("./Listeners");
var Round_1 = require("../shared/Round");
var debug = Debug("Repliq:com:server");
var locald = Debug("Repliq:server");
var RepliqServer = (function (_super) {
    __extends(RepliqServer, _super);
    function RepliqServer(app, schema, yieldCycle) {
        var _this = this;
        this.channel = io(app);
        this.channel.on("connect", function (socket) {
            debug("client connected");
            socket.on("rpc", function (rpc, reply) {
                _this.handleRpc(rpc.selector, rpc.args, reply);
            });
            socket.on("YieldPull", function (json) {
                _this.handleYieldPull(json);
            });
        });
        this.channel.on("disconnect", function (socket) {
            debug("client disconnected");
        });
        this.channel.on("reconnect", function (socket) {
            debug("client reconnected");
        });
        this.listeners = new Listeners_1.Listeners();
        _super.call(this, schema);
        if (yieldCycle) {
            this.yieldEvery(yieldCycle);
        }
        else {
            this.propagator = true;
        }
    }
    RepliqServer.prototype.handleRpc = function (selector, sargs, reply) {
        var _this = this;
        debug("received rpc " + selector + "(" + sargs + ")");
        if (!this.api) {
            return reply("No exported API: " + selector);
        }
        var handler = this.api[selector];
        if (!handler) {
            return reply("No compatible function for " + selector);
        }
        var args = sargs.map(function (a) { return com.fromJSON(a, _this); });
        var result = handler.apply(this.api, args);
        reply(null, com.toJSON(result));
    };
    RepliqServer.prototype.handleYieldPull = function (json) {
        debug("YieldPull: received round");
        var round = Round_1.Round.fromJSON(json, this);
        this.incoming.push(round);
        this.notifyChanged();
    };
    RepliqServer.prototype.yield = function () {
        var _this = this;
        console.assert(!this.yielding);
        this.yielding = true;
        locald("yielding");
        var rounds = [];
        if (this.current.hasOperations()) {
            var cur = this.current;
            locald("- playing current round");
            this.replay([cur]);
            this.broadcastRound(cur);
            this.current = this.newRound();
        }
        if (this.incoming.length > 0) {
            locald("- adding incoming round");
            this.incoming.forEach(function (round) {
                round.setServerNr(_this.newRoundNr());
                rounds.push(round);
            });
            var affectedExt = this.replay(this.incoming);
            this.incoming.forEach(function (r) { return _this.broadcastRound(r); });
            this.incoming = [];
            affectedExt.forEach(function (rep) { return rep.emit("changedExternal"); });
        }
        this.yielding = false;
    };
    RepliqServer.prototype.startYieldCycle = function () {
        this.yield();
    };
    RepliqServer.prototype.yieldEvery = function (ms) {
        var _this = this;
        if (this.yieldTimer)
            this.stopYielding();
        this.yieldTimer = setInterval(function () { return _this.yield(); }, ms);
    };
    RepliqServer.prototype.stopYielding = function () {
        if (this.yieldTimer) {
            clearInterval(this.yieldTimer);
        }
    };
    RepliqServer.prototype.notifyChanged = function () {
        if (this.propagator && (!this.yielding))
            this.yield();
    };
    RepliqServer.prototype.broadcastRound = function (round) {
        debug("broadcasting round " + round.getServerNr());
        this.channel.emit("YieldPush", round.toJSON());
    };
    RepliqServer.prototype.onConnect = function () {
        return new Promise(function (resolve) {
        });
    };
    RepliqServer.prototype.stop = function () {
        this.channel.close();
    };
    RepliqServer.prototype.export = function (api) {
        if (this.api) {
            throw new Error("Cannot export multiple objects");
        }
        this.api = api;
    };
    return RepliqServer;
})(RepliqManager_1.RepliqManager);
exports.RepliqServer = RepliqServer;
//# sourceMappingURL=RepliqServer.js.map