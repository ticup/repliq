///<reference path="../references.d.ts" />

import * as Promise from "bluebird";

import * as Parse from "./Parser";
import {getFileToAstMap} from "./Importer";
import {Tokens, NativeTypes} from "../../shared/Types";

let parse = Parse.parse;


class PrototypeDeclaration {

    constructor(
        public name: String,
        public path: String,
        public fields: FieldDeclaration[],
        public methods: MethodDeclaration[]
    )

}

class FieldDeclaration {
    constructor(
        public name: String,
        public type: ProtoType
    )
}

class MethodDeclaration {
    constructor(
        public name: String,
        public parameters: ParameterDeclaration[],
        public body: BlockStatement
    )
}

class ParameterDeclaration {
    constructor(
        name: String
    )
}

class BlockStatement {
    constructor(
        statements: Statement[]
    )
}

class Statement {

}

export function analyse(filePath: string): Promise {
    return getPrototypes(filePath).then((prototypes) => {

    });
    //return getFileToAstMap(file).then((fileMap) => {
    //    addImportNameToFileMap(fileMap).then((fileMap) => {
    //        analyseDeclarations(fileMap[file], fileMap)
    //    });
    //});
}

function getPrototypes(filePath: string) {
    let prototypeMap = {};
    Promise.promisify(fs.readFile)(filePath).then((file) => {
        let ast = parse(file.toString());
        ast.declarations.forEach((declaration) => {
            let prototype = {};
            let name = filePath + "." + declaration.name;
            let prot = new PrototypeDeclaration(name, )
        })
    });
}

//function getDeclarationMap(fileMap) {
//    let declarationMap = {};
//    Object.keys(fileMap).forEach((file) => {
//        let ast = fileMap[file];
//        ast.declarations.forEach((declaration) => {
//
//        })
//    })
//}


function addImportNameToFileMap(fileMap) {
    Object.keys(fileMap).forEach((fileName) => {
        fileMap[fileName].importMap = {};
        fileMap[fileName].imports.forEach((importStatement) => {
            importStatement.names.forEach((importName) => {
                fileMap[fileName].importMap[importName] = importStatement.path;
            });
        });
    });
}


function



function analyseDeclarations(fileAst, fileToAstMap) {
    return new Promise((resolve, reject) => {
        let declarationMap = newDeclarationMap();
        fileAst.declarations.forEach((declaration) => {
            declarationMap[declaration.name] = declaration;
            separateFieldsAndMethods(declaration).then(() => {
                declaration.fields.forEAch((field) => {
                    let typeName = field.value;
                    let type = declarationMap[typeName];
                    if (!type) {

                        if (fileAst.importMap)
                        if (declarationMap[typeName]) {

                        }
                    }
                });
                declaration.methods.forEach((method) => {

                });
            });
        });
        resolve(fileAst);
    });
}

function separateFieldsAndMethods(declaration) {
    return new Promise((resolve, reject) => {
        declaration.fields  = {};
        declaration.methods = {};
        Object.keys(declaration.properties).forEach((name) => {
            let def = declaration.properties[name];
            if (def.type === Tokens.FieldDeclaration) {
                declaration.fields[name] = def;
            } else if (def.type == Tokens.MethodDeclaration) {
                declaration.methods[name] = def;
            } else {
                reject(new Error("expected Field or MethodDeclaration, given " + def.type));
            }
        });
        resolve(declaration);
    });
}

function newDeclarationMap() {
    let declarationMap = {};
    Object.keys(NativeTypes).forEach((name) =>
        declarationMap[name] = NativeTypes[name]);
    return declarationMap;
}

function analyseDeclaration(declaration) {

}