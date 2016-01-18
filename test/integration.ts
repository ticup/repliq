/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../src/index" />
///<reference path="../src/shared/Repliq.ts"/>
///<reference path="../src/server/RepliqServer.ts"/>

"use strict";
import {Repliq, List, sync} from "../src/shared/index";
import {RepliqServer as Server,
        RepliqClient as Client}  from "../src/index";
import {createServer} from "../src/server/RepliqServer";
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

    class FooRepliq extends Repliq {
        public foo = "bar";
        @sync
        setFoo(val) {
            this.set("foo", val);
        }}

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
                let s = ioServer(port);
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
                class FooRepliq extends Repliq {
                    public foo = "bar";
                    setFoo(val) {
                        this.set("foo", val);
                        return val;
                    }}
                let server = new Server(port, {FooRepliq});
                let client = new Client(host, {FooRepliq});

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
                    }}
                let server = new Server(port);
                let client = new Client(host);

                server.declare(FooRepliq);
                client.declare(FooRepliq);

                client.onConnect().then(() => {
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
    });

    describe("Synchronization", () => {
        describe("yielding on client with object creation", () => {
            it("should create the object on the server", (done) => {
                class FooRepliq extends Repliq{
                    public foo = "bar";
                    setFoo(val) {
                        this.set("foo", val);
                        return val;
                    }}
                let server = new Server(port,{FooRepliq});
                let client = new Client(host,{FooRepliq});


                server.export({ identity: function (x) {
                    return x;
                }});

                client.onConnect().then(() => {

                    let r = client.create(FooRepliq, {foo: "foo"});
                    client.yield();
                    setTimeout(() => {
                        server.yield();
                        let r2 = server.getRepliq(r.getId());
                        should.exist(r2);
                        should.equal(r2.get("foo"), "foo");
                        stop(client, server);
                        done();
                    }, YIELD_DELAY);
                });
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
                class FooRepliq extends Repliq {
                    public foo = "bar";
                    @sync
                    setFoo(val) {
                        this.set("foo", val);
                        return val;
                    }}
                let server = new Server(port, {FooRepliq});
                let client = new Client(host, {FooRepliq});
                let client2 = new Client(host, {FooRepliq});

                let s = server.create(FooRepliq, {  });
                server.export({ getRepliq: function () {
                    return s;
                }});


                //let r = client.create(FooRepliq, { foo: "foo" });
                client.send("getRepliq").then((r: FooRepliq) => {
                    client2.send("getRepliq").then((r2: FooRepliq) => {
                        let c = <FooRepliq>client.create(FooRepliq, {});
                        r.setFoo(c);
                        client.yield();

                        delay(() => {
                            let c3 = server.getRepliq(c.getId());
                            should.exist(c3);
                            should.exist(s.get("foo"));
                            should(s.get("foo").getId()).equal(c3.getId());

                            delay(()=> {
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


        describe("creating a new repliq on server and introduce a reference for a client", () => {
            it("should not create the object on another client", (done) => {
                class FooRepliq extends Repliq {
                    public foo = "bar";
                    @sync
                    setFoo(val) {
                        this.set("foo", val);
                        return val;
                    }}
                let server = createServer({port, schema: {FooRepliq}, manualPropagation: true});
                let client = new Client(host, {FooRepliq});
                let client2 = new Client(host, {FooRepliq});


                delay(() => {

                    let s  = <FooRepliq>server.create(FooRepliq, {foo: "foo"});

                    server.export({
                        getRepliq: function () {
                            return s;
                        }
                    });

                    server.yield();
                    client.send("getRepliq").then((r:FooRepliq) => {
                        //client.yield();
                        should.equal(r.getId(), s.getId());
                        should.exist(r.get("foo"));
                        should.equal(r.get("foo"), "foo");


                        let s2 = <FooRepliq>server.create(FooRepliq, {foo: "foo"});
                        s.setFoo(s2);

                        server.yield();
                        delay(() => {
                            client.incoming.length.should.equal(1);
                            client.incoming[0].operations.length.should.equal(2);
                            client.yield();
                            client.incoming.length.should.equal(0);
                            should.equal(r.get("foo").getId(), s2.getId());

                            client2.incoming.length.should.equal(0);
                            client2.yield();
                            stop(server, client, client2);
                            done();
                        });
                    });
                });

            });
        });


        describe("repliq.on('changeExternal', fun) on client", () => {
            it("should call the function when the Repliq is altered by an external source", (done) => {
                class FooRepliq extends Repliq{
                    public foo = "bar";
                    @sync
                    setFoo(val) {
                        this.set("foo", val);
                        return val;
                    }}
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
                        r.on(Repliq.CHANGE_EXTERNAL, () => {
                            stop(server, client);
                            done();
                        });
                        client.yield();
                    });
                });
            });
        });

        describe("repliq.on('changeExternal', fun) on server", () => {
            it("should call the function when the Repliq is altered by an external source", (done) => {
                class FooRepliq extends Repliq{
                    public foo = "bar";
                    @sync
                    setFoo(val) {
                        this.set("foo", val);
                        return val;
                    }}
                let server = new Server(port);
                let client = new Client(host);

                server.declare(FooRepliq);
                client.declare(FooRepliq);

                let s = <FooRepliq>server.create(FooRepliq, {  });
                server.export({ getRepliq: function () {
                    return s;
                }});

                s.on(Repliq.CHANGE_EXTERNAL, () => {
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

    describe("Rounds & Logs", () => {

        describe("Server Modes", () => {
            describe("server in \"manual propagation\" mode", () => {
                it("should log the operations in the current round until yielded", (done) => {
                    let server = createServer({port, schema: {FooRepliq}, manualPropagation: true});

                    server.export({
                        identity: function (x) {
                            return x;
                        }
                    });

                    server.create(FooRepliq, {foo: "foo"});
                    server.current.operations.length.should.equal(1);
                    server.create(FooRepliq, {foo: "foo"});
                    server.current.operations.length.should.equal(2);
                    let r = <FooRepliq>server.create(FooRepliq, {foo: "foo"});
                    r.setFoo("barr");
                    server.current.operations.length.should.equal(4);
                    server.yield();
                    server.current.operations.length.should.equal(0);
                    stop(server);
                    done();
                });

            });

            describe("server in \"automatic propagation\" mode", () => {
                it("should automatically propagate a round when received from client", (done) => {
                    let server = new Server(port, {FooRepliq});
                    let client = new Client(host, {FooRepliq});

                    let s = <FooRepliq>server.create(FooRepliq, {});
                    server.export({
                        getRepliq: function () {
                            return s;
                        }
                    });

                    client.onConnect().then(() => {
                        client.send("getRepliq").then((c:FooRepliq) => {
                            c.setFoo("fooor");
                            should.equal(c.get("foo"), "fooor");
                            should.equal(c.confirmed(), false);
                            client.yield();
                            delay(() => {
                                s.get("foo").should.equal("fooor");

                                client.yield();
                                should.equal(c.get("foo"), "fooor");
                                should.equal(c.confirmed(), true);

                                stop(server, client);
                                done();
                            });
                        });
                    });

                });
            });
        });

        describe("Round numbering", () => {
            describe("Simple Server Rounds", () => {

                describe("yielding after an action happened", () => {
                    it("should create successive numbers, starting from 0", (done) => {
                        let server = new Server(port, {FooRepliq});

                        server.current.getServerNr().should.equal(0);
                        <FooRepliq>server.create(FooRepliq, {});
                        server.current.getServerNr().should.equal(0);
                        server.yield();
                        server.current.getServerNr().should.equal(1);
                        <FooRepliq>server.create(FooRepliq, {});
                        server.yield();
                        server.current.getServerNr().should.equal(2);
                        let s = <FooRepliq>server.create(FooRepliq, {});
                        server.yield();
                        server.current.getServerNr().should.equal(3);
                        s.setFoo("foo");
                        server.yield();
                        server.current.getServerNr().should.equal(4);
                        stop(server);
                        done();
                    });
                });

                describe("yielding without an action happened", () => {
                    it("should not create a new round", (done) => {
                        let server = new Server(port, {FooRepliq});

                        let round = server.current;
                        server.current.getServerNr().should.equal(0);
                        server.yield();
                        server.current.getServerNr().should.equal(0);
                        should.equal(server.current, round);
                        server.yield();
                        server.current.getServerNr().should.equal(0);
                        <FooRepliq>server.create(FooRepliq, {});
                        server.yield();
                        let r = server.current;
                        server.current.getServerNr().should.equal(1);
                        server.yield();
                        server.current.getServerNr().should.equal(1);
                        should.equal(server.current, r);
                        stop(server); done();
                    });
                });
            });

            describe("Simple Client Rounds", () => {
                describe("yielding after an action happened", () => {
                    it("should create successive numbers, starting from 0", (done) => {
                        let client = new Client(host, {FooRepliq});

                        client.current.getClientNr().should.equal(0);
                        <FooRepliq>client.create(FooRepliq, {});
                        client.current.getClientNr().should.equal(0);
                        client.yield();
                        client.current.getClientNr().should.equal(1);
                        <FooRepliq>client.create(FooRepliq, {});
                        client.yield();
                        client.current.getClientNr().should.equal(2);
                        let s = <FooRepliq>client.create(FooRepliq, {});
                        client.yield();
                        client.current.getClientNr().should.equal(3);
                        s.setFoo("foo");
                        client.yield();
                        client.current.getClientNr().should.equal(4);
                        stop(client);
                        done();
                    });
                });

                describe("yielding without an action happened", () => {
                    it("should not create a new round", (done) => {
                        let client = new Client(host, {FooRepliq});

                        let round = client.current;
                        client.current.getClientNr().should.equal(0);
                        client.yield();
                        client.current.getClientNr().should.equal(0);
                        should.equal(client.current, round);
                        client.yield();
                        client.current.getClientNr().should.equal(0);
                        <FooRepliq>client.create(FooRepliq, {});
                        client.yield();
                        let r = client.current;
                        client.current.getClientNr().should.equal(1);
                        client.yield();
                        client.current.getClientNr().should.equal(1);
                        should.equal(client.current, r);
                        stop(client); done();
                    });
                });
            });

            describe("Client-Server Round", () => {
                describe("Creating a round on the client and yielding", () => {
                    it("should create a 0-0 round both server and client", (done) => {
                        let client = new Client(host, {FooRepliq});
                        let server = new Server(port, {FooRepliq});

                        <FooRepliq>client.create(FooRepliq, {});
                        client.yield();
                        delay(() => {
                            server.current.getServerNr().should.equal(1);
                            stop(client, server); done();
                        });
                    });
                });

                describe("Sending rounds from different clients to the server", () => {
                    it("should merge them into one", (done) => {
                        let client1 = new Client(host, {FooRepliq});
                        let client2 = new Client(host, {FooRepliq});
                        let server = createServer({port, schema: {FooRepliq}, manualPropagation: true});

                        // client1, round 1
                        <FooRepliq>client1.create(FooRepliq, {});
                        client1.yield();
                        // client 1, round 2
                        <FooRepliq>client1.create(FooRepliq, {});
                        client1.yield();

                        // client 2, round 1
                        <FooRepliq>client2.create(FooRepliq, {});
                        client2.yield();
                        // client 2, round 2
                        <FooRepliq>client2.create(FooRepliq, {});
                        client2.yield();
                        //client 2, round 3
                        <FooRepliq>client2.create(FooRepliq, {});
                        client2.yield();

                        client1.pending.length.should.equal(2);
                        client2.pending.length.should.equal(3);



                        delay(() => {
                            server.current.getServerNr().should.equal(0);
                            server.incoming.length.should.equal(5);
                            server.yield();
                            server.incoming.length.should.equal(0);
                            server.current.getServerNr().should.equal(1);

                            delay(() => {
                                client1.pending.length.should.equal(2);
                                client2.pending.length.should.equal(3);

                                client1.incoming.length.should.equal(1);
                                client2.incoming.length.should.equal(1);

                                client1.yield();
                                client2.yield();

                                client1.incoming.length.should.equal(0);
                                client1.pending.length.should.equal(0);
                                client2.incoming.length.should.equal(0);
                                client2.pending.length.should.equal(0);

                                stop(client1, server); done();
                            });
                        });
                    });
                });
            });
        });


        describe("Connectivity", () => {
            describe("Client reconnects after having pending operations, which the server didn't receive", () => {
                it("client should resend the pending operations to server", (done) => {
                    let client = new Client(host, {FooRepliq});
                    let server = createServer({port, schema: {FooRepliq}, manualPropagation: true});

                    client.onConnect().then(()=> {
                        client.stop();

                        <FooRepliq>client.create(FooRepliq, {});
                        client.yield();

                        <FooRepliq>client.create(FooRepliq, {});
                        client.yield();

                        delay(() => {

                            client.pending.length.should.equal(2);
                            server.incoming.length.should.equal(0);
                            server.current.getServerNr().should.equal(0);

                            client.connect(host).then(() => {
                                delay(() => {
                                    client.pending.length.should.equal(2);
                                    server.incoming.length.should.equal(2);

                                    server.yield();
                                    server.incoming.length.should.equal(0);

                                    delay(() => {
                                        client.incoming.length.should.equal(1);
                                        client.yield();
                                        client.pending.length.should.equal(0);
                                        stop(client, server);
                                        done();
                                    });
                                });
                            });

                        });
                    });
                });
            });

            describe.only("Client reconnects after server has new logs, which the client doesn't receive yet", () => {
                it("server should resend the pending operations to client", (done) => {
                    let client = new Client(host, {FooRepliq});
                    let server = createServer({port, schema: {FooRepliq}, manualPropagation: true});

                    client.onConnect().then(()=> {
                        let c = <FooRepliq>client.create(FooRepliq, {});
                        client.yield();
                        delay(() => {
                            server.yield();
                            let s = server.getRepliq(c.getId());
                            should.exist(s);

                            client.stop();

                            let s2 = <FooRepliq>client.create(FooRepliq, {});
                            server.yield();
                            s.setFoo(s2);
                            server.yield();

                            client.connect(host).then(() => {

                                // TODO: change getServerNr() such that it is the current nr

                                c.get("foo").getId().should.equal(s2.getId())
                                stop(client, server); done();
                            });

                        });
                    });
                });
            });
        });
    });
});
