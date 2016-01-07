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
    __decorate([
        Repliq_1.sync
    ], Register.prototype, "setVal", null);
    return Register;
})(Repliq_1.Repliq);
exports.Register = Register;
//# sourceMappingURL=Register.js.map