///<reference path="../references.d.ts" />

import * as fs from "fs";

import {link, PrototypeMap} from "./Importer";
import {Tokens, NativeTypes} from "../../shared/Types";

//import {PrototypeDeclaration, FieldDeclaration, MethodDeclaration, ParameterDeclaration} from "./Ast";


export function analyse(filePath: string): Promise<PrototypeMap> {
    return link(filePath);
}