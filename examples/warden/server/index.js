var Schema_1 = require("../shared/Schema");
var express = require("express");
var scripts = require("./script");
var RepliqServer_1 = require("../../../src/server/RepliqServer");
var app = express();
app.use(express.static(__dirname + '/../client/public'));
var hserv = app.listen(80);
var server = new RepliqServer_1.RepliqServer(hserv, { Status: Schema_1.Status });
var _status = server.create(Schema_1.Status);
_status.setVal("offline");
_status.on("change", function () {
    console.log("triggered change");
    scripts.setLight(_status.getVal()).then(function (val) {
        console.log("changed status to: " + val);
        console.assert(_status.getVal() == val);
    }, function () { return _status.setVal("offline"); });
});
scripts.login().then(function () {
    scripts.getLight().then(function (val) {
        _status.setVal(val);
    });
});
server.export({
    status: function () { return _status; }
});
console.log("Listening on 3000");
//# sourceMappingURL=index.js.map