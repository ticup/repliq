///<reference path="./references.d.ts" />

import {Operation, OperationJSON} from "./Operation";
import {ClientId} from "./Types";
import {toJSON, fromJSON} from "./Communication";
import {RepliqManager} from "./RepliqManager";
import {Repliq} from "./Repliq";

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
        this.serverNr   = serverNr;
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

    getServerNr() {
        return this.serverNr;
    }

    add(operation: Operation) {
        this.operations.push(operation);
    }

    hasOperations() {
        return this.operations.length !== 0;
    }

    getNewRepliqIds() {
        return this.operations.map((op) => op.getNewRepliqIds());
    }

    getTargetRepliqIds() {
        return this.operations.map((op) => op.targetId);
    }


    toJSON(repliqIds?: string[]): RoundJSON {
        let json = {
            serverNr: this.serverNr,
            originNr: this.originNr,
            originId: this.originId,
            operations: []
        };
        this.operations.forEach((op: Operation) => {
            if (typeof repliqIds === "undefined" || repliqIds.indexOf(op.targetId) !== -1)
                json.operations.push(op.toJSON());
        });
        return json;
    }

    public static fromJSON(json: RoundJSON, manager: RepliqManager) {
        return new Round(
            json.originNr,
            json.originId,
            json.serverNr,
            json.operations.map((op) => Operation.fromJSON(op, manager)));
    }

    toString() {
        return "{Round#s:" + this.getServerNr() + "o:" + this.getOriginNr() + " | [" + this.operations.map((op) => op.toString()).join(", "); + "]}";
    }
}