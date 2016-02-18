(function (Tokens) {
    Tokens[Tokens["Plus"] = 0] = "Plus";
    Tokens[Tokens["PlusPlus"] = 1] = "PlusPlus";
    Tokens[Tokens["Minus"] = 2] = "Minus";
    Tokens[Tokens["Multiply"] = 3] = "Multiply";
    Tokens[Tokens["Division"] = 4] = "Division";
    Tokens[Tokens["SmallerThanOrEqual"] = 5] = "SmallerThanOrEqual";
    Tokens[Tokens["GreaterThanOrEqual"] = 6] = "GreaterThanOrEqual";
    Tokens[Tokens["GreaterThan"] = 7] = "GreaterThan";
    Tokens[Tokens["SmallerThan"] = 8] = "SmallerThan";
    Tokens[Tokens["EqualEqual"] = 9] = "EqualEqual";
    Tokens[Tokens["NotEqual"] = 10] = "NotEqual";
    Tokens[Tokens["Program"] = 11] = "Program";
    Tokens[Tokens["ImportStatement"] = 12] = "ImportStatement";
    Tokens[Tokens["PrototypeDeclaration"] = 13] = "PrototypeDeclaration";
    Tokens[Tokens["FieldDeclaration"] = 14] = "FieldDeclaration";
    Tokens[Tokens["MethodDeclaration"] = 15] = "MethodDeclaration";
    Tokens[Tokens["Identifier"] = 16] = "Identifier";
    Tokens[Tokens["StringLiteral"] = 17] = "StringLiteral";
    Tokens[Tokens["BooleanLiteral"] = 18] = "BooleanLiteral";
    Tokens[Tokens["NumericLiteral"] = 19] = "NumericLiteral";
    Tokens[Tokens["LetStatement"] = 20] = "LetStatement";
    Tokens[Tokens["IfStatement"] = 21] = "IfStatement";
    Tokens[Tokens["Operation"] = 22] = "Operation";
    Tokens[Tokens["FieldAccess"] = 23] = "FieldAccess";
    Tokens[Tokens["FieldAssignment"] = 24] = "FieldAssignment";
})(exports.Tokens || (exports.Tokens = {}));
var Tokens = exports.Tokens;
//# sourceMappingURL=Types.js.map