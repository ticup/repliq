"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })(); /// <reference path="../../typings/tsd.d.ts" />
/// <reference path="../shared/Communication.ts" />

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.RepliqServer = undefined;

var _debug = require("debug");

var Debug = _interopRequireWildcard(_debug);

var _socket = require("socket.io");

var io = _interopRequireWildcard(_socket);

var _Communication = require("./Communication");

var com = _interopRequireWildcard(_Communication);

var _Listeners = require("./Listeners");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var debug = Debug("Repliq:com:server");

var RepliqServer = exports.RepliqServer = (function () {
    function RepliqServer(app) {
        var _this = this;

        _classCallCheck(this, RepliqServer);

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
        this.listeners = new _Listeners.Listeners();
    }

    _createClass(RepliqServer, [{
        key: "handleRpc",
        value: function handleRpc(selector, sargs, reply) {
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
        }
    }, {
        key: "onConnect",
        value: function onConnect() {
            return new Promise(function (resolve) {});
        }
    }, {
        key: "stop",
        value: function stop() {
            this.channel.close();
        }
    }, {
        key: "export",
        value: function _export(api) {
            if (this.api) {
                throw new Error("Cannot export multiple objects");
            }
            this.api = api;
        }
    }]);

    return RepliqServer;
})();
//# sourceMappingURL=RepliqServer.js.map

//# sourceMappingURL=RepliqServer-compiled.js.map