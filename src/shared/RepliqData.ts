/// <reference path="references.d.ts" />

import {Repliq} from "./Repliq";
import {RepliqManager} from "./RepliqManager";

export class RepliqData {
    private committed;
    private tentative;

    constructor(repliq: Repliq, manager: RepliqManager, defs: Object, args: Object) {
        this.committed = {};
        this.tentative = {};
        this.init(defs);
        this.init(args);
    }

    init(props: Object) {
        Object.keys(props).forEach((key) => {
            let val = props[key];
            if (typeof val !== "function") {
                this.committed[key] = val;
                this.tentative[key] = val;
            }
        });
    }

    getTentative(key) {
        return this.tentative[key];
    }

    setTentative(key, val) {
        return this.tentative[key] = val;
    }

    getKeys() {
        return Object.keys(this.tentative);
    }

    getCommitted(key) {
        return this.committed[key];
    }

    getCommittedKeys() {
        return Object.keys(this.committed);
    }

    commitValues() {
        this.getKeys().forEach((key) =>
            this.committed[key] = this.tentative[key]
        );
    }

}