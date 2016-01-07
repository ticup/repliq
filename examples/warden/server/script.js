///<reference path="../typings/eventsource.d.ts" />
///<reference path="../typings/tsd.d.ts" />
var request = require("request");
var schedule = require('node-schedule');
var spark = require('spark');
var util = require("util");
var Promise = require("bluebird");
var device_id = process.env.DEVICE_ID;
var access_token = process.env.ACCESS_TOKEN;
var url = "https://api.particle.io/v1/devices/" + device_id + "/led?access_token=" + access_token;
var url2 = "https://api.particle.io/v1/devices/" + device_id + "/light?access_token=" + access_token;
var surl = "https://api.particle.io/v1/devices/" + device_id + "/events/light?access_token=" + access_token;
var device;
function startTimeJob(start, end) {
    schedule.scheduleJob({
        hour: start[0],
        minute: start[1],
        second: start[2],
        dayOfWeek: new schedule.Range(0, 6)
    }, function () {
        setLight("on").then(function (err, val) { console.log(err); console.log(val); });
    });
    schedule.scheduleJob({
        hour: end[0],
        minute: end[1],
        second: end[2],
        dayOfWeek: new schedule.Range(0, 6)
    }, function () {
        setLight("off").then(function (err, val) { console.log(err); console.log(val); });
    });
}
function setLight(arg) {
    return new Promise(function (resolve, reject) {
        device.callFunction("setLight", arg, function (err, data) {
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
exports.setLight = setLight;
function getLight() {
    return new Promise(function (resolve, reject) {
        console.log('getting light variable');
        device.getVariable("light", function (err, data) {
            if (err) {
                console.log(err);
                return reject(err);
            }
            if (data.cmd == "VarReturn") {
                if (data.result === 1) {
                    return resolve("on");
                }
                else if (data.result === 0) {
                    return resolve("off");
                }
            }
            return reject("offline");
        });
    });
}
exports.getLight = getLight;
function login() {
    return spark.login({ accessToken: access_token }).then(function (body) {
        return spark.getDevice(device_id).then(function (d) {
            console.log('got device: ' + d.name);
            console.log(' - last heard: ' + d.lastHeard);
            console.log(' - connected: ' + d.connected);
            device = d;
            setLight("on").then(console.log);
        });
    });
}
exports.login = login;
//# sourceMappingURL=script.js.map