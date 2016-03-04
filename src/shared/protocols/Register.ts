///<reference path="../Repliq.ts" />

import {Repliq} from "../Repliq";

export let Register = Repliq.extend({

    setVal(value) {
        return this.set("value", value);
    },
    getVal() {
        return this.get("value");
    }
});