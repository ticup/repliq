/// <reference path="references.d.ts" />

import {Repliq} from "./Repliq";
import {toJSON, fromJSON} from "./Communication";
import {RepliqManager} from "./RepliqManager";
import {ValueJSON, getRepliqReferences} from "./Communication";

export interface OperationJSON {
    selector: string;
    targetId: string;
    args: ValueJSON[];
}

export class Operation {
    public targetId: string;
    public selector: string;
    public args: Object[];

    constructor(targetId: string, selector: string, args: Object[]) {
        this.targetId = targetId;
        this.selector = selector;
        this.args = args;
    }

    toJSON(): OperationJSON {
        return {
            targetId: this.targetId,
            selector: this.selector,
            args: this.args.map((arg) => toJSON(arg))
        }
    }

    getNewRepliqIds() {
        if (this.isMethodApplication()) {
            return getRepliqReferences(this.args)
        } else {
            return [this.args[0]].concat(getRepliqReferences(this.args.slice(1)));
        }
    }

    isMethodApplication() {
        return (typeof this.targetId !== "undefined");
    }

    getTargetId() {
        if (this.isMethodApplication()) {
            return this.targetId;
        }
        if (this.selector === Repliq.CREATE_SELECTOR) {
            return this.args[0];
        }
    }



    public static fromJSON(json: OperationJSON, manager: RepliqManager): Operation {
        return new Operation(
            json.targetId,
            json.selector,
            json.args.map((arg) => fromJSON(arg, manager)));
    }

    static global(selector: string, args) {
        return new Operation(undefined, selector, args);
    }

    public toString() {
        return "" + this.targetId.slice(-5) + "." + this.selector + "(" + this.args.map((arg) => arg.toString()).join(", ") + ")";
    }
}