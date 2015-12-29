///<reference path="./references.d.ts" />
var Operation_1 = require("./Operation");
var Round = (function () {
    function Round(originNr, originId, serverNr, operations) {
        if (serverNr === void 0) { serverNr = -1; }
        if (operations === void 0) { operations = []; }
        this.serverNr = -1;
        this.originNr = originNr;
        this.originId = originId;
        this.operations = operations;
    }
    Round.prototype.getOriginId = function () {
        return this.originId;
    };
    Round.prototype.getOriginNr = function () {
        return this.originNr;
    };
    Round.prototype.setServerNr = function (nr) {
        this.serverNr = nr;
    };
    Round.prototype.add = function (operation) {
        this.operations.push(operation);
    };
    Round.prototype.hasOperations = function () {
        return this.operations.length !== 0;
    };
    Round.prototype.toJSON = function () {
        return {
            serverNr: this.serverNr,
            originNr: this.originNr,
            originId: this.originId,
            operations: this.operations.map(function (op) { return op.toJSON(); })
        };
    };
    Round.fromJSON = function (json, manager) {
        return new Round(json.originNr, json.originId, json.serverNr, json.operations.map(function (op) { return Operation_1.Operation.fromJSON(op, manager); }));
    };
    return Round;
})();
exports.Round = Round;
//# sourceMappingURL=Round.js.map