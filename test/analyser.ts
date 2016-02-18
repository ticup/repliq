///<reference path="../src/server/references.d.ts"/>

import * as should from "should";

import parser = require("../src/server/analyser/parser");
import {Tokens} from "../src/shared/Types";

let parse = parser.parse;


function parseMethod(input) {
    return parse(input, {startRule: "MethodDeclaration"});
}


describe("parser", () => {

    describe("Method Only", () => {
        describe("Method Declaration", () => {
            it("should return an empty MethodDeclaration", () => {
                let ast = parseMethod("nop() { }");
                should.exist(ast);
                should.equal(ast.type, Tokens.MethodDeclaration);
                ast.body.should.be.an.Array;
                ast.body.length.should.equal(0);

                ast.params.should.be.an.Array;
                ast.params.length.should.equal(0);
            });
        });

        describe("Identifier", () => {
            it("should return an Identifier Node", () => {
                let ast = parseMethod("id() { foo }");
                should.exist(ast);
                let node = ast.body[0];
                node.type.should.equal(Tokens.Identifier);
                node.name.should.equal("foo");
            });
        });


        describe("Literals", () => {
            describe("number", () => {
                it("should return a number", () => {
                    let ast = parseMethod("nr() { 2 }");
                    should.exist(ast);
                    ast.body.length.should.equal(1);
                    ast.body[0].type.should.equal(Tokens.NumericLiteral);
                    ast.body[0].value.should.equal(2);
                });
            });

            describe("string", () => {
                it("should return a StringLiteral Node", () => {
                    let ast = parseMethod("nr() { \"foo\" }");
                    should.exist(ast);
                    ast.body.length.should.equal(1);
                    ast.body[0].type.should.equal(Tokens.StringLiteral);
                    ast.body[0].value.should.equal("foo");
                });
            });

            describe("boolean", () => {

                describe("true", () => {
                    it("should return a BooleanLiteral Node", () => {
                        let ast = parseMethod("nr() { true }");
                        should.exist(ast);
                        ast.body.length.should.equal(1);
                        ast.body[0].type.should.equal(Tokens.BooleanLiteral);
                        ast.body[0].value.should.equal(true);
                    });
                });

                describe("false", () => {
                    it("should return a BooleanLiteral Node", () => {
                        let ast = parseMethod("nr() { false }");
                        should.exist(ast);
                        ast.body.length.should.equal(1);
                        ast.body[0].type.should.equal(Tokens.BooleanLiteral);
                        ast.body[0].value.should.equal(false);
                    });
                });
            });
        });

        describe("Field Access", () => {
            it("should return a FieldAccess Node", () => {
                let ast = parseMethod("nr() { this.foo }");
                should.exist(ast);
                let fa = ast.body[0];
                fa.type.should.equal(Tokens.FieldAccess);
                fa.field.should.equal("foo");
            });
        });

        describe("Field Assignment", () => {
            it("should return a FieldAssignment Node", () => {
                let ast = parseMethod("nr() { this.foo = 2 }");
                should.exist(ast);
                let fa = ast.body[0];
                fa.type.should.equal(Tokens.FieldAssignment);
                fa.field.should.equal("foo");
                fa.value.type.should.equal(Tokens.NumericLiteral);
            });
        });

        describe("Operation", () => {
            describe("simple", () => {
                it("should return an Operation Node with an op, first and second", () => {
                    let ast = parseMethod("nr() { 1 + 2 }");
                    should.exist(ast);
                    let node = ast.body[0];
                    node.type.should.equal(Tokens.Operation);
                    node.op.should.equal(Tokens.Plus);
                    node.first.type.should.equal(Tokens.NumericLiteral);
                    node.second.type.should.equal(Tokens.NumericLiteral);
                });
            });

            describe("nested", () => {
                it("should return an Operation Node with an op, first and second", () => {
                    let ast = parseMethod("nr() { (1 + 2) + (2 + 1) }");
                    should.exist(ast);
                    let node = ast.body[0];
                    node.type.should.equal(Tokens.Operation);
                    node.op.should.equal(Tokens.Plus);
                    node.first.type.should.equal(Tokens.Operation);
                    node.second.type.should.equal(Tokens.Operation);
                });
            });
        });


        describe("let statement", () => {
            it("should return a LetStatement Node", () => {
                let ast = parseMethod("meth() { let x = 2 }");
                should.exist(ast);
                ast.body.length.should.equal(1);
                let node = ast.body[0];
                node.type.should.equal(Tokens.LetStatement);
                node.name.should.equal("x");
                node.value.type.should.equal(Tokens.NumericLiteral);
            });
        });


        describe("If statement", () => {
            it("should return a LetStatement Node", () => {
                let ast = parseMethod("meth() { if (x) { 2 } else { 3 } }");
                should.exist(ast);
                ast.body.length.should.equal(1);
                let node = ast.body[0];
                node.type.should.equal(Tokens.IfStatement);
                node.test.type.should.equal(Tokens.Identifier);
                node.consequence.length.should.equal(1);
                node.consequence[0].type.should.equal(Tokens.NumericLiteral);
                node.alternative.length.should.equal(1);
                node.alternative[0].type.should.equal(Tokens.NumericLiteral);
            });
        });
    });


    describe("import statements", () => {
        describe("import {Name} from \"foo\"", () => {
            it("should return an ImportStatements Node", () => {
                let ast = parse("import {Name} from \"foo\" ");
                should.exist(ast);
                ast.type.should.equal(Tokens.Program);
                ast.imports.length.should.equal(1);
                let imp1 = ast.imports[0];
                imp1.names.length.should.equal(1);
                imp1.names[0].should.equal("Name");
                imp1.path.should.equal("foo");
            });
        });

        describe("import {Name} from \"foo\" \n import{Foo, Bar} from \"bar\"", () => {
            it("should return an ImportStatements Node", () => {
                let ast = parse("import {Name} from \"foo\" \n import{Foo, Bar} from \"path/to/file\" ");
                should.exist(ast);
                ast.type.should.equal(Tokens.Program);
                ast.imports.length.should.equal(2);
                let imp1 = ast.imports[0];
                imp1.names.length.should.equal(1);
                imp1.names[0].should.equal("Name");
                imp1.path.should.equal("foo");
                let imp2 = ast.imports[1];
                imp2.names.length.should.equal(2);
                imp2.names[0].should.equal("Foo");
                imp2.names[1].should.equal("Bar");
                imp2.path.should.equal("path/to/file");
            });
        });
    });

});
