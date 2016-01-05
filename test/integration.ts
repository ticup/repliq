/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../src/index" />
///<reference path="../src/shared/Repliq.ts"/>
"use strict";
import {Repliq, List, sync} from "../src/shared/index";
import {RepliqServer as Server,
        RepliqClient as Client}  from "../src/index";
import * as http from "http";
import * as ioClient  from "socket.io-client";
import * as ioServer from "socket.io";
import * as should from "should";


function stop(...args) {
    args.forEach((arg) => arg.stop());
}

let YIELD_DELAY = 400;

function delay(f) {
    setTimeout(f, YIELD_DELAY);
}

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

    describe("RepliqManager", () => {

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
            let arr = List([1,2,3]);
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

    describe("Repliq Serialization", () => {
        describe("sending it to the server", () => {
            it("should get it as a Repliq object with given props", (done) => {
                class FooRepliq extends Repliq{
                    public foo = "bar";
                    setFoo(val) {
                        this.set("foo", val);
                        return val;
                    }};
                let server = new Server(port);
                let client = new Client(host);

                server.declare(FooRepliq);
                client.declare(FooRepliq);

                server.export({ fun: function (x) {
                    should(x).be.an.instanceof(Repliq);
                    should(x.get("foo")).equal("foo");
                    server.stop();
                    client.stop();
                    done();

                }});
                let r = client.create(FooRepliq, { foo: "foo" });
                client.send("fun", r)
            });
        });
        describe("sending it to the server and back", () => {
            it("should get it as a Repliq object", (done) => {
                class FooRepliq extends Repliq{
                    public foo = "bar";
                    setFoo(val) {
                        this.set("foo", val);
                        return val;
                    }};
                let server = new Server(port);
                let client = new Client(host);

                server.declare(FooRepliq);
                client.declare(FooRepliq);

                server.export({ identity: function (x) {
                    return x;
                }});
                let r = client.create(FooRepliq, { foo: "foo" });
                client.send("identity", r).then((r1) => {
                    should.equal(r, r1);
                    server.stop();
                    client.stop();
                    done();
                });
            });
        });
    });

    describe("Synchronization", () => {
        describe("yielding on client with object creation", () => {
            it("should create the object on the server", (done) => {
                class FooRepliq extends Repliq{
                    public foo = "bar";
                    setFoo(val) {
                        this.set("foo", val);
                        return val;
                    }};
                let server = new Server(port);
                let client = new Client(host);

                server.declare(FooRepliq);
                client.declare(FooRepliq);

                server.export({ identity: function (x) {
                    return x;
                }});
                let r = client.create(FooRepliq, { foo: "foo" });
                client.yield();
                setTimeout(() => {
                    server.yield();
                    let r2 = server.getRepliq(r.getId());
                    should.exist(r2);
                    should.equal(r2.get("foo"), "foo");
                    stop(client, server); done();
                }, YIELD_DELAY);
            });
        });

        describe("yielding on client with object creation and call", () => {
            it("should create the object on the server", (done) => {
                class FooRepliq extends Repliq{
                    public foo = "bar";
                    @sync
                    setFoo(val) {
                        this.set("foo", val);
                        return val;
                    }};
                let server = new Server(port);
                let client = new Client(host);

                server.declare(FooRepliq);
                client.declare(FooRepliq);

                server.export({ identity: function (x) {
                    return x;
                }});
                let r = <FooRepliq>client.create(FooRepliq, { foo: "foo" });
                r.setFoo("rab");
                client.yield();
                setTimeout(() => {
                    server.yield();
                    let r2 = server.getRepliq(r.getId());
                    should.exist(r2);
                    should.equal(r2.get("foo"), "rab");
                    stop(server, client); done();
                }, YIELD_DELAY);
            });
        });

        describe("creating a new repliq and introduce a reference for another client", () => {
            it("should create the object on the client", (done) => {
                class FooRepliq extends Repliq{
                    public foo = "bar";
                    @sync
                    setFoo(val) {
                        this.set("foo", val);
                        return val;
                    }};
                let server = new Server(port);
                let client = new Client(host);
                let client2 = new Client(host);

                server.declare(FooRepliq);
                client.declare(FooRepliq);
                client2.declare(FooRepliq);

                let s = server.create(FooRepliq, {  });
                server.export({ getRepliq: function () {
                    return s;
                }});

                server.yield();
                //let r = client.create(FooRepliq, { foo: "foo" });
                client.send("getRepliq").then((r: FooRepliq) => {
                    client2.send("getRepliq").then((r2: FooRepliq) => {
                        let c = <FooRepliq>client.create(FooRepliq, {});
                        r.setFoo(c);
                        client.yield();

                        delay(() => {
                            server.yield();
                            let c3 = server.getRepliq(c.getId());
                            should.exist(c3);
                            //should(s.get("foo")).be.an.instanceof(Repliq);
                            should(s.get("foo").getId()).equal(c3.getId());
                            stop(server, client); done();

                            delay(()=>{
                                console.log("yielding client 2");
                                client2.yield();
                                let val = r2.get("foo");
                                should.exist(val);
                                //should(val).be.an.instanceof(Repliq);
                                should.equal(val.getId(), c.getId());
                                stop(server, client, client2); done();
                            });
                        });
                    });
                });

            });
        });


        describe("repliq.on('changedExternal', fun) on client", () => {
            it("should call the function when the Repliq is altered by an external source", (done) => {
                class FooRepliq extends Repliq{
                    public foo = "bar";
                    @sync
                    setFoo(val) {
                        this.set("foo", val);
                        return val;
                    }};
                let server = new Server(port);
                let client = new Client(host);

                server.declare(FooRepliq);
                client.declare(FooRepliq);

                let s = <FooRepliq>server.create(FooRepliq, {  });
                server.export({ getRepliq: function () {
                    return s;
                }});

                //server.yield();
                //let r = client.create(FooRepliq, { foo: "foo" });
                client.send("getRepliq").then((r: FooRepliq) => {
                    should.exist(r);

                    s.setFoo("bar");
                    server.yield();
                    delay(() => {
                        r.on("changedExternal", () => {
                            stop(server, client);
                            done();
                        });
                        client.yield();
                    });
                });
            });
        })

        describe("repliq.on('changedExternal', fun) on server", () => {
            it("should call the function when the Repliq is altered by an external source", (done) => {
                class FooRepliq extends Repliq{
                    public foo = "bar";
                    @sync
                    setFoo(val) {
                        this.set("foo", val);
                        return val;
                    }};
                let server = new Server(port);
                let client = new Client(host);

                server.declare(FooRepliq);
                client.declare(FooRepliq);

                let s = <FooRepliq>server.create(FooRepliq, {  });
                server.export({ getRepliq: function () {
                    return s;
                }});

                s.on("changedExternal", () => {
                    stop(server, client);
                    done();
                });

                //server.yield();
                //let r = client.create(FooRepliq, { foo: "foo" });
                client.send("getRepliq").then((r: FooRepliq) => {
                    should.exist(r);

                    r.setFoo("bar");
                    client.yield();
                });
            });
        });

    });
});
