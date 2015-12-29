/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../src/index" />
/// <reference path="../src/shared/Repliq" />
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var Repliq_1 = require("../src/shared/Repliq");
var RepliqManager_1 = require("../src/shared/RepliqManager");
var should = require("should");
describe("Unit Test", function () {
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
    describe("RepliqManager", function () {
        var template = (function (_super) {
            __extends(template, _super);
            function template() {
                _super.apply(this, arguments);
                this.foo = "bar";
            }
            template.prototype.setFoo = function (val) {
                this.set("foo", val);
                return val;
            };
            Object.defineProperty(template.prototype, "setFoo",
                __decorate([
                    Repliq_1.sync
                ], template.prototype, "setFoo", Object.getOwnPropertyDescriptor(template.prototype, "setFoo")));
            return template;
        })(Repliq_1.Repliq);
        ;
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
                r.setFoo("foo");
                should(r.get("foo")).equal("foo");
            });
        });
    });
});
//# sourceMappingURL=Repliq.js.map