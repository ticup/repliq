/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../src/index" />
/// <reference path="../src/shared/Repliq" />
"use strict";
import {RepliqServer as Server,
    RepliqClient as Client, define}  from "../src/index";
import {Repliq, RepliqTemplate} from "../src/shared/Repliq";
import {RepliqManager} from "../src/shared/RepliqManager";
import * as http from "http";
import * as ioClient  from "socket.io-client";
import * as ioServer from "socket.io";
import * as should from "should";


describe("Unit Test", () => {
    describe("RepliqTemplate", () => {

        describe("#new()", () => {
            it("should return a RepliqTemplate object", () => {
                let t = new RepliqTemplate();
                should(t).be.an.instanceOf(RepliqTemplate);
            });
            it("should produce same id twice", () => {
                let t = new RepliqTemplate();
                let t1 = new RepliqTemplate();
                should.exist(t.getId());
                console.log(t.getId());
                should.equal(t.getId(), t1.getId());
            });
        });

        describe("#new(template, clientId, props)", () => {
            let props = {foo:"bar", setFoo(val) { this.foo = val }};
            it("should return a Repliq object", () => {
                let t = new RepliqTemplate(props);
                should(t).be.an.instanceOf(RepliqTemplate);
            });
            it("should produce same id twice", () => {
                let t = new RepliqTemplate(props);
                let t1 = new RepliqTemplate(props);
                should.exist(t.getId());
                should.equal(t.getId(), t1.getId());
            });
        });
    });


    describe("RepliqManager", () => {
        let template = new RepliqTemplate({foo:"bar", setFoo: function (val) { this.set("foo", val); return val; }});
        let manager = new RepliqManager();

        describe("#create(template, args)", () => {
            let r = manager.create(template, {});
            it("should return a Repliq object", () => {
                should(r).be.an.instanceOf(Repliq);
            });
            it("should produce a unique id", () => {
                let r1 = manager.create(template, {});
                should.exist(r.getId());
                console.log(r.getId());
                should.equal(r.getId(), manager.getId() + "@" + template.getId() + ":0");
                should.equal(r1.getId(), manager.getId() + "@" + template.getId() + ":1");
            });
        });

        describe("#create(template, args)", () => {
            it("should return a Repliq object", () => {
                let props = {foo:"foo"};
                let r = manager.create(template, props);
                should(r).be.an.instanceOf(Repliq);
            });

            it("should overwrite the default fields", () => {
                let props = {foo:"foo"};
                let r = manager.create(template, props);
                should.equal(r.get("foo"), "foo");
            });
        });

        describe("#call(op, ...args)", () => {
            it("should call the op method with given args", () => {
                let r = manager.create(template, {});
                r.call("setFoo", "foo");
                should(r.get("foo")).equal("foo");
            });
        });
    });
});