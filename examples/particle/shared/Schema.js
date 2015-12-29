///<reference path="../../../src/shared/references.d.ts"/>
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
var index_1 = require("../../../src/shared/index");
var Status = (function (_super) {
    __extends(Status, _super);
    function Status() {
        _super.apply(this, arguments);
    }
    Status.prototype.on = function () {
        this.setVal("on");
    };
    Status.prototype.off = function () {
        this.setVal("off");
    };
    Object.defineProperty(Status.prototype, "on",
        __decorate([
            index_1.sync
        ], Status.prototype, "on", Object.getOwnPropertyDescriptor(Status.prototype, "on")));
    Object.defineProperty(Status.prototype, "off",
        __decorate([
            index_1.sync
        ], Status.prototype, "off", Object.getOwnPropertyDescriptor(Status.prototype, "off")));
    return Status;
})(index_1.Register);
exports.Status = Status;
//# sourceMappingURL=Schema.js.map