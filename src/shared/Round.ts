///<reference path="./references.d.ts" />

import {Operation, OperationJSON} from "./Operation";
import {ClientId} from "./Types";
import {toJSON, fromJSON} from "./Communication";
import {RepliqManager} from "./RepliqManager";
import {Repliq} from "./Repliq";

export interface RoundJSON {
    clientNr: number;
    serverNr: number;
    originId: ClientId;
    operations: OperationJSON[];
}

export class Round {
    private clientNr : number;
    private serverNr : number;
    private originId : ClientId;
    public  origins  : ClientId[] = [];
    public operations : Operation[];

    constructor (clientNr: number, originId: ClientId, serverNr = -1, operations = []) {
        this.serverNr   = serverNr;
        this.clientNr   = clientNr;
        this.originId   = originId;
        this.operations = operations;

    }

    getOriginId() {
        return this.originId;
    }

    getClientNr() {
        return this.clientNr;
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

    containsOrigin(clientId: ClientId) {
        return this.origins.indexOf(clientId) !== -1;
    }

    merge(round: Round) {
        this.operations = this.operations.concat(round.operations);
        this.origins.push(round.getOriginId());
    }


    toJSON(): RoundJSON {
        return {
            serverNr: this.serverNr,
            clientNr: this.clientNr,
            originId: this.originId,
            operations: this.operations.map((op) => op.toJSON())
        }
    }

    copyFor(clientNr: number, repliqIds: string[]) {
        let ops = this.operations.filter((op: Operation) => repliqIds.indexOf(op.getTargetId()) !== -1);
        return new Round(clientNr, this.originId, this.serverNr, ops);
    }

    public static fromJSON(json: RoundJSON, manager: RepliqManager) {
        return new Round(
            json.clientNr,
            json.originId,
            json.serverNr,
            json.operations.map((op) => Operation.fromJSON(op, manager)));
    }

    toString() {
        return "{Round#s:" + this.getServerNr() + "o:" + this.getClientNr() + " | [" + this.operations.map((op) => op.toString()).join(", ") + "]}";
    }
}