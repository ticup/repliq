"use strict";
//var sys = require('sys')
var exec = require('child_process').exec;
var fs = require("fs");
//var child;

var opts = "--module commonjs --removeComments --preserveConstEnums --sourceMap --experimentalDecorators --target ES5";
var opts2 = "--module commonjs --removeComments --preserveConstEnums --sourceMap --target ES5";
var copts = opts + " --jsx react";

function compileAll() {
    fs.readdir("examples", function (err, examples) {
        if (err)
            return console.log(err);

        examples.forEach(function (example) {
            if (example.indexOf(".") === 0) return;

            compileClient(example);
            compileServer(example);
        });
    });
}

function compileClient(name) {
    var lib = "examples/"+name +"/";

    console.log("Compiling " + name + "/client ...");

    exec("tsc " + lib + "client/index.tsx " + copts,  function (error, stdout, stderr) {
        if (error)
            console.log(error);
        console.log(stdout);
        console.log(stderr);

        exec("browserify " + lib + "client/index.js --outfile " + lib + "client/public/bundle.js",  function (error, stdout, stderr) {
            if (error)
                console.log(error);
            console.log(stdout);
            console.log(stderr);
        });
    });
}

function compileServer(name) {
    var lib = "examples/"+name +"/";

    console.log("Compling " + name + "/server ...");

    exec("tsc " + lib + "server/index.ts " + opts, function (error, stdout, stderr) {
        if (error)
            console.log(error);
        console.log(stdout);
        console.log(stderr);
    });
}

if (process.argv.length > 2) {
    var example = process.argv[2];
    compileClient(example);
    compileServer(example);
} else {
    compileAll();
}