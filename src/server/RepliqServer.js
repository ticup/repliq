/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="../shared/references.d.ts" />
var Debug = require("debug");
var io = require("socket.io");
var com = require("../shared/Communication");
var Repliq_1 = require("../shared/Repliq");
var Listeners_1 = require("./Listeners");
var debug = Debug("Repliq:com:server");
var guid_1 = require("../shared/guid");
var RepliqServer = (function () {
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
        this.repliqs = {};
        this.id = guid_1.guid();
    }
    RepliqServer.prototype.handleRpc = function (selector, sargs, reply) {
        debug("received rpc " + selector + "(" + sargs + ")");
        if (!this.api) {
            return reply("No exported API");
        }
        var handler = this.api[selector];
        if (!handler) {
            return reply("No compatible function for " + selector);
        }
        var args = sargs.map(com.deserialize);
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
    RepliqServer.prototype.create = function (template, args) {
        var repl = new Repliq_1.Repliq(template, args, this.id);
        this.repliqs[repl.getId()] = repl;
        return replw;
    };
    return RepliqServer;
})();
exports.RepliqServer = RepliqServer;
//# sourceMappingURL=RepliqServer.js.map