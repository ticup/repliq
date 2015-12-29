"use strict";
//var sys = require('sys')
var exec = require('child_process').exec;
var fs = require("fs");
//var child;

fs.readdir("examples", function (err, examples) {
    if (err)
        return console.log(err);
    examples.forEach(function (example) {
        if (example.startsWith(".")) return;
        exec("browserify examples/"+example+"/client/index.js -o examples/"+example+"/client/index.min.js",  function (error, stdout, stderr) {
            if (error)
                return console.log(error);
            console.log(stdout);
            console.log(stderr);
        });
    });
});

