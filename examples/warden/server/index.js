var Time_1 = require("../../../src/shared/protocols/Time");
var Schema_1 = require("../shared/Schema");
var express = require("express");
var scripts = require("./script");
var RepliqServer_1 = require("../../../src/server/RepliqServer");
var port = process.env.PORT || 3000;
var app = express();
app.use(express.static(__dirname + '/../client/public'));
var hserv = app.listen(port);
var server = new RepliqServer_1.RepliqServer(hserv, { Status: Schema_1.Status, Time: Time_1.Time });
var _status = server.create(Schema_1.Status, { value: "offline" });
var _startTime = server.create(Time_1.Time, { hour: 8, minutes: 0 });
var _endTime = server.create(Time_1.Time, { hour: 20, minutes: 0 });
_status.on("change", function () {
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
var startSchedule;
_startTime.on("change", function () {
    if (startSchedule)
        startSchedule.cancel();
    startSchedule = scripts.schedule(_startTime.getHour(), _startTime.getMinutes(), function () { return _status.turnOn(); });
});
var endSchedule;
_endTime.on("change", function () {
    if (endSchedule)
        endSchedule.cancel();
    endSchedule = scripts.schedule(_endTime.getHour(), _endTime.getMinutes(), function () { return _status.turnOff(); });
});
server.export({
    status: function () { return _status; },
    startTime: function () { return _startTime; },
    endTime: function () { return _endTime; }
});
console.log("Listening on " + port);
//# sourceMappingURL=index.js.map