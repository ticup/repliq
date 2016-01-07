///<reference path="../typings/eventsource.d.ts" />
///<reference path="../typings/tsd.d.ts" />

import * as EventSource from "eventsource";

var request  = require("request");
var scheduler = require('node-schedule');

var spark = require('spark');
var util = require("util");
var Promise = require("bluebird");

var device_id = process.env.DEVICE_ID;
var access_token = process.env.ACCESS_TOKEN;

var url = "https://api.particle.io/v1/devices/" + device_id + "/led?access_token=" + access_token;
var url2 = "https://api.particle.io/v1/devices/" + device_id + "/light?access_token=" + access_token;

var surl = "https://api.particle.io/v1/devices/" + device_id + "/events/light?access_token=" + access_token;


var device;



export function schedule(hour, minute, cb) {
    return scheduler.scheduleJob({
        hour: hour,
        minute: minute,
        second: 0,
        dayOfWeek: new scheduler.Range(0, 6)
    }, cb);
}

// arg = "on" || "off"
export function setLight(arg) {
    return new Promise((resolve, reject) => {
        device.callFunction("setLight", arg, (err, data) => {
            if (err) {
                return reject(err);
            }
            if (data.connected) {
                if (data.return_value === 1) {
                    return resolve("on");
                }
                if (data.return_value === 0) {
                    return resolve("off");
                }
            }
            return reject("offline");
        });
    });
}

export function getLight() {
    return new Promise((resolve, reject) => {
        console.log('getting light variable');
        device.getVariable("light", (err, data) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            if (data.cmd == "VarReturn") {
                if (data.result === 1) {
                    return resolve("on");
                } else if (data.result === 0) {
                    return resolve("off");
                }
            }
            return reject("offline");
        });
    });
}



//export function createLightStream(cb) {
//    spark.getDevice(device_id, function(err, device) {
//        console.log('subscribing to ' + device.name);
//        device.subscribe(cb);
//    });
//}

export function login() {
    return spark.login({accessToken: access_token}).then((body) => {
        return spark.getDevice(device_id).then((d) => {
            console.log('got device: ' + d.name);
            console.log(' - last heard: ' + d.lastHeard);
            console.log(' - connected: ' + d.connected);
            device = d;
            setLight("on").then(console.log);
        });
    })
}

//setLight("off");
//startTimeJob([7,0,0],[18,0,0]);