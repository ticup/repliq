"use strict";
var RepliqData = (function () {
    function RepliqData(fields) {
        var _this = this;
        if (fields === void 0) { fields = {}; }
        this.committed = {};
        this.tentative = {};
        Object.keys(fields).forEach(function (name) {
            _this.committed[name] = fields[name];
        });
    }
    RepliqData.prototype.get = function (key) {
        return this.getTentative(key);
    };
    RepliqData.prototype.has = function (key) {
        return (typeof this.getTentative(key) !== "undefined");
    };
    RepliqData.prototype.set = function (key, val) {
        return this.setTentative(key, val);
    };
    RepliqData.prototype.getTentative = function (key) {
        var val = this.tentative[key];
        if (typeof val === "undefined")
            return this.committed[key];
        return val;
    };
    RepliqData.prototype.setTentative = function (key, val) {
        return this.tentative[key] = val;
    };
    RepliqData.prototype.hasTentative = function () {
        return Object.keys(this.tentative).length !== 0;
    };
    RepliqData.prototype.getTentativeKeys = function () {
        return Object.keys(this.tentative);
    };
    RepliqData.prototype.getCommit = function (key) {
        return this.committed[key];
    };
    RepliqData.prototype.getKeys = function () {
        return Object.keys(this.committed);
    };
    RepliqData.prototype.commitValues = function () {
        var _this = this;
        this.getTentativeKeys().forEach(function (key) {
            _this.committed[key] = _this.tentative[key];
            delete _this.tentative[key];
        });
    };
    RepliqData.prototype.setToCommit = function () {
        var _this = this;
        this.getTentativeKeys().forEach(function (key) {
            return delete _this.tentative[key];
        });
    };
    return RepliqData;
}());
exports.RepliqData = RepliqData;
//# sourceMappingURL=RepliqData.js.map