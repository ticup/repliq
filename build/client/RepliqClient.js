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
var Operation_1 = require("../shared/Operation");
var debug = Debug("Repliq:com:client");
var RepliqClient = (function (_super) {
    __extends(RepliqClient, _super);
    function RepliqClient(host, schema) {
        this.channel = io(host, { forceNew: true });
        this.incoming = [];
        this.setupYieldPush();
        _super.call(this, schema);
    }
    RepliqClient.prototype.setupYieldPush = function () {
        var _this = this;
        this.channel.on("YieldPush", function (round) { return _this.handleYieldPull(round); });
    };
    RepliqClient.prototype.handleYieldPull = function (json) {
        debug("YieldPull: received round");
        var round = Round_1.Round.fromJSON(json, this);
        this.incoming.push(round);
    };
    RepliqClient.prototype.onConnect = function () {
        var _this = this;
        if (typeof this.onConnectP === "undefined") {
            this.onConnectP = new Promise(function (resolve) {
                _this.channel.on("connect", function () {
                    debug("client connected");
                    resolve(true);
                });
            });
        }
        return this.onConnectP;
    };
    RepliqClient.prototype.send = function (selector) {
        var _this = this;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
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
    };
    RepliqClient.prototype.stop = function () {
        this.channel.close();
    };
    RepliqClient.prototype.create = function (template, args) {
        var r = _super.prototype.create.call(this, template, args);
        this.current.add(new Operation_1.Operation(undefined, "CreateRepliq", [template, r.getId()].concat(args)));
        return r;
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
            this.forEachData(function (_, r) {
                return r.setToCommit();
            });
            var affectedExt = this.replay(this.incoming);
            this.incoming.forEach(function (round) {
                if (round.getOriginId() == _this.getId()) {
                    _this.pending = _this.pending.slice(1);
                }
            });
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