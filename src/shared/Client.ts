/// <reference path="references.d.ts" />
/// <reference path="../../typings/tsd.d.ts" />

import {RepliqTemplate, Repliq} from "../shared/Repliq";

import * as guid from "node-uuid";

export class Client {
    private id : string;
    private templates;
    private repliqs;

    constructor() {
        this.id = guid.v4();
        this.templates = {};
        this.repliqs = {};
    }

    getId() {
        return this.id;
    }

    declare(template: RepliqTemplate) {
        this.templates[template.getId()] = template;
    }

    create(template: RepliqTemplate, args) {
        let repl = new Repliq(template, args, this.id);
        this.repliqs[repl.getId()] = repl;
        return repl;
    }

    getTemplate(id: string) {
        return this.templates[id];
    }
}