var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Debug = require("debug");
var io = require('socket.io-client');
var Promise = require("bluebird");
var com = require("../shared/Communication");
var RepliqManager_1 = require("../shared/RepliqManager");
var Repliq_1 = require("../shared/Repliq");
var Round_1 = require("../shared/Round");
var debug = Debug("Repliq:com:client");
var RepliqClient = (function (_super) {
    __extends(RepliqClient, _super);
    function RepliqClient(host, schema, yieldEvery) {
        _super.call(this, schema, yieldEvery);
        this.serverNr = -1;
        this.incoming = [];
        this.channel = io(host, { forceNew: true });
        this.setupYieldPush();
        this.handshake();
    }
    RepliqClient.prototype.setupYieldPush = function () {
        var _this = this;
        this.channel.on("YieldPush", function (round) { return _this.handleYieldPull(round); });
    };
    RepliqClient.prototype.handshake = function () {
        this.channel.emit("handshake", { clientId: this.getId(), clientNr: this.getRoundNr(), serverNr: this.serverNr });
        var d = Promise.defer();
        this.onConnectP = d.promise;
        this.channel.on("handshake", function () {
            debug("handshaked");
            d.resolve();
        });
    };
    RepliqClient.prototype.handleYieldPull = function (json) {
        debug("YieldPull: received round");
        var round = Round_1.Round.fromJSON(json, this);
        this.incoming.push(round);
    };
    RepliqClient.prototype.onConnect = function () {
        return this.onConnectP;
    };
    RepliqClient.prototype.send = function (selector) {
        var _this = this;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return this.onConnect().then(function () {
            return new Promise(function (resolve, reject) {
                debug("sending rpc " + selector + "(" + args + ")");
                var rpc = { selector: selector, args: args.map(com.toJSON) };
                _this.channel.emit("rpc", rpc, function (error, result) {
                    var ser = result;
                    debug("received rpc result for " + selector + "(" + args + ") : " + result);
                    if (error)
                        return reject(new Error(error));
                    resolve(com.fromJSON(ser, _this));
                });
            });
        });
    };
    RepliqClient.prototype.stop = function () {
        this.channel.close();
    };
    RepliqClient.prototype.yield = function () {
        var _this = this;
        if (this.current.hasOperations()) {
            var round = this.current;
            this.pending.push(round);
            this.current = this.newRound();
            debug("YieldPull: " + JSON.stringify(round.toJSON()));
            this.channel.emit("YieldPull", round.toJSON());
        }
        if (this.incoming.length > 0) {
            this.replaying = true;
            var last = this.incoming[this.incoming.length - 1];
            this.forEachData(function (_, r) {
                return r.setToCommit();
            });
            var affectedExt = this.replay(this.incoming);
            var confirmedNr = last.getClientNr();
            var idx;
            this.pending.forEach(function (r, i) {
                if (r.getClientNr() <= confirmedNr) {
                    idx = i;
                }
            });
            if (typeof idx !== "undefined") {
                this.pending = this.pending.slice(idx + 1);
            }
            console.assert(this.serverNr < last.getServerNr() || this.serverNr == -1);
            this.serverNr = last.getServerNr();
            this.pending.forEach(function (round) {
                return _this.play(round);
            });
            this.incoming = [];
            this.replaying = false;
            affectedExt.forEach(function (rep) { rep.emit(Repliq_1.Repliq.CHANGE_EXTERNAL); rep.emit(Repliq_1.Repliq.CHANGE); });
        }
    };
    return RepliqClient;
})(RepliqManager_1.RepliqManager);
exports.RepliqClient = RepliqClient;
//# sourceMappingURL=RepliqClient.js.map