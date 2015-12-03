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
var Client_1 = require("../shared/Client");
var Listeners_1 = require("./Listeners");
var debug = Debug("Repliq:com:server");
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
        var args = sargs.map(function (a) { return com.deserialize(a, _this); });
        var result = handler.apply(this.api, args);
        debug("result for rpc: " + result);
        reply(null, com.serialize(result));
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
})(Client_1.Client);
exports.RepliqServer = RepliqServer;
//# sourceMappingURL=RepliqServer.js.map