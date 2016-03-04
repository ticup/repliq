var PrototypeDeclaration = (function () {
    function PrototypeDeclaration(name, path, fields, methods) {
        this.name = name;
        this.path = path;
        this.fields = fields;
        this.methods = methods;
    }
    return PrototypeDeclaration;
})();
exports.PrototypeDeclaration = PrototypeDeclaration;
var FieldDeclaration = (function () {
    function FieldDeclaration(name, type) {
        this.name = name;
        this.type = type;
    }
    return FieldDeclaration;
})();
exports.FieldDeclaration = FieldDeclaration;
var MethodDeclaration = (function () {
    function MethodDeclaration(name, parameters, body) {
        this.name = name;
        this.parameters = parameters;
        this.body = body;
    }
    return MethodDeclaration;
})();
exports.MethodDeclaration = MethodDeclaration;
var ParameterDeclaration = (function () {
    function ParameterDeclaration(name, type) {
    }
    return ParameterDeclaration;
})();
exports.ParameterDeclaration = ParameterDeclaration;
var BlockStatement = (function () {
    function BlockStatement(statements) {
    }
    return BlockStatement;
})();
exports.BlockStatement = BlockStatement;
var Statement = (function () {
    function Statement() {
    }
    return Statement;
})();
exports.Statement = Statement;
//# sourceMappingURL=Ast.js.map