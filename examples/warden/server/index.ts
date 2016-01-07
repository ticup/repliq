
///<reference path="../../../src/server/references.d.ts" />
///<reference path="../../../typings/tsd.d.ts" />
///<reference path="../shared/Schema.ts" />

import {Status} from "../shared/Schema";
import * as express from "express";
import * as scripts from "./script";
import {RepliqServer} from "../../../src/server/RepliqServer";

let app = express();
app.use(express.static(__dirname + '/../client/public'));
let hserv = app.listen(8000);

let server = new RepliqServer(hserv, {Status});


/*
    Hook up the Status Repliq
 */
let _status = <Status>server.create(Status);
_status.setVal("offline");

// repliq -> device
_status.on("change", () => {
    console.log("triggered change");
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



server.export({
    status: ()=> _status
});

console.log("Listening on 3000");