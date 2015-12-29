
///<reference path="../../../src/server/references.d.ts" />
///<reference path="../../../typings/tsd.d.ts" />
///<reference path="../shared/Schema.ts" />

import {Status} from "../shared/Schema";
import * as express from "express";
import * as scripts from "./script";
import {RepliqServer} from "../../../src/server/RepliqServer";

let app = express();
app.use(express.static('public'));
let hserv = app.listen(3000);

let server = new RepliqServer(hserv, {Status});

let _status = server.create(Status);

server.export({
    status: ()=> _status
});

console.log("Listening on 3000");