/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../src/index" />
///<reference path="../src/shared/Repliq.ts"/>
var Repliq_1 = require("../src/shared/Repliq");
"use strict";
var index_1 = require("../src/index");
var http = require("http");
var ioClient = require("socket.io-client");
var ioServer = require("socket.io");
var should = require("should");
describe("Repliq", function () {
    var host = "http://localhost:3000";
    var port = 3000;
    describe("Server", function () {
        //var server: Server;
        function ioConnector(server, done) {
            var c = ioClient(host, { forceNew: true });
            c.on('connect', function () { server.stop(); c.close(); done(); });
        }
        describe("#constructor(url: string)", function () {
            it("should start an io and http server", function (done) {
                var server = new index_1.RepliqServer(3000);
                ioConnector(server, done);
            });
        });
        describe("#constructor(httpServer: http.Server)", function () {
            it("start an io server on given http server", function (done) {
                var app = http.createServer();
                var serv = new index_1.RepliqServer(app);
                ioConnector(serv, done);
                app.listen(3000);
            });
        });
    });
    describe("RepliqManager", function () {
        var server;
        var api = {
            noargs: function () { },
            witharg: function (x) { },
            withreturn: function () { return 2; },
            withargreturn: function (x) { return x * 2; },
            identity: function (x) { return x; }
        };
        describe("#constructor(url: string)", function () {
            it("should start an io client and connect to given host", function (done) {
                var s = ioServer(3000);
                var client = new index_1.RepliqClient(host);
                s.on("connection", function () { s.close(); client.stop(); done(); });
            });
        });
        describe("#send(selector: string, args: Object[])", function () {
            describe("no arguments, no return", function () {
                it("should resolve the promise", function (done) {
                    var server = new index_1.RepliqServer(port);
                    server.export(api);
                    var client = new index_1.RepliqClient(host);
                    client.send("noargs").then(function (result) { server.stop(); client.stop(); done(); });
                });
            });
            describe("no arguments, return value", function () {
                it("should resolve the promise with the return value", function (done) {
                    var server = new index_1.RepliqServer(port);
                    server.export(api);
                    var client = new index_1.RepliqClient(host);
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
                    var server = new index_1.RepliqServer(port);
                    server.export(api);
                    var client = new index_1.RepliqClient(host);
                    client.send("witharg", 2).then(function (result) { server.stop(); client.stop(); done(); });
                });
            });
            describe("arguments, return", function () {
                it("should resolve the promise", function (done) {
                    var server = new index_1.RepliqServer(port);
                    server.export(api);
                    var client = new index_1.RepliqClient(host);
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
        var server;
        var client;
        before(function () {
            server = new index_1.RepliqServer(port);
            client = new index_1.RepliqClient(host);
            server.export({ identity: function (x) { return x; } });
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
    describe("Repliq Serialization", function () {
        describe("sending it to the server", function () {
            it("should get it as a Repliq object with given props", function (done) {
                var FooRepliq = index_1.define({ foo: "bar", setFoo: function (val) { this.foo = val; } });
                var server = new index_1.RepliqServer(port);
                var client = new index_1.RepliqClient(host);
                server.declare(FooRepliq);
                client.declare(FooRepliq);
                server.export({ fun: function (x) {
                        should(x).be.an.instanceof(Repliq_1.Repliq);
                        should(x.get("foo")).equal("foo");
                        server.stop();
                        client.stop();
                        done();
                    } });
                var r = client.create(FooRepliq, { foo: "foo" });
                client.send("fun", r);
            });
        });
        describe("sending it to the server and back", function () {
            it("should get it as a Repliq object", function (done) {
                var FooRepliq = index_1.define({ foo: "bar", setFoo: function (val) { this.foo = val; } });
                var server = new index_1.RepliqServer(port);
                var client = new index_1.RepliqClient(host);
                server.declare(FooRepliq);
                client.declare(FooRepliq);
                server.export({ identity: function (x) {
                        return x;
                    } });
                var r = client.create(FooRepliq, { foo: "foo" });
                client.send("identity", r).then(function (r1) {
                    should.equal(r, r1);
                    server.stop();
                    client.stop();
                    done();
                });
            });
        });
    });
});
//# sourceMappingURL=integration.js.map