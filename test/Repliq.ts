/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../src/index" />
/// <reference path="../src/shared/Repliq" />
"use strict";
import {RepliqServer as Server,
    RepliqClient as Client}  from "../src/index";
import {Repliq, sync} from "../src/shared/Repliq";
import {RepliqManager} from "../src/shared/RepliqManager";
import * as http from "http";
import * as ioClient  from "socket.io-client";
import * as ioServer from "socket.io";
import * as should from "should";


describe("Unit Test", () => {

    class FooRepliq extends Repliq {
        public foo = "bar";
        @sync
        setFoo(val) {
            this.set("foo", val); return val;
        }}


    //describe("RepliqTemplate", () => {
    //
    //    describe("#new()", () => {
    //        it("should return a RepliqTemplate object", () => {
    //            let t = new RepliqTemplate();
    //            should(t).be.an.instanceOf(RepliqTemplate);
    //        });
    //        it("should produce same id twice", () => {
    //            let t = new RepliqTemplate();
    //            let t1 = new RepliqTemplate();
    //            should.exist(t.getId());
    //            console.log(t.getId());
    //            should.equal(t.getId(), t1.getId());
    //        });
    //    });
    //
    //    describe("#new(template, originId, props)", () => {
    //        let props = {foo:"bar", setFoo(val) { this.foo = val }};
    //        it("should return a Repliq object", () => {
    //            let t = new RepliqTemplate(props);
    //            should(t).be.an.instanceOf(RepliqTemplate);
    //        });
    //        it("should produce same id twice", () => {
    //            let t = new RepliqTemplate(props);
    //            let t1 = new RepliqTemplate(props);
    //            should.exist(t.getId());
    //            should.equal(t.getId(), t1.getId());
    //        });
    //    });
    //});


    describe("RepliqManager", () => {
        let manager = new RepliqManager();
        manager.declare(FooRepliq);

        describe("#create(template, args)", () => {
            let r = <FooRepliq>manager.create(FooRepliq, {});
            it("should return a Repliq object", () => {
                should(r).be.an.instanceOf(Repliq);
            });
            it("should produce a unique id", () => {
                let r1 = manager.create(FooRepliq, {});
                should.exist(r.getId());
                console.log(r.getId());
                should.equal(r.getId(), manager.getId() + "@" + FooRepliq.getId() + ":0");
                should.equal(r1.getId(), manager.getId() + "@" + FooRepliq.getId() + ":1");
            });
        });

        describe("#create(template, args)", () => {
            it("should return a Repliq object", () => {
                let props = {foo:"foo"};
                let r = <FooRepliq>manager.create(FooRepliq, props);
                should(r).be.an.instanceOf(Repliq);
            });

            it("should overwrite the default fields", () => {
                let props = {foo:"foo"};
                let r = <FooRepliq>manager.create(FooRepliq, props);
                should.equal(r.get("foo"), "foo");
            });
        });

        describe("#call(op, ...args)", () => {
            it("should call the op method with given args", () => {
                let r = <FooRepliq>manager.create(FooRepliq, {});
                r.setFoo("foo");
                should(r.get("foo")).equal("foo");
            });
        });
    });


    describe("Repliq", () => {
        let manager = new RepliqManager();
        manager.declare(FooRepliq);
        let r = <FooRepliq>manager.create(FooRepliq);

        describe(".on('change')", () => {
            it("should be triggered upon calling a sync method", (done) => {
                r.on(Repliq.CHANGE, () => {
                    done();
                });
                r.setFoo("foo");
            });
        });
    })
});