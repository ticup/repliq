
///<reference path="../../../src/server/references.d.ts" />
///<reference path="../../../typings/tsd.d.ts" />
///<reference path="../shared/Schema.ts" />
///<reference path="../../../src/shared/protocols/Time.ts"/>

import {Time} from "../../../src/shared/protocols/Time";
import {Status} from "../shared/Schema";
import * as express from "express";
import * as scripts from "./script";
import {RepliqServer} from "../../../src/server/RepliqServer";

let port = process.env.PORT || 3000;
let app = express();
app.use(express.static(__dirname + '/../client/public'));
let hserv = app.listen(port);

let server = new RepliqServer(hserv, {Status, Time});

/*
    Create the repliq instances
 */
let _status    = <Status>server.create(Status, {value: "offline"});
let _startTime = <Time>  server.create(Time  , {hour: 8, minutes: 0});
let _endTime   = <Time>  server.create(Time  , {hour: 20, minutes: 0});

/*
    Hook up the Status Repliq
 */

// repliq -> device
_status.on("change", () => {
    scripts.setLight(_status.getVal()).then((val) => {
        console.log("changed status to: " + val);
            console.assert(_status.getVal() == val);
    }, () =>_status.setVal("offline")); });

// setup initial repliq from device
scripts.login().then(() => {
    scripts.getLight().then((val) => {
        //console.log("setting status: " + val);
        _status.setVal(val);
    });
});


/*
    Hook up Time Repliqs
 */
let startSchedule;
_startTime.on("change",() => {
    if (startSchedule)
        startSchedule.cancel();

    startSchedule = scripts.schedule(_startTime.getHour(), _startTime.getMinutes(), () => _status.turnOn());
});

let endSchedule;
_endTime.on("change",() => {
    if (endSchedule)
        endSchedule.cancel();

    endSchedule = scripts.schedule(_endTime.getHour(), _endTime.getMinutes(), () => _status.turnOff());
});



server.export({
    status    : ()=> _status,
    startTime : ()=> _startTime,
    endTime   : ()=> _endTime
});

console.log("Listening on " + port);