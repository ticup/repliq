///<reference path="../../../src/shared/references.d.ts"/>

import {Repliq, sync, Register} from "../../../src/shared/index";

export class Status extends Register {
    @sync
    on() {
        this.setVal("on");
    }

    @sync
    off() {
        this.setVal("off");
    }

}