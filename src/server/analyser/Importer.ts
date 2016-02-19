///<reference path="./references.d.ts" />

import * as Parser from "./parser";
import * as fs from "fs";
import * as Promise from "bluebird";

let parse = Parser.parse;


export function getFileToAstMap(file:string ): Promise<Object> {
    let importMap = {};
    return loadImports([file], importMap).then(() => importMap);
}

export function loadImports(importFiles, importMap) {
    return Promise.all(importFiles.map((file) => {
        if (importMap[file]) {
            return null;
        }
        return Promise.promisify(fs.readFile)(file);
    })).then((files) =>
        files.map((file, idx) => {
            let ast = parse(file.toString());
            return loadImports(ast.imports.map((importStatement) => importStatement.path), importMap).then(() =>
                importMap[importFiles[idx]] = ast
            );
        })
    );
}