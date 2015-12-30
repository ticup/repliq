var request = require("request");
var schedule = require('node-schedule');
var device_id = process.env.DEVICE_ID;
var access_token = process.env.ACCESS_TOKEN;
var url = "https://api.particle.io/v1/devices/" + device_id + "/led?access_token=" + access_token;
var url2 = "https://api.particle.io/v1/devices/" + device_id + "/light?access_token=" + access_token;
function startTimeJob(start, end) {
    schedule.scheduleJob({
        hour: start[0],
        minute: start[1],
        second: start[2],
        dayOfWeek: new schedule.Range(0, 6)
    }, function () {
        setLight("on");
    });
    schedule.scheduleJob({
        hour: end[0],
        minute: end[1],
        second: end[2],
        dayOfWeek: new schedule.Range(0, 6)
    }, function () {
        setLight("off");
    });
}
function setLight(arg) {
    request.post({ url: url, form: { args: arg } }, function (err, response, body) {
        if (!err && response.statusCode == 200) {
            console.log(body);
        }
        else {
            console.log(err);
            console.log(response);
        }
    });
}
exports.setLight = setLight;
function getLight(finish) {
    request.get(url2, function (err, response, body) {
        if (!err && response.statusCode == 200) {
            console.log(body);
            return finish(body);
        }
        else {
            console.log(err);
            console.log(response);
        }
        return (finish(err));
    });
}
exports.getLight = getLight;
setLight("off");
//# sourceMappingURL=script.js.map