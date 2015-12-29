///<reference path="../Repliq.ts" />
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
var Repliq_1 = require("../Repliq");
var Register = (function (_super) {
    __extends(Register, _super);
    function Register() {
        _super.apply(this, arguments);
    }
    Register.prototype.setVal = function (value) {
        return this.set("value", value);
    };
    Register.prototype.getVal = function () {
        return this.get("value");
    };
    Object.defineProperty(Register.prototype, "setVal",
        __decorate([
            Repliq_1.sync
        ], Register.prototype, "setVal", Object.getOwnPropertyDescriptor(Register.prototype, "setVal")));
    return Register;
})(Repliq_1.Repliq);
exports.Register = Register;
//# sourceMappingURL=Register.js.map