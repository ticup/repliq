///<reference path="./references.d.ts" />

import {Operation, OperationJSON} from "./Operation";
import {ClientId} from "./Types";
import {toJSON, fromJSON} from "./Communication";
import {RepliqManager} from "./RepliqManager";

export interface RoundJSON {
    nr: number;
    clientId: ClientId;
    operations: OperationJSON[];
}

export class Round {
    private nr : number;
    private clientId   : ClientId;
    public operations : Operation[];

    constructor (nr: number, clientId: ClientId, operations = []) {
        this.nr         = nr;
        this.clientId   = clientId;
        this.operations = operations;

    }

    getNr() {
        return this.nr;
    }

    add(operation: Operation) {
        this.operations.push(operation);
    }

    hasOperations() {
        return this.operations.length !== 0;
    }


    toJSON(): RoundJSON {
        return {
            nr: this.nr,
            clientId: this.clientId,
            operations: this.operations.map((op) => op.toJSON())
        }
    }

    public static fromJSON(json: RoundJSON, manager: RepliqManager) {
        return new Round(
            json.nr,
            json.clientId,
            json.operations.map((op) => Operation.fromJSON(op, manager)));
    }
}