///<reference path="../Repliq.ts" />

import {Repliq, sync} from "../Repliq";

export class Register extends Repliq {
    @sync
    public setVal(value) {
        return this.set("value", value);
    }

    public getVal() {
        return this.get("value");
    }
}