export class PrototypeDeclaration {

    constructor(
        public name: String,
        public path: String,
        public fields: FieldDeclaration[],
        public methods: MethodDeclaration[]
    ) { }

}

export class FieldDeclaration {
    constructor(
        public name: String,
        public type: String
    ) { }
}

export class MethodDeclaration {
    constructor(
        public name: String,
        public parameters: ParameterDeclaration[],
        public body: BlockStatement
    ) { }
}

export class ParameterDeclaration {
    constructor(
        name: String,
        type: PrototypeDeclaration
    ) { }
}

export class BlockStatement {
    constructor(
        statements: Statement[]
    ) { }
}

export class Statement {

}