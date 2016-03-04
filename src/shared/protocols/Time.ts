///<reference path="../Repliq.ts" />

import {Repliq} from "../Repliq";

export let Time = Repliq.extend({
   constructor() {
       this.hours = 0;
       this.minutes = 0;
       this.second = 0;
    },

    setHours(hours: number) {
        if (isNaN(hours) || hours < 0 || hours > 24) {
            throw Error("incorrect hour " + hours);
        }
        return this.hours = hours;
    },

    setMinutes(minutes: number) {
        if (isNaN(minutes) || minutes < 0 || minutes > 59) {
            throw Error("incorrect minutes " + minutes);
        }
        return this.minutes = minutes;
    },

    setSeconds(seconds: number) {
        if (isNaN(seconds) || seconds < 0 || seconds > 59) {
            throw Error("incorrect seconds " + seconds);
        }
        return this.second = seconds;
    },


    getHour() {
        return this.hour;
    },

    getHourPretty() {
        return ('0' + this.getHour()).slice(-2)
    },

    getMinutes() {
        return this.minutes;
    },

    getMinutesPretty() {
        return ('0' + this.getMinutes()).slice(-2);
    },

    getSeconds() {
        return this.seconds;
    },

    getSecondsPretty() {
        return ('0' + this.getSeconds()).slice(-2);
    }


});