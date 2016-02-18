var should = require("should");
var parser = require("../src/server/analyser/parser");
var Types_1 = require("../src/shared/Types");
var parse = parser.parse;
function parseMethod(input) {
    return parse(input, { startRule: "MethodDeclaration" });
}
describe("parser", function () {
    describe("Method Only", function () {
        describe("Method Declaration", function () {
            it("should return an empty MethodDeclaration", function () {
                var ast = parseMethod("nop() { }");
                should.exist(ast);
                should.equal(ast.type, Types_1.Tokens.MethodDeclaration);
                ast.body.should.be.an.Array;
                ast.body.length.should.equal(0);
                ast.params.should.be.an.Array;
                ast.params.length.should.equal(0);
            });
        });
        describe("Identifier", function () {
            it("should return an Identifier Node", function () {
                var ast = parseMethod("id() { foo }");
                should.exist(ast);
                var node = ast.body[0];
                node.type.should.equal(Types_1.Tokens.Identifier);
                node.name.should.equal("foo");
            });
        });
        describe("Literals", function () {
            describe("number", function () {
                it("should return a number", function () {
                    var ast = parseMethod("nr() { 2 }");
                    should.exist(ast);
                    ast.body.length.should.equal(1);
                    ast.body[0].type.should.equal(Types_1.Tokens.NumericLiteral);
                    ast.body[0].value.should.equal(2);
                });
            });
            describe("string", function () {
                it("should return a StringLiteral Node", function () {
                    var ast = parseMethod("nr() { \"foo\" }");
                    should.exist(ast);
                    ast.body.length.should.equal(1);
                    ast.body[0].type.should.equal(Types_1.Tokens.StringLiteral);
                    ast.body[0].value.should.equal("foo");
                });
            });
            describe("boolean", function () {
                describe("true", function () {
                    it("should return a BooleanLiteral Node", function () {
                        var ast = parseMethod("nr() { true }");
                        should.exist(ast);
                        ast.body.length.should.equal(1);
                        ast.body[0].type.should.equal(Types_1.Tokens.BooleanLiteral);
                        ast.body[0].value.should.equal(true);
                    });
                });
                describe("false", function () {
                    it("should return a BooleanLiteral Node", function () {
                        var ast = parseMethod("nr() { false }");
                        should.exist(ast);
                        ast.body.length.should.equal(1);
                        ast.body[0].type.should.equal(Types_1.Tokens.BooleanLiteral);
                        ast.body[0].value.should.equal(false);
                    });
                });
            });
        });
        describe("Field Access", function () {
            it("should return a FieldAccess Node", function () {
                var ast = parseMethod("nr() { this.foo }");
                should.exist(ast);
                var fa = ast.body[0];
                fa.type.should.equal(Types_1.Tokens.FieldAccess);
                fa.field.should.equal("foo");
            });
        });
        describe("Field Assignment", function () {
            it("should return a FieldAssignment Node", function () {
                var ast = parseMethod("nr() { this.foo = 2 }");
                should.exist(ast);
                var fa = ast.body[0];
                fa.type.should.equal(Types_1.Tokens.FieldAssignment);
                fa.field.should.equal("foo");
                fa.value.type.should.equal(Types_1.Tokens.NumericLiteral);
            });
        });
        describe("Operation", function () {
            describe("simple", function () {
                it("should return an Operation Node with an op, first and second", function () {
                    var ast = parseMethod("nr() { 1 + 2 }");
                    should.exist(ast);
                    var node = ast.body[0];
                    node.type.should.equal(Types_1.Tokens.Operation);
                    node.op.should.equal(Types_1.Tokens.Plus);
                    node.first.type.should.equal(Types_1.Tokens.NumericLiteral);
                    node.second.type.should.equal(Types_1.Tokens.NumericLiteral);
                });
            });
            describe("nested", function () {
                it("should return an Operation Node with an op, first and second", function () {
                    var ast = parseMethod("nr() { (1 + 2) + (2 + 1) }");
                    should.exist(ast);
                    var node = ast.body[0];
                    node.type.should.equal(Types_1.Tokens.Operation);
                    node.op.should.equal(Types_1.Tokens.Plus);
                    node.first.type.should.equal(Types_1.Tokens.Operation);
                    node.second.type.should.equal(Types_1.Tokens.Operation);
                });
            });
        });
        describe("let statement", function () {
            it("should return a LetStatement Node", function () {
                var ast = parseMethod("meth() { let x = 2 }");
                should.exist(ast);
                ast.body.length.should.equal(1);
                var node = ast.body[0];
                node.type.should.equal(Types_1.Tokens.LetStatement);
                node.name.should.equal("x");
                node.value.type.should.equal(Types_1.Tokens.NumericLiteral);
            });
        });
        describe("If statement", function () {
            it("should return a LetStatement Node", function () {
                var ast = parseMethod("meth() { if (x) { 2 } else { 3 } }");
                should.exist(ast);
                ast.body.length.should.equal(1);
                var node = ast.body[0];
                node.type.should.equal(Types_1.Tokens.IfStatement);
                node.test.type.should.equal(Types_1.Tokens.Identifier);
                node.consequence.length.should.equal(1);
                node.consequence[0].type.should.equal(Types_1.Tokens.NumericLiteral);
                node.alternative.length.should.equal(1);
                node.alternative[0].type.should.equal(Types_1.Tokens.NumericLiteral);
            });
        });
    });
    describe("import statements", function () {
        describe("import {Name} from \"foo\"", function () {
            it("should return an ImportStatements Node", function () {
                var ast = parse("import {Name} from \"foo\" ");
                should.exist(ast);
                ast.type.should.equal(Types_1.Tokens.Program);
                ast.imports.length.should.equal(1);
                var imp1 = ast.imports[0];
                imp1.names.length.should.equal(1);
                imp1.names[0].should.equal("Name");
                imp1.path.should.equal("foo");
            });
        });
        describe("import {Name} from \"foo\" \n import{Foo, Bar} from \"bar\"", function () {
            it("should return an ImportStatements Node", function () {
                var ast = parse("import {Name} from \"foo\" \n import{Foo, Bar} from \"path/to/file\" ");
                should.exist(ast);
                ast.type.should.equal(Types_1.Tokens.Program);
                ast.imports.length.should.equal(2);
                var imp1 = ast.imports[0];
                imp1.names.length.should.equal(1);
                imp1.names[0].should.equal("Name");
                imp1.path.should.equal("foo");
                var imp2 = ast.imports[1];
                imp2.names.length.should.equal(2);
                imp2.names[0].should.equal("Foo");
                imp2.names[1].should.equal("Bar");
                imp2.path.should.equal("path/to/file");
            });
        });
    });
});
//# sourceMappingURL=analyser.js.map