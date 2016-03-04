///<reference path="./references.d.ts" />
import * as fs from "fs";

import * as Parse from "./Parser";
import {getFileToAstMap} from "./Importer";
import {Tokens, NativeTypes} from "../../shared/Types";

import {PrototypeDeclaration, FieldDeclaration, MethodDeclaration, ParameterDeclaration} from "./Ast";

let parse = Parse.parse;

export interface PrototypeMap {
    [id: string] : PrototypeDeclaration;
}

export function link(filePath: string): Promise<PrototypeMap> {
    return getFileToAstMap(filePath).then((fileMap) =>
        getPrototypeMap(filePath, fileMap));
}


function getPrototypeMap(filePath: string, fileMap) {
    let prototypeMap : PrototypeMap = newPrototypeDeclarationMap();
    let fileAst = fileMap[filePath];
    fileAst.declarations.map((declaration) => getPrototype(declaration, filePath, fileAst, fileMap, prototypeMap));
    return prototypeMap;
}


function getPrototype(prototypeDeclaration, filePath: string, fileAst, fileMap, prototypeMap): PrototypeDeclaration {
    let name = filePath + "." + prototypeDeclaration.name;
    let fields = [];
    let methods = [];

    prototypeDeclaration.properties.forEach((property) => {

        /* Field Declaration */
        if (property.token === Tokens.FieldDeclaration) {
            let type = getAndInstallType(fileAst, property.name, fileMap, prototypeMap);
            fields.push(new FieldDeclaration(property.name, type));

            /* Method Declaration */
        } else if (property.token === Tokens.MethodDeclaration) {
            let params = property.params.map((param) => {
                let type = getAndInstallType(fileAst, property.name, fileMap, prototypeMap);
                return new ParameterDeclaration(param.name, type);
            });
            let method = new MethodDeclaration(property.name, params, property.body);
            methods.push(method);
        } else {
            throw new Error("unknown property in PrototypeDeclaration " + property.token);
        }
    });

    return new PrototypeDeclaration(name, filePath, fields, methods);
}

function getAndInstallType(fileAst, typeName: string , fileMap, prototypeMap) {

    // The prototype is already parsed and defined
    var type = prototypeMap[typeName];

    // Load and parse from imports
    if (!type) {
        type = getTypeFromImports(fileAst, type, fileMap, prototypeMap);
        prototypeMap[typeName] = type;
    }

    return type;
}


function getTypeFromImports(fileAst, type, fileMap, prototypeMap: PrototypeMap) {
    // a) get import statement that imports given type name
    let importStatement = fileAst.imports.find((importStatement) => importStatement.names.find((name) => name === type));

    // X-> can not find given type name
    if (!importStatement) {
        throw new Error("Can not find Prototype Type " + type);
    }

    // b) get the ast of the file that comes with the import
    let externFileAst = fileMap[importStatement.path];

    // c) find the prototype declaration in that file
    let prototypeDeclaration = externFileAst.declarations.find((decl) => decl.name === type);

    //let prototypeDeclaration = getPrototypeDeclaration(filePath, param.type, fileMap);

    // X-> prototype declaration does not exist in given file (incorrect import statement)
    if (!prototypeDeclaration) {
        throw new Error("Can not find Prototype Type " + type + " in " + importStatement.path);
    }

    // d) recursively create AST for that declaration
    return getPrototype(prototypeDeclaration, importStatement.path, externFileAst, fileMap, prototypeMap);
}


function newPrototypeDeclarationMap() {
    let declarationMap : PrototypeMap = {};
    Object.keys(NativeTypes).forEach((name) =>
        declarationMap[name] = NativeTypes[name]);
    return declarationMap;
}



export function getFileToAstMap(filePath: string): Promise<Object> {
    let importMap = {};
    return loadImports([filePath], importMap).then(() => importMap);
}

export function loadImports(importFiles, importMap) {
    return Promise.all(importFiles.map((file) => {
        if (importMap[file]) {
            return null;
        }
        return new Promise((reject, resolve) => fs.readFile(file, (err, res) => err ? reject(err) : resolve(res)));
    })).then((files) =>
        files.map((file, idx) => {
            if (file) {
                let ast = parse(file.toString());
                return loadImports(ast.imports.map((importStatement) => importStatement.path), importMap).then(() =>
                    importMap[importFiles[idx]] = ast
                );
            }
        })
    );
}