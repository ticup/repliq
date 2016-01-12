"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var index_1 = require("../src/shared/index");
var index_2 = require("../src/index");
var http = require("http");
var ioClient = require("socket.io-client");
var ioServer = require("socket.io");
var should = require("should");
function stop() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    args.forEach(function (arg) { return arg.stop(); });
}
var YIELD_DELAY = 400;
function delay(f) {
    setTimeout(f, YIELD_DELAY);
}
describe("Repliq", function () {
    var host = "http://localhost:3000";
    var port = 3000;
    describe("Server", function () {
        function ioConnector(server, done) {
            var c = ioClient(host, { forceNew: true });
            c.on('connect', function () { server.stop(); c.close(); done(); });
        }
        describe("#constructor(url: string)", function () {
            it("should start an io and http server", function (done) {
                var server = new index_2.RepliqServer(3000);
                ioConnector(server, done);
            });
        });
        describe("#constructor(httpServer: http.Server)", function () {
            it("start an io server on given http server", function (done) {
                var app = http.createServer();
                var serv = new index_2.RepliqServer(app);
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
                var s = ioServer(port);
                var client = new index_2.RepliqClient(host);
                s.on("connection", function () { s.close(); client.stop(); done(); });
            });
        });
        describe("#send(selector: string, args: Object[])", function () {
            describe("no arguments, no return", function () {
                it("should resolve the promise", function (done) {
                    var server = new index_2.RepliqServer(port);
                    server.export(api);
                    var client = new index_2.RepliqClient(host);
                    client.send("noargs").then(function (result) { server.stop(); client.stop(); done(); });
                });
            });
            describe("no arguments, return value", function () {
                it("should resolve the promise with the return value", function (done) {
                    var server = new index_2.RepliqServer(port);
                    server.export(api);
                    var client = new index_2.RepliqClient(host);
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
                    var server = new index_2.RepliqServer(port);
                    server.export(api);
                    var client = new index_2.RepliqClient(host);
                    client.send("witharg", 2).then(function (result) { server.stop(); client.stop(); done(); });
                });
            });
            describe("arguments, return", function () {
                it("should resolve the promise", function (done) {
                    var server = new index_2.RepliqServer(port);
                    server.export(api);
                    var client = new index_2.RepliqClient(host);
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
            server = new index_2.RepliqServer(port);
            client = new index_2.RepliqClient(host);
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
            var arr = index_1.List([1, 2, 3]);
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
                var FooRepliq = (function (_super) {
                    __extends(FooRepliq, _super);
                    function FooRepliq() {
                        _super.apply(this, arguments);
                        this.foo = "bar";
                    }
                    FooRepliq.prototype.setFoo = function (val) {
                        this.set("foo", val);
                        return val;
                    };
                    return FooRepliq;
                })(index_1.Repliq);
                var server = new index_2.RepliqServer(port, { FooRepliq: FooRepliq });
                var client = new index_2.RepliqClient(host, { FooRepliq: FooRepliq });
                server.export({ fun: function (x) {
                        should(x).be.an.instanceof(index_1.Repliq);
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
                var FooRepliq = (function (_super) {
                    __extends(FooRepliq, _super);
                    function FooRepliq() {
                        _super.apply(this, arguments);
                        this.foo = "bar";
                    }
                    FooRepliq.prototype.setFoo = function (val) {
                        this.set("foo", val);
                        return val;
                    };
                    return FooRepliq;
                })(index_1.Repliq);
                var server = new index_2.RepliqServer(port);
                var client = new index_2.RepliqClient(host);
                server.declare(FooRepliq);
                client.declare(FooRepliq);
                client.onConnect().then(function () {
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
    describe("Synchronization", function () {
        describe("yielding on client with object creation", function () {
            it("should create the object on the server", function (done) {
                var FooRepliq = (function (_super) {
                    __extends(FooRepliq, _super);
                    function FooRepliq() {
                        _super.apply(this, arguments);
                        this.foo = "bar";
                    }
                    FooRepliq.prototype.setFoo = function (val) {
                        this.set("foo", val);
                        return val;
                    };
                    return FooRepliq;
                })(index_1.Repliq);
                var server = new index_2.RepliqServer(port, { FooRepliq: FooRepliq });
                var client = new index_2.RepliqClient(host, { FooRepliq: FooRepliq });
                server.export({ identity: function (x) {
                        return x;
                    } });
                client.onConnect().then(function () {
                    var r = client.create(FooRepliq, { foo: "foo" });
                    client.yield();
                    setTimeout(function () {
                        server.yield();
                        var r2 = server.getRepliq(r.getId());
                        should.exist(r2);
                        should.equal(r2.get("foo"), "foo");
                        stop(client, server);
                        done();
                    }, YIELD_DELAY);
                });
            });
        });
        describe("yielding on client with object creation and call", function () {
            it("should create the object on the server", function (done) {
                var FooRepliq = (function (_super) {
                    __extends(FooRepliq, _super);
                    function FooRepliq() {
                        _super.apply(this, arguments);
                        this.foo = "bar";
                    }
                    FooRepliq.prototype.setFoo = function (val) {
                        this.set("foo", val);
                        return val;
                    };
                    __decorate([
                        index_1.sync
                    ], FooRepliq.prototype, "setFoo", null);
                    return FooRepliq;
                })(index_1.Repliq);
                ;
                var server = new index_2.RepliqServer(port);
                var client = new index_2.RepliqClient(host);
                server.declare(FooRepliq);
                client.declare(FooRepliq);
                server.export({ identity: function (x) {
                        return x;
                    } });
                var r = client.create(FooRepliq, { foo: "foo" });
                r.setFoo("rab");
                client.yield();
                setTimeout(function () {
                    server.yield();
                    var r2 = server.getRepliq(r.getId());
                    should.exist(r2);
                    should.equal(r2.get("foo"), "rab");
                    stop(server, client);
                    done();
                }, YIELD_DELAY);
            });
        });
        describe("creating a new repliq and introduce a reference for another client", function () {
            it("should create the object on the client", function (done) {
                var FooRepliq = (function (_super) {
                    __extends(FooRepliq, _super);
                    function FooRepliq() {
                        _super.apply(this, arguments);
                        this.foo = "bar";
                    }
                    FooRepliq.prototype.setFoo = function (val) {
                        this.set("foo", val);
                        return val;
                    };
                    __decorate([
                        index_1.sync
                    ], FooRepliq.prototype, "setFoo", null);
                    return FooRepliq;
                })(index_1.Repliq);
                var server = new index_2.RepliqServer(port, { FooRepliq: FooRepliq });
                var client = new index_2.RepliqClient(host, { FooRepliq: FooRepliq });
                var client2 = new index_2.RepliqClient(host, { FooRepliq: FooRepliq });
                var s = server.create(FooRepliq, {});
                server.export({ getRepliq: function () {
                        return s;
                    } });
                client.send("getRepliq").then(function (r) {
                    client2.send("getRepliq").then(function (r2) {
                        var c = client.create(FooRepliq, {});
                        r.setFoo(c);
                        client.yield();
                        delay(function () {
                            var c3 = server.getRepliq(c.getId());
                            should.exist(c3);
                            should.exist(s.get("foo"));
                            should(s.get("foo").getId()).equal(c3.getId());
                            delay(function () {
                                console.log("yielding client 2");
                                client2.yield();
                                var val = r2.get("foo");
                                should.exist(val);
                                should.equal(val.getId(), c.getId());
                                stop(server, client, client2);
                                done();
                            });
                        });
                    });
                });
            });
        });
        describe("creating a new repliq on server and introduce a reference for a client", function () {
            it("should not create the object on another client", function (done) {
                var FooRepliq = (function (_super) {
                    __extends(FooRepliq, _super);
                    function FooRepliq() {
                        _super.apply(this, arguments);
                        this.foo = "bar";
                    }
                    FooRepliq.prototype.setFoo = function (val) {
                        this.set("foo", val);
                        return val;
                    };
                    __decorate([
                        index_1.sync
                    ], FooRepliq.prototype, "setFoo", null);
                    return FooRepliq;
                })(index_1.Repliq);
                var server = new index_2.RepliqServer(port, { FooRepliq: FooRepliq });
                var client = new index_2.RepliqClient(host, { FooRepliq: FooRepliq });
                var client2 = new index_2.RepliqClient(host, { FooRepliq: FooRepliq });
                delay(function () {
                    var s = server.create(FooRepliq, { foo: "foo" });
                    server.export({
                        getRepliq: function () {
                            return s;
                        }
                    });
                    client.send("getRepliq").then(function (r) {
                        should.equal(r.getId(), s.getId());
                        should.exist(r.get("foo"));
                        should.equal(r.get("foo"), "foo");
                        var s2 = server.create(FooRepliq, { foo: "foo" });
                        s.setFoo(s2);
                        server.yield();
                        delay(function () {
                            client.incoming.length.should.equal(1);
                            client.incoming[0].operations.length.should.equal(2);
                            client.yield();
                            client.incoming.length.should.equal(0);
                            should.equal(r.get("foo").getId(), s2.getId());
                            client2.incoming.length.should.equal(1);
                            client2.incoming[0].operations.length.should.equal(0);
                            client2.yield();
                            stop(server, client, client2);
                            done();
                        });
                    });
                });
            });
        });
        describe("repliq.on('changeExternal', fun) on client", function () {
            it("should call the function when the Repliq is altered by an external source", function (done) {
                var FooRepliq = (function (_super) {
                    __extends(FooRepliq, _super);
                    function FooRepliq() {
                        _super.apply(this, arguments);
                        this.foo = "bar";
                    }
                    FooRepliq.prototype.setFoo = function (val) {
                        this.set("foo", val);
                        return val;
                    };
                    __decorate([
                        index_1.sync
                    ], FooRepliq.prototype, "setFoo", null);
                    return FooRepliq;
                })(index_1.Repliq);
                ;
                var server = new index_2.RepliqServer(port);
                var client = new index_2.RepliqClient(host);
                server.declare(FooRepliq);
                client.declare(FooRepliq);
                var s = server.create(FooRepliq, {});
                server.export({ getRepliq: function () {
                        return s;
                    } });
                client.send("getRepliq").then(function (r) {
                    should.exist(r);
                    s.setFoo("bar");
                    server.yield();
                    delay(function () {
                        r.on(index_1.Repliq.CHANGE_EXTERNAL, function () {
                            stop(server, client);
                            done();
                        });
                        client.yield();
                    });
                });
            });
        });
        describe("repliq.on('changeExternal', fun) on server", function () {
            it("should call the function when the Repliq is altered by an external source", function (done) {
                var FooRepliq = (function (_super) {
                    __extends(FooRepliq, _super);
                    function FooRepliq() {
                        _super.apply(this, arguments);
                        this.foo = "bar";
                    }
                    FooRepliq.prototype.setFoo = function (val) {
                        this.set("foo", val);
                        return val;
                    };
                    __decorate([
                        index_1.sync
                    ], FooRepliq.prototype, "setFoo", null);
                    return FooRepliq;
                })(index_1.Repliq);
                var server = new index_2.RepliqServer(port);
                var client = new index_2.RepliqClient(host);
                server.declare(FooRepliq);
                client.declare(FooRepliq);
                var s = server.create(FooRepliq, {});
                server.export({ getRepliq: function () {
                        return s;
                    } });
                s.on(index_1.Repliq.CHANGE_EXTERNAL, function () {
                    stop(server, client);
                    done();
                });
                client.send("getRepliq").then(function (r) {
                    should.exist(r);
                    r.setFoo("bar");
                    client.yield();
                });
            });
        });
    });
});
//# sourceMappingURL=integration.js.map