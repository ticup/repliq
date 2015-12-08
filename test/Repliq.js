/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../src/index" />
/// <reference path="../src/shared/Repliq" />
"use strict";
var Repliq_1 = require("../src/shared/Repliq");
var RepliqManager_1 = require("../src/shared/RepliqManager");
var should = require("should");
describe("Unit Test", function () {
    describe("RepliqTemplate", function () {
        describe("#new()", function () {
            it("should return a RepliqTemplate object", function () {
                var t = new Repliq_1.RepliqTemplate();
                should(t).be.an.instanceOf(Repliq_1.RepliqTemplate);
            });
            it("should produce same id twice", function () {
                var t = new Repliq_1.RepliqTemplate();
                var t1 = new Repliq_1.RepliqTemplate();
                should.exist(t.getId());
                console.log(t.getId());
                should.equal(t.getId(), t1.getId());
            });
        });
        describe("#new(template, clientId, props)", function () {
            var props = { foo: "bar", setFoo: function (val) { this.foo = val; } };
            it("should return a Repliq object", function () {
                var t = new Repliq_1.RepliqTemplate(props);
                should(t).be.an.instanceOf(Repliq_1.RepliqTemplate);
            });
            it("should produce same id twice", function () {
                var t = new Repliq_1.RepliqTemplate(props);
                var t1 = new Repliq_1.RepliqTemplate(props);
                should.exist(t.getId());
                should.equal(t.getId(), t1.getId());
            });
        });
    });
    describe("RepliqManager", function () {
        var template = new Repliq_1.RepliqTemplate({ foo: "bar", setFoo: function (val) { this.set("foo", val); return val; } });
        var manager = new RepliqManager_1.RepliqManager();
        describe("#create(template, args)", function () {
            var r = manager.create(template, {});
            it("should return a Repliq object", function () {
                should(r).be.an.instanceOf(Repliq_1.Repliq);
            });
            it("should produce a unique id", function () {
                var r1 = manager.create(template, {});
                should.exist(r.getId());
                console.log(r.getId());
                should.equal(r.getId(), manager.getId() + "@" + template.getId() + ":0");
                should.equal(r1.getId(), manager.getId() + "@" + template.getId() + ":1");
            });
        });
        describe("#create(template, args)", function () {
            it("should return a Repliq object", function () {
                var props = { foo: "foo" };
                var r = manager.create(template, props);
                should(r).be.an.instanceOf(Repliq_1.Repliq);
            });
            it("should overwrite the default fields", function () {
                var props = { foo: "foo" };
                var r = manager.create(template, props);
                should.equal(r.get("foo"), "foo");
            });
        });
        describe("#call(op, ...args)", function () {
            it("should call the op method with given args", function () {
                var r = manager.create(template, {});
                r.call("setFoo", "foo");
                should(r.get("foo")).equal("foo");
            });
        });
    });
});
//# sourceMappingURL=Repliq.js.map