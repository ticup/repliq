"use strict";
var babel = require("babel-core");
var exec = require("child_process").exec;
var fs = require("fs");

exec("node_modules/typescript/bin/tsc src/client/index.ts --target es5", function (out, err) {
    console.log(out);
    console.log(err);
    if (!err) {
        exec("node_modules/.bin/browserify src/client/index.js -o build/client.js", function (out, err) {
            console.log(out);
            console.log(err);
        });
    }
});

exec("node_modules/typescript/bin/tsc src/shared/index.ts --target es5", function (out, err) {
    console.log(out);
    console.log(err);
    if (!err) {
        exec("node_modules/.bin/browserify src/shared/index.js -o build/shared.js", function (out, err) {
            console.log(out);
            console.log(err);
        });
    }
});