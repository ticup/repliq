/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../src/index" />
"use strict";

var _index = require("../src/index");

var _http = require("http");

var http = _interopRequireWildcard(_http);

var _socket = require("socket.io-client");

var ioClient = _interopRequireWildcard(_socket);

var _socket2 = require("socket.io");

var ioServer = _interopRequireWildcard(_socket2);

var _should = require("should");

var should = _interopRequireWildcard(_should);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

describe("Repliq", function () {
    var host = "http://localhost:3000";
    var port = 3000;
    describe("Server", function () {
        //var server: Server;
        function ioConnector(server, done) {
            var c = ioClient(host, { forceNew: true });
            c.on('connect', function () {
                server.stop();c.close();done();
            });
        }
        describe("#constructor(url: string)", function () {
            it("should start an io and http server", function (done) {
                var server = new _index.RepliqServer(3000);
                ioConnector(server, done);
            });
        });
        describe("#constructor(httpServer: http.Server)", function () {
            it("start an io server on given http server", function (done) {
                var app = http.createServer();
                var serv = new _index.RepliqServer(app);
                ioConnector(serv, done);
                app.listen(3000);
            });
        });
    });
    describe("RepliqManager", function () {
        var server = undefined;
        var api = {
            noargs: function noargs() {},
            witharg: function witharg(x) {},
            withreturn: function withreturn() {
                return 2;
            },
            withargreturn: function withargreturn(x) {
                return x * 2;
            },
            identity: function identity(x) {
                return x;
            }
        };
        describe("#constructor(url: string)", function () {
            it("should start an io client and connect to given host", function (done) {
                var s = ioServer(3000);
                var client = new _index.RepliqClient(host);
                s.on("connection", function () {
                    s.close();client.stop();done();
                });
            });
        });
        describe("#send(selector: string, args: Object[])", function () {
            describe("no arguments, no return", function () {
                it("should resolve the promise", function (done) {
                    var server = new _index.RepliqServer(port);
                    server.export(api);
                    var client = new _index.RepliqClient(host);
                    client.send("noargs").then(function (result) {
                        server.stop();client.stop();done();
                    });
                });
            });
            describe("no arguments, return value", function () {
                it("should resolve the promise with the return value", function (done) {
                    var server = new _index.RepliqServer(port);
                    server.export(api);
                    var client = new _index.RepliqClient(host);
                    client.send("withreturn").then(function (result) {
                        should.equal(result, 2);
                        server.stop();
                        client.stop();
                        done();
                    });
                });
            });
            describe("arguments, no return", function () {
                it("should resolve the promise", function (done) {
                    var server = new _index.RepliqServer(port);
                    server.export(api);
                    var client = new _index.RepliqClient(host);
                    client.send("witharg", 2).then(function (result) {
                        server.stop();client.stop();done();
                    });
                });
            });
            describe("arguments, return", function () {
                it("should resolve the promise", function (done) {
                    var server = new _index.RepliqServer(port);
                    server.export(api);
                    var client = new _index.RepliqClient(host);
                    client.send("withargreturn", 2).then(function (result) {
                        should.equal(result, 4);
                        server.stop();
                        client.stop();
                        done();
                    });
                });
            });
        });
    });
    describe("Argument Serialization", function () {
        var server = undefined;
        var client = undefined;
        before(function () {
            server = new _index.RepliqServer(port);
            client = new _index.RepliqClient(host);
            server.export({ identity: function identity(x) {
                    return x;
                } });
        });
        after(function () {
            server.stop();
            client.stop();
        });
        function sendToServerAndBack(arg, fn) {
            it("should be (de)serialized", function (done) {
                client.send("identity", arg).then(function (res) {
                    fn(res);
                    done();
                });
            });
        }
        describe("number", function () {
            sendToServerAndBack(2, function (res) {
                should.equal(res, 2);
            });
        });
        describe("string", function () {
            sendToServerAndBack("foo", function (res) {
                should.equal(res, "foo");
            });
        });
        describe("array", function () {
            var arr = [1, 2, 3];
            sendToServerAndBack(arr, function (res) {
                should.deepEqual(arr, res);
            });
        });
        describe("object", function () {
            var obj = {
                foo: 1,
                bar: "2"
            };
            sendToServerAndBack(obj, function (res) {
                should.deepEqual(res, obj);
            });
        });
    });
});
//# sourceMappingURL=integration.js.map

//# sourceMappingURL=integration-compiled.js.map