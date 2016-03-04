///<reference path="../src/server/references.d.ts"/>

import * as should from "should";
import * as fs from "fs";

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
                should.equal(ast.token, Tokens.MethodDeclaration);
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
                node.token.should.equal(Tokens.Identifier);
                node.name.should.equal("foo");
            });
        });


        describe("Literals", () => {
            describe("number", () => {
                it("should return a number", () => {
                    let ast = parseMethod("nr() { 2 }");
                    should.exist(ast);
                    ast.body.length.should.equal(1);
                    ast.body[0].token.should.equal(Tokens.NumericLiteral);
                    ast.body[0].value.should.equal(2);
                });
            });

            describe("string", () => {
                it("should return a StringLiteral Node", () => {
                    let ast = parseMethod("nr() { \"foo\" }");
                    should.exist(ast);
                    ast.body.length.should.equal(1);
                    ast.body[0].token.should.equal(Tokens.StringLiteral);
                    ast.body[0].value.should.equal("foo");
                });
            });

            describe("boolean", () => {

                describe("true", () => {
                    it("should return a BooleanLiteral Node", () => {
                        let ast = parseMethod("nr() { true }");
                        should.exist(ast);
                        ast.body.length.should.equal(1);
                        ast.body[0].token.should.equal(Tokens.BooleanLiteral);
                        ast.body[0].value.should.equal(true);
                    });
                });

                describe("false", () => {
                    it("should return a BooleanLiteral Node", () => {
                        let ast = parseMethod("nr() { false }");
                        should.exist(ast);
                        ast.body.length.should.equal(1);
                        ast.body[0].token.should.equal(Tokens.BooleanLiteral);
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
                fa.token.should.equal(Tokens.FieldAccess);
                fa.field.should.equal("foo");
            });
        });

        describe("Field Assignment", () => {
            it("should return a FieldAssignment Node", () => {
                let ast = parseMethod("nr() { this.foo = 2 }");
                should.exist(ast);
                let fa = ast.body[0];
                fa.token.should.equal(Tokens.FieldAssignment);
                fa.field.should.equal("foo");
                fa.value.token.should.equal(Tokens.NumericLiteral);
            });
        });

        describe("Operation", () => {
            describe("simple", () => {
                it("should return an Operation Node with an op, first and second", () => {
                    let ast = parseMethod("nr() { 1 + 2 }");
                    should.exist(ast);
                    let node = ast.body[0];
                    node.token.should.equal(Tokens.Operation);
                    node.op.should.equal(Tokens.Plus);
                    node.first.token.should.equal(Tokens.NumericLiteral);
                    node.second.token.should.equal(Tokens.NumericLiteral);
                });
            });

            describe("nested", () => {
                it("should return an Operation Node with an op, first and second", () => {
                    let ast = parseMethod("nr() { (1 + 2) + (2 + 1) }");
                    should.exist(ast);
                    let node = ast.body[0];
                    node.token.should.equal(Tokens.Operation);
                    node.op.should.equal(Tokens.Plus);
                    node.first.token.should.equal(Tokens.Operation);
                    node.second.token.should.equal(Tokens.Operation);
                });
            });
        });


        describe("let statement", () => {
            it("should return a LetStatement Node", () => {
                let ast = parseMethod("meth() { let x = 2 }");
                should.exist(ast);
                ast.body.length.should.equal(1);
                let node = ast.body[0];
                node.token.should.equal(Tokens.LetStatement);
                node.name.should.equal("x");
                node.value.token.should.equal(Tokens.NumericLiteral);
            });
        });


        describe("If statement", () => {
            it("should return a LetStatement Node", () => {
                let ast = parseMethod("meth() { if (x) { 2 } else { 3 } }");
                should.exist(ast);
                ast.body.length.should.equal(1);
                let node = ast.body[0];
                node.token.should.equal(Tokens.IfStatement);
                node.test.token.should.equal(Tokens.Identifier);
                node.consequence.length.should.equal(1);
                node.consequence[0].token.should.equal(Tokens.NumericLiteral);
                node.alternative.length.should.equal(1);
                node.alternative[0].token.should.equal(Tokens.NumericLiteral);
            });
        });
    });


    describe("import statements", () => {
        describe("import {Name} from \"foo\"", () => {
            it("should return an ImportStatements Node", () => {
                let ast = parse("import {Name} from \"foo\"");
                should.exist(ast);
                ast.token.should.equal(Tokens.Program);
                ast.imports.length.should.equal(1);
                let imp1 = ast.imports[0];
                imp1.names.length.should.equal(1);
                imp1.names[0].should.equal("Name");
                imp1.path.should.equal("foo");
            });
        });

        describe("import {Name} from \"foo\" \n import{Foo, Bar} from \"bar\"", () => {
            it("should return an ImportStatements Node", () => {
                let ast = parse("import {Name} from \"foo\" \n import{Foo, Bar} from \"path/to/file\"");
                should.exist(ast);
                ast.token.should.equal(Tokens.Program);
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

    describe("Prototype Declarations", () => {
        describe("let Foo = Repliq.extend({})", () => {
            it("should return an empty PrototypeDeclaration", () => {
                let ast = parse("let Foo = Repliq.extend({})");
                should.exist(ast);
                ast.imports.length.should.equal(0);
                ast.declarations.length.should.equal(1);
                let decl = ast.declarations[0];
                decl.token.should.equal(Tokens.PrototypeDeclaration);
                decl.name.should.equal("Foo");
                decl.super.should.equal("Repliq");
                decl.properties.length.should.equal(0);
            });
        });

        describe("let Foo = Repliq.extend({foo: String})", () => {
            it("should return a PrototypeDeclaration with a single FieldDeclaration", () => {
                let ast = parse("let Foo = Repliq.extend({foo: String})");
                should.exist(ast);
                ast.imports.length.should.equal(0);
                ast.declarations.length.should.equal(1);
                let decl = ast.declarations[0];
                decl.token.should.equal(Tokens.PrototypeDeclaration);
                decl.name.should.equal("Foo");
                decl.super.should.equal("Repliq");
                decl.properties.length.should.equal(1);
                decl.properties[0].token.should.equal(Tokens.FieldDeclaration);
                decl.properties[0].name.should.equal("foo");
                decl.properties[0].type.should.equal("String");
            });
        });

        describe("let Foo = Repliq.extend({foo: String, bar: Integer})", () => {
            it("should return a PrototypeDeclaration with two FieldDeclarations", () => {
                let ast = parse("let Foo = Repliq.extend({foo: String, bar: Integer})");
                should.exist(ast);
                ast.imports.length.should.equal(0);
                ast.declarations.length.should.equal(1);
                let decl = ast.declarations[0];
                decl.token.should.equal(Tokens.PrototypeDeclaration);
                decl.name.should.equal("Foo");
                decl.super.should.equal("Repliq");
                decl.properties.length.should.equal(2);
                decl.properties[0].token.should.equal(Tokens.FieldDeclaration);
                decl.properties[0].name.should.equal("foo");
                decl.properties[0].type.should.equal("String");
                decl.properties[1].token.should.equal(Tokens.FieldDeclaration);
                decl.properties[1].name.should.equal("bar");
                decl.properties[1].type.should.equal("Integer");
            });
        });


        describe("let Foo = Repliq.extend({foo() { 2 }})", () => {
            it("should return a PrototypeDeclaration with a MethodDeclaration", () => {
                let ast = parse("let Foo = Repliq.extend({foo() { 2 }})");
                should.exist(ast);
                ast.imports.length.should.equal(0);
                ast.declarations.length.should.equal(1);
                let decl = ast.declarations[0];
                decl.token.should.equal(Tokens.PrototypeDeclaration);
                decl.name.should.equal("Foo");
                decl.super.should.equal("Repliq");
                decl.properties.length.should.equal(1);
                decl.properties[0].token.should.equal(Tokens.MethodDeclaration);
                decl.properties[0].name.should.equal("foo");
            });
        });

        describe("let Foo = Repliq.extend({foo() { 2 }, bar() { 2 }})", () => {
            it("should return a PrototypeDeclaration with two MethodDeclarations", () => {
                let ast = parse("let Foo = Repliq.extend({foo() { 2 }, bar() { 2 }})");
                should.exist(ast);
                ast.imports.length.should.equal(0);
                ast.declarations.length.should.equal(1);
                let decl = ast.declarations[0];
                decl.token.should.equal(Tokens.PrototypeDeclaration);
                decl.name.should.equal("Foo");
                decl.super.should.equal("Repliq");
                decl.properties.length.should.equal(2);
                decl.properties[0].token.should.equal(Tokens.MethodDeclaration);
                decl.properties[0].name.should.equal("foo");
                decl.properties[1].token.should.equal(Tokens.MethodDeclaration);
                decl.properties[1].name.should.equal("bar");
            });
        });


        describe("let Foo = Repliq.extend({foo() { 2 }, bar() { 2 }})", () => {
            it("should return a PrototypeDeclaration with two MethodDeclarations", () => {
                let ast = parse("let Foo = Repliq.extend({foo() { 2 }, bar() { 2 }})");
                should.exist(ast);
                ast.imports.length.should.equal(0);
                ast.declarations.length.should.equal(1);
                let decl = ast.declarations[0];
                decl.token.should.equal(Tokens.PrototypeDeclaration);
                decl.name.should.equal("Foo");
                decl.super.should.equal("Repliq");
                decl.properties.length.should.equal(2);
                decl.properties[0].token.should.equal(Tokens.MethodDeclaration);
                decl.properties[0].name.should.equal("foo");
                decl.properties[1].token.should.equal(Tokens.MethodDeclaration);
                decl.properties[1].name.should.equal("bar");
            });
        });


        describe("let Foo = Repliq.extend({foo: String, bar: Integer, getFoo() { this.foo }, getBar() { this.bar }})", () => {
            it("should return a PrototypeDeclaration with two MethodDeclarations", () => {
                let ast = parse("let Foo = Repliq.extend({foo: String, bar: Integer, getFoo() { this.foo }, getBar() { this.bar }})");
                should.exist(ast);
                ast.imports.length.should.equal(0);
                ast.declarations.length.should.equal(1);
                let decl = ast.declarations[0];
                decl.token.should.equal(Tokens.PrototypeDeclaration);
                decl.name.should.equal("Foo");
                decl.super.should.equal("Repliq");

                decl.properties.length.should.equal(4);
                decl.properties[0].token.should.equal(Tokens.FieldDeclaration);
                decl.properties[0].name.should.equal("foo");
                decl.properties[0].type.should.equal("String");
                decl.properties[1].token.should.equal(Tokens.FieldDeclaration);
                decl.properties[1].name.should.equal("bar");
                decl.properties[1].type.should.equal("Integer");

                decl.properties[2].token.should.equal(Tokens.MethodDeclaration);
                decl.properties[2].name.should.equal("getFoo");
                decl.properties[3].token.should.equal(Tokens.MethodDeclaration);
                decl.properties[3].name.should.equal("getBar");
            });
        });

        describe("let Foo = Repliq.extend({foo: String, getFoo() { this.foo }, bar: Integer, getBar() { this.bar }})", () => {
            it("should return a PrototypeDeclaration with two MethodDeclarations", () => {
                let ast = parse("let Foo = Repliq.extend({foo: String, getFoo() { this.foo }, bar: Integer, getBar() { this.bar }})");
                should.exist(ast);
                ast.imports.length.should.equal(0);
                ast.declarations.length.should.equal(1);
                let decl = ast.declarations[0];
                decl.token.should.equal(Tokens.PrototypeDeclaration);
                decl.name.should.equal("Foo");
                decl.super.should.equal("Repliq");

                decl.properties.length.should.equal(4);
                decl.properties[0].token.should.equal(Tokens.FieldDeclaration);
                decl.properties[0].name.should.equal("foo");
                decl.properties[0].type.should.equal("String");
                decl.properties[2].token.should.equal(Tokens.FieldDeclaration);
                decl.properties[2].name.should.equal("bar");
                decl.properties[2].type.should.equal("Integer");

                decl.properties[1].token.should.equal(Tokens.MethodDeclaration);
                decl.properties[1].name.should.equal("getFoo");
                decl.properties[3].token.should.equal(Tokens.MethodDeclaration);
                decl.properties[3].name.should.equal("getBar");
            });
        });

    });

    describe("Import and Prototype", () => {
        describe("import {Name} from \"foo\"; \n import{Foo, Bar} from \"bar\"", () => {
            it("should return an ImportStatements Node", () => {
                let ast = parse("import {Name} from \"foo\" \n import{Foo, Bar} from \"path/to/file\" ");
                should.exist(ast);
                ast.token.should.equal(Tokens.Program);
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


    describe("stubs", () => {
        it("should successfully parse them", (done) => {
            Promise.promisify(fs.readdir)(__dirname + "/stubs").then((files) => {
                Promise.all(files.map((name) => {
                    Promise.promisify(fs.readFile)(__dirname + "/stubs/" + name).then((file) => {
                        console.log(file.toString());
                        let ast = parse(file.toString());
                        should.exist(ast);
                    });
                })).then(_ => done());
            });
        });
    });
});
