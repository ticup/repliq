export type ClientId = string;


export enum Tokens {
    Plus,
    PlusPlus,
    Minus,
    Multiply,
    Division,
    SmallerThanOrEqual,
    GreaterThanOrEqual,
    GreaterThan,
    SmallerThan,
    EqualEqual,
    NotEqual,

    Program,

    ImportStatement,
    PrototypeDeclaration,
    FieldDeclaration,
    MethodDeclaration,

    Identifier,
    StringLiteral,
    BooleanLiteral,
    NumericLiteral,

    LetStatement,
    IfStatement,
    Operation,

    FieldAccess,
    FieldAssignment

}


export let NativeTypes = {
    String: {},
    Intger: {},
    Boolean: {}
};