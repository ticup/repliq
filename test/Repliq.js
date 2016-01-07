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
var Repliq_1 = require("../src/shared/Repliq");
var RepliqManager_1 = require("../src/shared/RepliqManager");
var should = require("should");
describe("Unit Test", function () {
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
            Repliq_1.sync
        ], FooRepliq.prototype, "setFoo", null);
        return FooRepliq;
    })(Repliq_1.Repliq);
    describe("RepliqManager", function () {
        var manager = new RepliqManager_1.RepliqManager();
        manager.declare(FooRepliq);
        describe("#create(template, args)", function () {
            var r = manager.create(FooRepliq, {});
            it("should return a Repliq object", function () {
                should(r).be.an.instanceOf(Repliq_1.Repliq);
            });
            it("should produce a unique id", function () {
                var r1 = manager.create(FooRepliq, {});
                should.exist(r.getId());
                console.log(r.getId());
                should.equal(r.getId(), manager.getId() + "@" + FooRepliq.getId() + ":0");
                should.equal(r1.getId(), manager.getId() + "@" + FooRepliq.getId() + ":1");
            });
        });
        describe("#create(template, args)", function () {
            it("should return a Repliq object", function () {
                var props = { foo: "foo" };
                var r = manager.create(FooRepliq, props);
                should(r).be.an.instanceOf(Repliq_1.Repliq);
            });
            it("should overwrite the default fields", function () {
                var props = { foo: "foo" };
                var r = manager.create(FooRepliq, props);
                should.equal(r.get("foo"), "foo");
            });
        });
        describe("#call(op, ...args)", function () {
            it("should call the op method with given args", function () {
                var r = manager.create(FooRepliq, {});
                r.setFoo("foo");
                should(r.get("foo")).equal("foo");
            });
        });
    });
    describe("Repliq", function () {
        var manager = new RepliqManager_1.RepliqManager();
        manager.declare(FooRepliq);
        var r = manager.create(FooRepliq);
        describe(".on('change')", function () {
            it("should be triggered upon calling a sync method", function (done) {
                r.on(Repliq_1.Repliq.CHANGE, function () {
                    done();
                });
                r.setFoo("foo");
            });
        });
    });
});
//# sourceMappingURL=Repliq.js.map