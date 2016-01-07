var Communication_1 = require("./Communication");
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
            args: this.args.map(Communication_1.toJSON)
        };
    };
    Operation.fromJSON = function (json, manager) {
        return new Operation(json.targetId, json.selector, json.args.map(function (arg) { return Communication_1.fromJSON(arg, manager); }));
    };
    return Operation;
})();
exports.Operation = Operation;
//# sourceMappingURL=Operation.js.map