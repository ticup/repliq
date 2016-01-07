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
var Time = (function (_super) {
    __extends(Time, _super);
    function Time() {
        _super.apply(this, arguments);
        this.hour = 0;
        this.minutes = 0;
    }
    Time.prototype.setTime = function (hour, minutes) {
        this.setHour(hour);
        this.setMinutes(minutes);
    };
    Time.prototype.setHour = function (hour) {
        return this.set("hour", hour);
    };
    Time.prototype.setMinutes = function (minutes) {
        return this.set("minutes", minutes);
    };
    Time.prototype.getHour = function () {
        return this.get("hour");
    };
    Time.prototype.getMinutes = function () {
        return this.get("minutes");
    };
    __decorate([
        Repliq_1.sync
    ], Time.prototype, "setTime", null);
    __decorate([
        Repliq_1.sync
    ], Time.prototype, "setHour", null);
    __decorate([
        Repliq_1.sync
    ], Time.prototype, "setMinutes", null);
    return Time;
})(Repliq_1.Repliq);
exports.Time = Time;
//# sourceMappingURL=Time.js.map