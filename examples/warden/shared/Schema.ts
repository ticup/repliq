///<reference path="../../../src/shared/references.d.ts"/>

import {Repliq, sync, Register} from "../../../src/shared/index";

export class Status extends Register {
    static fields = {
        value: "offline"
    };

    @sync
    turnOn() {
        this.setVal("on");
    }

    @sync
    turnOff() {
        this.setVal("off");
    }

    isOn() {
        return this.getVal() === "on";
    }

    isOff() {
        return this.getVal() === "off";
    }
}