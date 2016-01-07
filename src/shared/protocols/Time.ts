///<reference path="../Repliq.ts" />

import {Repliq, sync} from "../Repliq";

export class Time extends Repliq {
    hour: number = 0;
    minutes: number = 0;

    @sync
    public setTime(hour, minutes) {
        this.setHour(hour);
        this.setMinutes(minutes);
    }

    @sync
    public setHour(hour: number) {
        return this.set("hour", hour);
    }

    @sync
    public setMinutes(minutes: number) {
        return this.set("minutes", minutes);
    }

    public getHour() {
        return this.get("hour");
    }

    public getMinutes() {
        return this.get("minutes");
    }
}