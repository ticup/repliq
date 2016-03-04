/// <reference path="references.d.ts" />

import {Repliq} from "./Repliq";
import {RepliqManager} from "./RepliqManager";

export class RepliqData {
    private committed;
    private tentative;

    constructor(fields = {}) {
        this.committed = {};
        this.tentative = {};
        Object.keys(fields).forEach((name) => {
            this.committed[name] = fields[name];
        });
    }


    get(key) {
        return this.getTentative(key);
    }

    has (key) {
        return (typeof this.getTentative(key) !== "undefined");
    }

    set(key, val) {
        return this.setTentative(key, val);
    }

    getTentative(key) {
        let val = this.tentative[key];
        if (typeof val === "undefined")
            return this.committed[key];
        return val;
    }

    setTentative(key, val) {
        return this.tentative[key] = val;
    }

    hasTentative() {
        return Object.keys(this.tentative).length !== 0;
    }


    getTentativeKeys() {
        return Object.keys(this.tentative);
    }

    getCommit(key) {
        return this.committed[key];
    }

    getKeys() {
        return Object.keys(this.committed);
    }

    commitValues() {
        this.getTentativeKeys().forEach((key) => {
            this.committed[key] = this.tentative[key];
            delete this.tentative[key]; });
    }

    setToCommit() {
        this.getTentativeKeys().forEach((key) =>
            delete this.tentative[key]);
    }

}