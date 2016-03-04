"use strict";
var schema_1 = require("../schema");
var express = require("express");
var RepliqServer_1 = require("../../../src/server/RepliqServer");
var port = process.env.PORT || 8000;
var app = express();
app.use(express.static(__dirname + '/../client/public'));
var hserv = app.listen(port);
var server = new RepliqServer_1.RepliqServer(hserv, { Message: schema_1.Message, MessageList: schema_1.MessageList });
var _lobby = schema_1.MessageList.create("general");
server.export({
    lobby: function () { return _lobby; },
});
console.log("Listening on " + port);
//# sourceMappingURL=index.js.map