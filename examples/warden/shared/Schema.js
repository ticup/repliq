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
var index_1 = require("../../../src/shared/index");
var Status = (function (_super) {
    __extends(Status, _super);
    function Status() {
        _super.apply(this, arguments);
        this.value = "offline";
    }
    Status.prototype.turnOn = function () {
        this.setVal("on");
    };
    Status.prototype.turnOff = function () {
        this.setVal("off");
    };
    Status.prototype.isOn = function () {
        return this.getVal() === "on";
    };
    Status.prototype.isOff = function () {
        return this.getVal() === "off";
    };
    __decorate([
        index_1.sync
    ], Status.prototype, "turnOn", null);
    __decorate([
        index_1.sync
    ], Status.prototype, "turnOff", null);
    return Status;
})(index_1.Register);
exports.Status = Status;
//# sourceMappingURL=Schema.js.map