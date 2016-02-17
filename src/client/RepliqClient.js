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
        this.connect(host);
    }
    RepliqClient.prototype.connect = function (host) {
        this.channel = io(host, { forceNew: true });
        return this.handshake();
    };
    RepliqClient.prototype.setupYieldPush = function (channel) {
        var _this = this;
        channel.on("YieldPush", function (round) { return _this.handleYieldPull(round); });
    };
    RepliqClient.prototype.handshake = function () {
        var _this = this;
        this.channel.emit("handshake", { clientId: this.getId(), clientNr: this.getRoundNr(), serverNr: this.serverNr });
        this.onConnectP = new Promise(function (resolve, reject) {
            _this.channel.on("handshake", function (_a) {
                var err = _a.err, lastClientNr = _a.lastClientNr, lastServerNr = _a.lastServerNr, round = _a.round;
                if (err) {
                    reject("failed to handshake");
                    throw err;
                }
                _this.setupYieldPush(_this.channel);
                debug("handshaking... clientNr: " + _this.getRoundNr() + " , server received clientNr: " + lastClientNr);
                if (round) {
                    console.assert(lastClientNr <= _this.getRoundNr());
                    console.assert(lastServerNr <= _this.getServerNr() || _this.getServerNr() == -1);
                    if (_this.incoming.length > 0) {
                        _this.yield();
                    }
                    _this.incoming = [Round_1.Round.fromJSON(round, _this)];
                    _this.yield();
                }
                if (_this.pending.length > 0) {
                    console.assert(_this.pending[_this.pending.length - 1].getClientNr() > lastClientNr);
                    _this.pending.forEach(function (r) { return _this.channel.emit("YieldPull", r.toJSON()); });
                }
                resolve();
            });
        });
        return this.onConnectP;
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
            var pending = this.pending;
            var last = this.incoming[this.incoming.length - 1];
            this.forEachData(function (_, r) {
                return r.setToCommit();
            });
            var affectedExt = this.replay(this.incoming);
            var confirmedNr = last.getClientNr();
            this.pending = pending.filter(function (r) { return r.getClientNr() > confirmedNr; });
            console.assert(this.serverNr <= last.getServerNr() || this.serverNr == -1);
            this.serverNr = last.getServerNr();
            this.pending.forEach(function (round) {
                return _this.play(round);
            });
            this.incoming = [];
            pending.forEach(function (r) { return r.getClientNr() <= confirmedNr ? _this.confirmed.push(r) : null; });
            this.replaying = false;
            affectedExt.forEach(function (rep) { rep.emit(Repliq_1.Repliq.CHANGE_EXTERNAL); rep.emit(Repliq_1.Repliq.CHANGE); });
        }
        _super.prototype.yield.call(this);
    };
    RepliqClient.prototype.getServerNr = function () {
        return this.serverNr;
    };
    return RepliqClient;
})(RepliqManager_1.RepliqManager);
exports.RepliqClient = RepliqClient;
//# sourceMappingURL=RepliqClient.js.map