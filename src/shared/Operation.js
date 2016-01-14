var Repliq_1 = require("./Repliq");
var Communication_1 = require("./Communication");
var Communication_2 = require("./Communication");
var Operation = (function () {
    function Operation(targetId, selector, args) {
        this.targetId = targetId;
        this.selector = selector;
        this.args = args;
    }
    Operation.prototype.toJSON = function () {
        return {
            targetId: this.targetId,
            selector: this.selector,
            args: this.args.map(function (arg) { return Communication_1.toJSON(arg); })
        };
    };
    Operation.prototype.getNewRepliqIds = function () {
        if (this.selector === Repliq_1.Repliq.CREATE_SELECTOR) {
            return [this.targetId].concat(Communication_2.getRepliqReferences(this.args));
        }
        return Communication_2.getRepliqReferences(this.args);
    };
    Operation.fromJSON = function (json, manager) {
        return new Operation(json.targetId, json.selector, json.args.map(function (arg) { return Communication_1.fromJSON(arg, manager); }));
    };
    Operation.prototype.toString = function () {
        return "" + this.targetId.slice(-5) + "." + this.selector + "(" + this.args.map(function (arg) { return arg.toString(); }).join(", ") + ")";
    };
    return Operation;
})();
exports.Operation = Operation;
//# sourceMappingURL=Operation.js.map