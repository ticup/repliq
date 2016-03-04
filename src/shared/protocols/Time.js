"use strict";
var Repliq_1 = require("../Repliq");
exports.Time = Repliq_1.Repliq.extend({
    constructor: function () {
        this.hours = 0;
        this.minutes = 0;
        this.second = 0;
    },
    setHours: function (hours) {
        if (isNaN(hours) || hours < 0 || hours > 24) {
            throw Error("incorrect hour " + hours);
        }
        return this.hours = hours;
    },
    setMinutes: function (minutes) {
        if (isNaN(minutes) || minutes < 0 || minutes > 59) {
            throw Error("incorrect minutes " + minutes);
        }
        return this.minutes = minutes;
    },
    setSeconds: function (seconds) {
        if (isNaN(seconds) || seconds < 0 || seconds > 59) {
            throw Error("incorrect seconds " + seconds);
        }
        return this.second = seconds;
    },
    getHour: function () {
        return this.hour;
    },
    getHourPretty: function () {
        return ('0' + this.getHour()).slice(-2);
    },
    getMinutes: function () {
        return this.minutes;
    },
    getMinutesPretty: function () {
        return ('0' + this.getMinutes()).slice(-2);
    },
    getSeconds: function () {
        return this.seconds;
    },
    getSecondsPretty: function () {
        return ('0' + this.getSeconds()).slice(-2);
    }
});
//# sourceMappingURL=Time.js.map