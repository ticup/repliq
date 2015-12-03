/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../src/index" />
/// <reference path="../src/shared/Repliq" />
"use strict";
var Repliq_1 = require("../src/shared/Repliq");
var should = require("should");
describe("Unit Test * ", function () {
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
    describe("Repliq", function () {
        var template = new Repliq_1.RepliqTemplate();
        describe("#new(template, clientId)", function () {
            var r = new Repliq_1.Repliq(template, "id");
            it("should return a Repliq object", function () {
                should(r).be.an.instanceOf(Repliq_1.Repliq);
            });
            it("should produce a unique id", function () {
                var r1 = new Repliq_1.Repliq(template, "id");
                should.exist(r.getId());
                console.log(r.getId());
                should.equal(r.getId(), "id@" + template.getId() + ":0");
                should.equal(r1.getId(), "id@" + template.getId() + ":1");
            });
        });
        describe("#new(template, clientId, props)", function () {
            var props = { foo: "bar", setFoo: function (val) { this.foo = val; } };
            it("should return a Repliq object", function () {
                var r = new Repliq_1.Repliq(template, "id", props);
                should(r).be.an.instanceOf(Repliq_1.Repliq);
            });
        });
    });
});
//# sourceMappingURL=Repliq.js.map