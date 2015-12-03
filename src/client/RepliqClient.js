/// <reference path="../shared/references.d.ts" />
/// <reference path="../../typings/tsd.d.ts" />
var Debug = require("debug");
var io = require('socket.io-client');
var com = require("../shared/Communication");
var Promise = require("bluebird");
var Repliq_1 = require("../shared/Repliq");
var guid_1 = require("../shared/guid");
var debug = Debug("Repliq:com:client");
var RepliqClient = (function () {
    function RepliqClient(host) {
        this.channel = io(host, { forceNew: true });
        this.repliqs = {};
        this.id = guid_1.guid();
    }
    RepliqClient.prototype.onConnect = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.channel.on("connect", function () {
                debug("client connected");
                resolve(true);
            });
        });
    };
    RepliqClient.prototype.send = function (selector) {
        var _this = this;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return new Promise(function (resolve, reject) {
            var rpc = { selector: selector, args: args.map(com.serialize) };
            debug("sending rpc " + selector + "(" + args + ")");
            _this.channel.emit("rpc", rpc, function (error, result) {
                var ser = result;
                debug("received rpc result for " + selector + "(" + args + ") : " + result);
                if (error)
                    return reject(error);
                resolve(com.deserialize(ser));
            });
        });
    };
    RepliqClient.prototype.stop = function () {
        this.channel.close();
    };
    RepliqClient.prototype.create = function (template, args) {
        var repl = new Repliq_1.Repliq(template, args, this.id);
        this.repliqs[repl.getId()] = repl;
        return replw;
    };
    return RepliqClient;
})();
exports.RepliqClient = RepliqClient;
//# sourceMappingURL=RepliqClient.js.map