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
    function RepliqServer(app) {
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
        _super.call(this);
    }
    RepliqServer.prototype.handleRpc = function (selector, sargs, reply) {
        var _this = this;
        debug("received rpc " + selector + "(" + sargs + ")");
        if (!this.api) {
            return reply("No exported API");
        }
        var handler = this.api[selector];
        if (!handler) {
            return reply("No compatible function for " + selector);
        }
        var args = sargs.map(function (a) { return com.fromJSON(a, _this); });
        var result = handler.apply(this.api, args);
        debug("result for rpc: " + result);
        reply(null, com.toJSON(result));
    };
    RepliqServer.prototype.handleYieldPull = function (json) {
        debug("received round");
        var round = Round_1.Round.fromJSON(json, this);
        this.incoming.push(round);
    };
    RepliqServer.prototype.yield = function () {
        var _this = this;
        locald("yielding");
        var rounds = [];
        if (this.current.hasOperations()) {
            locald("- adding current");
            rounds.push(this.current);
            this.current = this.newRound();
        }
        if (this.incoming.length > 0) {
            locald("- adding incoming");
            rounds = rounds.concat(this.incoming);
            this.incoming = [];
        }
        if (rounds.length > 0) {
            locald(rounds);
            rounds.forEach(function (round) {
                return _this.play(round);
            });
            this.forEachData(function (_, r) {
                return r.commitValues();
            });
        }
        rounds.forEach(function (round) { return _this.broadcastRound(round); });
    };
    RepliqServer.prototype.broadcastRound = function (round) {
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