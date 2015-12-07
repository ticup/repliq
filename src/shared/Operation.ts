/// <reference path="references.d.ts" />

import {Repliq} from "./Repliq";

export class Operation {
    public selector: string;
    public target: Repliq;
    public args: Object[];

    constructor(target: Repliq, selector: string, args: Object[]) {
        this.target = target;
        this.selector = selector;
        this.args = args;
    }
}