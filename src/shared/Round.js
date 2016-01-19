var Operation_1 = require("./Operation");
var Round = (function () {
    function Round(clientNr, originId, serverNr, operations) {
        if (serverNr === void 0) { serverNr = -1; }
        if (operations === void 0) { operations = []; }
        this.origins = [];
        this.serverNr = serverNr;
        this.clientNr = clientNr;
        this.originId = originId;
        this.operations = operations;
    }
    Round.prototype.getOriginId = function () {
        return this.originId;
    };
    Round.prototype.getClientNr = function () {
        return this.clientNr;
    };
    Round.prototype.setServerNr = function (nr) {
        this.serverNr = nr;
    };
    Round.prototype.getServerNr = function () {
        return this.serverNr;
    };
    Round.prototype.add = function (operation) {
        this.operations.push(operation);
    };
    Round.prototype.hasOperations = function () {
        return this.operations.length !== 0;
    };
    Round.prototype.getNewRepliqIds = function () {
        return this.operations.map(function (op) { return op.getNewRepliqIds(); });
    };
    Round.prototype.getTargetRepliqIds = function () {
        return this.operations.map(function (op) { return op.targetId; });
    };
    Round.prototype.containsOrigin = function (clientId) {
        return this.origins.indexOf(clientId) !== -1;
    };
    Round.prototype.merge = function (round) {
        this.operations = this.operations.concat(round.operations);
        this.origins.push(round.getOriginId());
    };
    Round.prototype.toJSON = function () {
        return {
            serverNr: this.serverNr,
            clientNr: this.clientNr,
            originId: this.originId,
            operations: this.operations.map(function (op) { return op.toJSON(); })
        };
    };
    Round.prototype.copyFor = function (clientNr, repliqIds) {
        var ops = this.operations.filter(function (op) { return repliqIds.indexOf(op.getTargetId()) !== -1; });
        return new Round(clientNr, this.originId, this.serverNr, ops);
    };
    Round.fromJSON = function (json, manager) {
        return new Round(json.clientNr, json.originId, json.serverNr, json.operations.map(function (op) { return Operation_1.Operation.fromJSON(op, manager); }));
    };
    Round.prototype.toString = function () {
        return "{Round#s:" + this.getServerNr() + "o:" + this.getClientNr() + " | [" + this.operations.map(function (op) { return op.toString(); }).join(", ");
        +"]}";
    };
    return Round;
})();
exports.Round = Round;
//# sourceMappingURL=Round.js.map