
///<reference path="../schema.ts" />

import {MessageList, Message} from "../schema";
import * as express from "express";
import {RepliqServer} from "../../../src/server/RepliqServer";

let port = process.env.PORT || 8000;
let app = express();
app.use(express.static(__dirname + '/../client/public'));
let hserv = app.listen(port);



let server = new RepliqServer(hserv, {Message, MessageList});

/*
    Create the repliq instances
 */
let _lobby = MessageList.create("general");


server.export({
    lobby    : ()=> _lobby,
});

console.log("Listening on " + port);