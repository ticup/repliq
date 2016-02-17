"use strict";
var exec = require("child_process").exec;
var fs = require("fs");

exec("tsc src/client/index.ts --module system --outFile build/client.js", function (out, err) {
    console.log(out);
    console.log(err);
});