var Promise = require("bluebird");
var Parse = require("./Parser");
var Types_1 = require("../../shared/Types");
var parse = Parse.parse;
var PrototypeDeclaration = (function () {
    function PrototypeDeclaration() {
    }
    return PrototypeDeclaration;
})();
var FieldDeclaration = (function () {
    function FieldDeclaration() {
    }
    return FieldDeclaration;
})();
var MethodDeclaration = (function () {
    function MethodDeclaration() {
    }
    return MethodDeclaration;
})();
var ParameterDeclaration = (function () {
    function ParameterDeclaration() {
    }
    return ParameterDeclaration;
})();
var BlockStatement = (function () {
    function BlockStatement() {
    }
    return BlockStatement;
})();
var Statement = (function () {
    function Statement() {
    }
    return Statement;
})();
function analyse(filePath) {
    return getPrototypes(filePath).then(function (prototypes) {
    });
}
exports.analyse = analyse;
function getPrototypes(filePath) {
    var prototypeMap = {};
    Promise.promisify(fs.readFile)(filePath).then(function (file) {
        var ast = parse(file.toString());
        ast.declarations.forEach(function (declaration) {
            var prototype = {};
            var name = filePath + "." + declaration.name;
            var prot = new PrototypeDeclaration(name);
        });
    });
}
function addImportNameToFileMap(fileMap) {
    Object.keys(fileMap).forEach(function (fileName) {
        fileMap[fileName].importMap = {};
        fileMap[fileName].imports.forEach(function (importStatement) {
            importStatement.names.forEach(function (importName) {
                fileMap[fileName].importMap[importName] = importStatement.path;
            });
        });
    });
}
function analyseDeclarations(fileAst, fileToAstMap) {
    return new Promise(function (resolve, reject) {
        var declarationMap = newDeclarationMap();
        fileAst.declarations.forEach(function (declaration) {
            declarationMap[declaration.name] = declaration;
            separateFieldsAndMethods(declaration).then(function () {
                declaration.fields.forEAch(function (field) {
                    var typeName = field.value;
                    var type = declarationMap[typeName];
                    if (!type) {
                        if (fileAst.importMap)
                            if (declarationMap[typeName]) {
                            }
                    }
                });
                declaration.methods.forEach(function (method) {
                });
            });
        });
        resolve(fileAst);
    });
}
function separateFieldsAndMethods(declaration) {
    return new Promise(function (resolve, reject) {
        declaration.fields = {};
        declaration.methods = {};
        Object.keys(declaration.properties).forEach(function (name) {
            var def = declaration.properties[name];
            if (def.type === Types_1.Tokens.FieldDeclaration) {
                declaration.fields[name] = def;
            }
            else if (def.type == Types_1.Tokens.MethodDeclaration) {
                declaration.methods[name] = def;
            }
            else {
                reject(new Error("expected Field or MethodDeclaration, given " + def.type));
            }
        });
        resolve(declaration);
    });
}
function newDeclarationMap() {
    var declarationMap = {};
    Object.keys(Types_1.NativeTypes).forEach(function (name) {
        return declarationMap[name] = Types_1.NativeTypes[name];
    });
    return declarationMap;
}
function analyseDeclaration(declaration) {
}
//# sourceMappingURL=Analyser.js.map