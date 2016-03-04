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
        if (this.isMethodApplication()) {
            return Communication_2.getRepliqReferences(this.args);
        }
        else {
            return [this.args[0]].concat(Communication_2.getRepliqReferences(this.args.slice(1)));
        }
    };
    Operation.prototype.isMethodApplication = function () {
        return (typeof this.targetId !== "undefined");
    };
    Operation.prototype.getTargetId = function () {
        if (this.isMethodApplication()) {
            return this.targetId;
        }
        if (this.selector === Repliq_1.Repliq.CREATE_SELECTOR) {
            return this.args[0];
        }
    };
    Operation.fromJSON = function (json, manager) {
        return new Operation(json.targetId, json.selector, json.args.map(function (arg) { return Communication_1.fromJSON(arg, manager); }));
    };
    Operation.global = function (selector, args) {
        return new Operation(undefined, selector, args);
    };
    Operation.prototype.toString = function () {
        var args = this.args.map(function (arg) { return arg.isPrototype ? arg.toStrings() : (typeof arg === "string" ? arg.slice(-5) : arg.toString()); }).join(", ");
        return "" + (typeof this.targetId === "undefined" ? "" : this.targetId.slice(-5)) + "." + this.selector + "(" + args + ")";
    };
    return Operation;
})();
exports.Operation = Operation;
//# sourceMappingURL=Operation.js.map