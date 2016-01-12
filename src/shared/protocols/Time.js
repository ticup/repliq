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
    }
    Time.prototype._setHour = function (hour) {
        return this.set("hour", hour);
    };
    Time.prototype._setMinutes = function (minutes) {
        return this.set("minutes", minutes);
    };
    Time.prototype._setSeconds = function (seconds) {
        return this.set("seconds", seconds);
    };
    Time.prototype.setHour = function (hour) {
        if (isNaN(hour) || hour < 0 || hour > 24) {
            throw Error("incorrect hour " + hour);
        }
        return this._setHour(hour);
    };
    Time.prototype.setMinutes = function (minutes) {
        if (isNaN(minutes) || minutes < 0 || minutes > 59) {
            throw Error("incorrect minutes " + minutes);
        }
        return this._setMinutes(minutes);
    };
    Time.prototype.setSeconds = function (seconds) {
        if (isNaN(seconds) || seconds < 0 || seconds > 59) {
            throw Error("incorrect seconds " + seconds);
        }
        return this._setSeconds(seconds);
    };
    Time.prototype.getHour = function () {
        return this.get("hour");
    };
    Time.prototype.getHourPretty = function () {
        return ('0' + this.getHour()).slice(-2);
    };
    Time.prototype.getMinutes = function () {
        return this.get("minutes");
    };
    Time.prototype.getMinutesPretty = function () {
        return ('0' + this.getMinutes()).slice(-2);
    };
    Time.prototype.getSeconds = function () {
        return this.get("seconds");
    };
    Time.prototype.getSecondsPretty = function () {
        return ('0' + this.getSeconds()).slice(-2);
    };
    Time.fields = {
        hour: 0,
        minutes: 0,
        seconds: 0
    };
    __decorate([
        Repliq_1.sync
    ], Time.prototype, "_setHour", null);
    __decorate([
        Repliq_1.sync
    ], Time.prototype, "_setMinutes", null);
    __decorate([
        Repliq_1.sync
    ], Time.prototype, "_setSeconds", null);
    return Time;
})(Repliq_1.Repliq);
exports.Time = Time;
//# sourceMappingURL=Time.js.map