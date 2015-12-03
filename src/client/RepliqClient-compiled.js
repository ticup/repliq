"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })(); /// <reference path="../../typings/tsd.d.ts" />
/// <reference path="../shared/Communication" />
/// <reference path="../shared/Repliq" />

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.RepliqClient = undefined;

var _debug = require("debug");

var Debug = _interopRequireWildcard(_debug);

var _socket = require("socket.io-client");

var io = _interopRequireWildcard(_socket);

var _Communication = require("./Communication");

var com = _interopRequireWildcard(_Communication);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var debug = Debug("Repliq:com:client");

var RepliqClient = exports.RepliqClient = (function () {
    function RepliqClient(host) {
        _classCallCheck(this, RepliqClient);

        this.channel = io(host, { forceNew: true });
    }

    _createClass(RepliqClient, [{
        key: "onConnect",
        value: function onConnect() {
            var _this = this;

            return new Promise(function (resolve) {
                _this.channel.on("connect", function () {
                    debug("client connected");
                    resolve(true);
                });
            });
        }
    }, {
        key: "send",
        value: function send(selector) {
            var _this2 = this;

            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            return new Promise(function (resolve, reject) {
                var rpc = { selector: selector, args: args };
                debug("sending rpc " + selector + "(" + args + ")");
                _this2.channel.emit("rpc", rpc, function (error, result) {
                    var ser = result;
                    debug("received rpc result for " + selector + "(" + args + ") : " + result);
                    if (error) return reject(error);
                    resolve(com.deserialize(ser));
                });
            });
        }
    }, {
        key: "stop",
        value: function stop() {
            this.channel.close();
        }
    }]);

    return RepliqClient;
})();
//# sourceMappingURL=RepliqClient.js.map

//# sourceMappingURL=RepliqClient-compiled.js.map