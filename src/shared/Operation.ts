/// <reference path="references.d.ts" />

import {Repliq} from "./Repliq";
import {toJSON, fromJSON} from "./Communication";
import {RepliqManager} from "./RepliqManager";
import {ValueJSON} from "./Communication";

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
            args: this.args.map(toJSON)
        }
    }

    public static fromJSON(json: OperationJSON, manager: RepliqManager): Operation {
        return new Operation(
            json.targetId,
            json.selector,
            json.args.map((arg) => fromJSON(arg, manager)));
    }
}