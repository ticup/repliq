///<reference path="../Repliq.ts" />

import {Repliq, sync} from "../Repliq";

export class Time extends Repliq {
   static fields = {
        hour: 0,
        minutes: 0
    };

    @sync
    private _setHour(hour: number) {
        return this.set("hour", hour);
    }

    @sync
    private _setMinutes(minutes: number) {
        return this.set("minutes", minutes);
    }

    public setHour(hour: number) {
        if (isNaN(hour) || hour < 0 || hour > 24) {
            throw Error("incorrect hour " + hour);
        }
        return this._setHour(hour);
    }

    public setMinutes(minutes: number) {
        if (isNaN(minutes) || minutes < 0 || minutes > 59) {
            throw Error("incorrect minutes " + minutes);
        }
        return this._setMinutes(minutes);
    }

    public getHour() {
        return this.get("hour");
    }

    public getHourPretty() {
        return ('0' + this.getHour()).slice(-2)
    }

    public getMinutes() {
        return this.get("minutes");
    }

    public getMinutesPretty() {
        return ('0' + this.getMinutes()).slice(-2);
    }
}