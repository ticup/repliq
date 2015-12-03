/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../src/index" />
"use strict";
import {RepliqServer as Server,
        RepliqClient as Client, define}  from "../src/index";
import * as http from "http";
import * as ioClient  from "socket.io-client";
import * as ioServer from "socket.io";
import * as should from "should";

describe("Repliq", () => {

    let host = "http://localhost:3000";
    let port = 3000;

    describe("Server", () => {

        //var server: Server;

        //afterEach(()=> {server.stop()});

        function ioConnector(server: Server, done: Function) {
            let c = ioClient(host, {forceNew: true});
            c.on('connect', () => { server.stop(); c.close(); done()});
        }

        describe("#constructor(url: string)", () => {
            it("should start an io and http server", (done) => {
                let server = new Server(3000);
                ioConnector(server, done);
            });
        });

        describe("#constructor(httpServer: http.Server)", () => {
            it("start an io server on given http server", (done) => {
                let app = http.createServer();
                let serv = new Server(app);
                ioConnector(serv, done);
                app.listen(3000);
            });
        });

    });

    describe("Client", () => {

        let server: Server;

        let api = {
            noargs: function () { },
            witharg: function (x) { },
            withreturn: function () { return 2 },
            withargreturn: function (x) { return  x * 2 },
            identity: function (x) { return x }
        };

        describe("#constructor(url: string)", () => {
            it("should start an io client and connect to given host", (done) => {
                let s = ioServer(3000);
                var client = new Client(host);
                s.on("connection", () => { s.close(); client.stop(); done(); });
            });
        });

        describe("#send(selector: string, args: Object[])", () => {
            describe("no arguments, no return", () => {
                it("should resolve the promise", (done) => {
                    let server = new Server(port);
                    server.export(api);
                    var client = new Client(host);
                    client.send("noargs").then((result) => { server.stop(); client.stop(); done()});
                });
            });

            describe("no arguments, return value", () => {
                it("should resolve the promise with the return value", (done) => {
                    let server = new Server(port);
                    server.export(api);
                    var client = new Client(host);
                    client.send("withreturn").then((result) => {
                        should.equal(result, 2);
                        server.stop(); client.stop();
                        done();
                    });
                });
            });

            describe("arguments, no return", () => {
                it("should resolve the promise", (done) => {
                    let server = new Server(port);
                    server.export(api);
                    var client = new Client(host);
                    client.send("witharg", 2).then((result) => { server.stop(); client.stop(); done()});
                });
            });

            describe("arguments, return", () => {
                it("should resolve the promise", (done) => {
                    let server = new Server(port);
                    server.export(api);
                    var client = new Client(host);
                    client.send("withargreturn", 2).then((result) => {
                        should.equal(result, 4);
                        server.stop(); client.stop();
                        done();
                    });
                });
            });
        });
    });

    describe("Argument Serialization", () => {
        let server : Server;
        let client : Client;

        before(() => {
            server = new Server(port);
            client = new Client(host);
            server.export({ identity: function (x) { return x } });
        });

        after(() => {
            server.stop();
            client.stop();
        });

        function sendToServerAndBack(arg, fn) {
            it("should be (de)serialized", (done) => {
                client.send("identity", arg).then((res) => {
                    fn(res);
                    done();
                });
            });
        }

        describe("number", () => {
            sendToServerAndBack(2, (res) => {
                should.equal(res, 2);
            });
        });

        describe("string", () => {
            sendToServerAndBack("foo", (res) => {
                should.equal(res, "foo");
            });
        });

        describe("array", () => {
            let arr = [1,2,3];
            sendToServerAndBack(arr, (res) => {
               should.deepEqual(arr, res);
            });
        });

        describe("object", () => {
            let obj = {
                foo: 1,
                bar: "2"
            };
            sendToServerAndBack(obj, (res) => {
                should.deepEqual(res, obj);
            });
        });
    });

    describe("Repliq Serlialization", () => {
        describe("base case", () => {
            it("should", (done) => {
                let FooRepliq = define({ foo: "bar", setFoo(val) { this.foo = val }});
                let server = new Server(port);
                let client = new Client(host);

                server.declare(FooRepliq);
                client.declare(FooRepliq);

                server.export({ identity: function (x) {
                    return x;
                }});
                let r = client.create(FooRepliq, { foo: "foo" });
                client.send("identity", r).then((r) => {
                    server.stop();
                    client.stop();
                    done();
                });
            });
        });
    });
});
