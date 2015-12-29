///<reference path="./references.d.ts" />

import {Operation, OperationJSON} from "./Operation";
import {ClientId} from "./Types";
import {toJSON, fromJSON} from "./Communication";
import {RepliqManager} from "./RepliqManager";

export interface RoundJSON {
    originNr: number;
    serverNr: number;
    originId: ClientId;
    operations: OperationJSON[];
}

export class Round {
    private originNr : number;
    private serverNr : number;
    private originId : ClientId;
    public operations : Operation[];

    constructor (originNr: number, originId: ClientId, serverNr = -1, operations = []) {
        this.serverNr   = -1;
        this.originNr   = originNr;
        this.originId   = originId;
        this.operations = operations;

    }

    getOriginId() {
        return this.originId;
    }

    getOriginNr() {
        return this.originNr;
    }

    setServerNr(nr: number) {
        this.serverNr = nr;
    }

    add(operation: Operation) {
        this.operations.push(operation);
    }

    hasOperations() {
        return this.operations.length !== 0;
    }


    toJSON(): RoundJSON {
        return {
            serverNr: this.serverNr,
            originNr: this.originNr,
            originId: this.originId,
            operations: this.operations.map((op) => op.toJSON())
        }
    }

    public static fromJSON(json: RoundJSON, manager: RepliqManager) {
        return new Round(
            json.originNr,
            json.originId,
            json.serverNr,
            json.operations.map((op) => Operation.fromJSON(op, manager)));
    }
}