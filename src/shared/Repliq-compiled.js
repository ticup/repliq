"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.defineRepliq = defineRepliq;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

///<reference path="../../typings/tsd.d.ts" />

var Repliq = exports.Repliq = (function () {
    function Repliq(props) {
        var _this = this;

        _classCallCheck(this, Repliq);

        this.committed = {};
        this.tentative = {};
        Object.keys(props).forEach(function (key) {
            _this.committed[key] = props[key];
            _this.tentative[key] = props[key];
        });
    }

    _createClass(Repliq, [{
        key: "getCommit",
        value: function getCommit(key) {
            return this.committed[key];
        }
    }, {
        key: "commitKeys",
        value: function commitKeys() {
            return Object.keys(this.committed);
        }
    }]);

    return Repliq;
})();

function defineRepliq(props) {
    var obj = new Repliq(props);
    return new Proxy(obj, {
        get: function get(target, property, receiver) {
            if (property in target) {
                return target[property];
            }
            return target.tentative[property];
        },
        set: function set(target, property, value, receiver) {
            return target.tentative[property] = value;
        }
    });
}
;
//# sourceMappingURL=Repliq.js.map

//# sourceMappingURL=Repliq-compiled.js.map