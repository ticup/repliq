"use strict";
var Repliq_1 = require("../Repliq");
exports.Register = Repliq_1.Repliq.extend({
    setVal: function (value) {
        return this.set("value", value);
    },
    getVal: function () {
        return this.get("value");
    }
});
//# sourceMappingURL=Register.js.map