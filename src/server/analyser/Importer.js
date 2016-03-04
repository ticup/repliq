var fs = require("fs");
var Parse = require("./Parser");
var Importer_1 = require("./Importer");
var Types_1 = require("../../shared/Types");
var Ast_1 = require("./Ast");
var parse = Parse.parse;
function link(filePath) {
    return Importer_1.getFileToAstMap(filePath).then(function (fileMap) {
        return getPrototypeMap(filePath, fileMap);
    });
}
exports.link = link;
function getPrototypeMap(filePath, fileMap) {
    var prototypeMap = newPrototypeDeclarationMap();
    var fileAst = fileMap[filePath];
    fileAst.declarations.map(function (declaration) { return getPrototype(declaration, filePath, fileAst, fileMap, prototypeMap); });
    return prototypeMap;
}
function getPrototype(prototypeDeclaration, filePath, fileAst, fileMap, prototypeMap) {
    var name = filePath + "." + prototypeDeclaration.name;
    var fields = [];
    var methods = [];
    prototypeDeclaration.properties.forEach(function (property) {
        if (property.token === Types_1.Tokens.FieldDeclaration) {
            var type = getAndInstallType(fileAst, property.name, fileMap, prototypeMap);
            fields.push(new Ast_1.FieldDeclaration(property.name, type));
        }
        else if (property.token === Types_1.Tokens.MethodDeclaration) {
            var params = property.params.map(function (param) {
                var type = getAndInstallType(fileAst, property.name, fileMap, prototypeMap);
                return new Ast_1.ParameterDeclaration(param.name, type);
            });
            var method = new Ast_1.MethodDeclaration(property.name, params, property.body);
            methods.push(method);
        }
        else {
            throw new Error("unknown property in PrototypeDeclaration " + property.token);
        }
    });
    return new Ast_1.PrototypeDeclaration(name, filePath, fields, methods);
}
function getAndInstallType(fileAst, typeName, fileMap, prototypeMap) {
    var type = prototypeMap[typeName];
    if (!type) {
        type = getTypeFromImports(fileAst, type, fileMap, prototypeMap);
        prototypeMap[typeName] = type;
    }
    return type;
}
function getTypeFromImports(fileAst, type, fileMap, prototypeMap) {
    var importStatement = fileAst.imports.find(function (importStatement) { return importStatement.names.find(function (name) { return name === type; }); });
    if (!importStatement) {
        throw new Error("Can not find Prototype Type " + type);
    }
    var externFileAst = fileMap[importStatement.path];
    var prototypeDeclaration = externFileAst.declarations.find(function (decl) { return decl.name === type; });
    if (!prototypeDeclaration) {
        throw new Error("Can not find Prototype Type " + type + " in " + importStatement.path);
    }
    return getPrototype(prototypeDeclaration, importStatement.path, externFileAst, fileMap, prototypeMap);
}
function newPrototypeDeclarationMap() {
    var declarationMap = {};
    Object.keys(Types_1.NativeTypes).forEach(function (name) {
        return declarationMap[name] = Types_1.NativeTypes[name];
    });
    return declarationMap;
}
function getFileToAstMap(filePath) {
    var importMap = {};
    return loadImports([filePath], importMap).then(function () { return importMap; });
}
exports.getFileToAstMap = getFileToAstMap;
function loadImports(importFiles, importMap) {
    return Promise.all(importFiles.map(function (file) {
        if (importMap[file]) {
            return null;
        }
        return new Promise(function (reject, resolve) { return fs.readFile(file, function (err, res) { return err ? reject(err) : resolve(res); }); });
    })).then(function (files) {
        return files.map(function (file, idx) {
            if (file) {
                var ast = parse(file.toString());
                return loadImports(ast.imports.map(function (importStatement) { return importStatement.path; }), importMap).then(function () {
                    return importMap[importFiles[idx]] = ast;
                });
            }
        });
    });
}
exports.loadImports = loadImports;
//# sourceMappingURL=Importer.js.map