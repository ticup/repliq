///<reference path="./references.d.ts" />
var Operation_1 = require("./Operation");
var Round = (function () {
    function Round(nr, clientId, operations) {
        if (operations === void 0) { operations = []; }
        this.nr = nr;
        this.clientId = clientId;
        this.operations = operations;
    }
    Round.prototype.getNr = function () {
        return this.nr;
    };
    Round.prototype.add = function (operation) {
        this.operations.push(operation);
    };
    Round.prototype.hasOperations = function () {
        return this.operations.length !== 0;
    };
    Round.prototype.toJSON = function () {
        return {
            nr: this.nr,
            clientId: this.clientId,
            operations: this.operations.map(function (op) { return op.toJSON(); })
        };
    };
    Round.fromJSON = function (json, manager) {
        return new Round(json.nr, json.clientId, json.operations.map(function (op) { return Operation_1.Operation.fromJSON(op, manager); }));
    };
    return Round;
})();
exports.Round = Round;
//# sourceMappingURL=Round.js.map