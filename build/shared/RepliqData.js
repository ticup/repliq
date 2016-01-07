/// <reference path="references.d.ts" />
var RepliqData = (function () {
    function RepliqData(args) {
        this.committed = {};
        this.tentative = {};
        this.init(args);
    }
    RepliqData.prototype.init = function (props) {
        var _this = this;
        Object.keys(props).forEach(function (key) {
            var val = props[key];
            if (typeof val !== "function") {
                _this.committed[key] = val;
                _this.tentative[key] = val;
            }
        });
    };
    RepliqData.prototype.get = function (key) {
        return this.getTentative(key);
    };
    RepliqData.prototype.set = function (key, val) {
        return this.setTentative(key, val);
    };
    RepliqData.prototype.getTentative = function (key) {
        return this.tentative[key];
    };
    RepliqData.prototype.setTentative = function (key, val) {
        return this.tentative[key] = val;
    };
    RepliqData.prototype.getKeys = function () {
        return Object.keys(this.tentative);
    };
    RepliqData.prototype.getCommitted = function (key) {
        return this.committed[key];
    };
    RepliqData.prototype.getCommittedKeys = function () {
        return Object.keys(this.committed);
    };
    RepliqData.prototype.commitValues = function () {
        var _this = this;
        this.getKeys().forEach(function (key) {
            return _this.committed[key] = _this.tentative[key];
        });
    };
    RepliqData.prototype.setToCommit = function () {
        var _this = this;
        this.getCommittedKeys().forEach(function (key) {
            return _this.tentative[key] = _this.committed[key];
        });
    };
    return RepliqData;
})();
exports.RepliqData = RepliqData;
//# sourceMappingURL=RepliqData.js.map