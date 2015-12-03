/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../src/index" />
/// <reference path="../src/shared/Repliq" />
"use strict";
import {RepliqServer as Server,
    RepliqClient as Client, define}  from "../src/index";
import {Repliq, RepliqTemplate} from "../src/shared/Repliq";
import * as http from "http";
import * as ioClient  from "socket.io-client";
import * as ioServer from "socket.io";
import * as should from "should";


describe("Unit Test * ", () => {
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


    describe("Repliq", () => {
        let template = new RepliqTemplate({foo:"bar"});

        describe("#new(template, clientId)", () => {
            let r = new Repliq(template, "id");
            it("should return a Repliq object", () => {
                should(r).be.an.instanceOf(Repliq);
            });
            it("should produce a unique id", () => {
                let r1 = new Repliq(template, "id");
                should.exist(r.getId());
                console.log(r.getId());
                should.equal(r.getId(), "id@" + template.getId() + ":0");
                should.equal(r1.getId(), "id@" + template.getId() + ":1");
            });
        });

        describe("#new(template, clientId, props)", () => {
            it("should return a Repliq object", () => {
                let props = {foo:"foo"};
                let r = new Repliq(template, "id", props);
                should(r).be.an.instanceOf(Repliq);
            });

            it("should overwrite the default fields", () => {
                let props = {foo:"foo"};
                let r = new Repliq(template, "id", props);
                should.equal(r.get("foo"), "foo");
            });
        });
    });
});