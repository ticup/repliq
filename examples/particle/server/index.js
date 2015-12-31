///<reference path="../../../src/server/references.d.ts" />
///<reference path="../../../typings/tsd.d.ts" />
///<reference path="../shared/Schema.ts" />
var Schema_1 = require("../shared/Schema");
var express = require("express");
var scripts = require("./script");
var RepliqServer_1 = require("../../../src/server/RepliqServer");
var app = express();
app.use(express.static('public'));
var hserv = app.listen(3000);
var server = new RepliqServer_1.RepliqServer(hserv, { Status: Schema_1.Status });
var _status = server.create(Schema_1.Status);
_status.on("changedExternal", function () {
    scripts.setLight(_status.get());
});
server.export({
    status: function () { return _status; }
});
console.log("Listening on 3000");
//# sourceMappingURL=index.js.map