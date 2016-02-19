var Parser = require("./parser");
var fs = require("fs");
var Promise = require("bluebird");
var parse = Parser.parse;
function getFileToAstMap(file) {
    var importMap = {};
    return loadImports([file], importMap).then(function () { return importMap; });
}
exports.getFileToAstMap = getFileToAstMap;
function loadImports(importFiles, importMap) {
    return Promise.all(importFiles.map(function (file) {
        if (importMap[file]) {
            return null;
        }
        return Promise.promisify(fs.readFile)(file);
    })).then(function (files) {
        return files.map(function (file, idx) {
            var ast = parse(file.toString());
            return loadImports(ast.imports.map(function (importStatement) { return importStatement.path; }), importMap).then(function () {
                return importMap[importFiles[idx]] = ast;
            });
        });
    });
}
exports.loadImports = loadImports;
//# sourceMappingURL=Importer.js.map