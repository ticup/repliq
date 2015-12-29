var request  = require("request");
var schedule = require('node-schedule');


var url = "https://api.particle.io/v1/devices/2f0018000b47343138333038/led?access_token=4271a4fb56926bfb628383aca8145c8cdebe2b30";
var url2 = "https://api.particle.io/v1/devices/2f0018000b47343138333038/light?access_token=4271a4fb56926bfb628383aca8145c8cdebe2b30";

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

// arg = "on" || "off"
export function setLight(arg) {
    request.post({url: url, form: {args: arg}}, function (err,response,body){
        if (!err && response.statusCode == 200) {
            console.log(body) // Show the HTML for the Google homepage.
        } else {
            console.log(err);
            console.log(response);
        }
    });
}

export function getLight(finish) {
    request.get(url2, function (err,response,body){
        if (!err && response.statusCode == 200) {
            console.log(body);
            return finish(body);
        } else {
            console.log(err);
            console.log(response);
        }
        return (finish(err));
    });
}

setLight("off");
//startTimeJob([7,0,0],[18,0,0]);