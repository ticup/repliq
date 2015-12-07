/// <reference path="../shared/references.d.ts" />
/// <reference path="../../typings/tsd.d.ts" />
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
var debug = Debug("Repliq:com:client");
var RepliqClient = (function (_super) {
    __extends(RepliqClient, _super);
    function RepliqClient(host) {
        this.channel = io(host, { forceNew: true });
        _super.call(this);
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
            debug("sending rpc " + selector + "(" + args + ")");
            var rpc = { selector: selector, args: args.map(com.serialize) };
            _this.channel.emit("rpc", rpc, function (error, result) {
                var ser = result;
                debug("received rpc result for " + selector + "(" + args + ") : " + result);
                if (error)
                    return reject(error);
                resolve(com.deserialize(ser, _this));
            });
        });
    };
    RepliqClient.prototype.stop = function () {
        this.channel.close();
    };
    return RepliqClient;
})(RepliqManager_1.RepliqManager);
exports.RepliqClient = RepliqClient;
//# sourceMappingURL=RepliqClient.js.map