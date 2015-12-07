/// <reference path="references.d.ts" />
/// <reference path="../../typings/tsd.d.ts" />

import {RepliqTemplate, Repliq} from "./Repliq";
import {Operation} from "./Operation";
import * as Debug from "debug";
import * as guid from "node-uuid";
import {RepliqData} from "./RepliqData";

let debug = Debug("Repliq:local");

export class RepliqManager {
    private id : string;
    private templates;
    private repliqs;

    private replaying : Repliq;

    private current;

    constructor() {
        this.id = guid.v4();
        this.templates = {};
        this.repliqs = {};
        this.current = [];
    }

    getId() {
        return this.id;
    }

    declare(template: RepliqTemplate) {
        this.templates[template.getId()] = template;
    }

    create(template: RepliqTemplate, args) {
        let repl = new Repliq(template, args, this.id, this);
        this.repliqs[repl.getId()] = repl;
        return repl;
    }

    add(template: RepliqTemplate, args, id: string) {
        let repl = new Repliq(template, args, this.id, this, id);
        this.repliqs[repl.getId()] = repl;
        return repl;
    }

    getTemplate(id: string) {
        return this.templates[id];
    }

    getRepliq(id: string) {
        return this.repliqs[id];
    }


    call(repliq: Repliq, data: RepliqData, sel: string, args) {
        debug("calling " + sel + "(" + args + ")");
        let fun = (sel == "set") ? (() => data.setTentative(args[0], args[1])) : repliq.getTemplate().getMethod(sel);
        if (!fun) {
            throw new Error("Undefined method " + sel + " in " + repliq);
        }
        if (this.replaying) {
            if (repliq !== this.replaying) {
                throw new Error("Cannot call repliq method from within another repliq method");
            }
        } else {
            this.current.push(new Operation(repliq, sel, args));
            this.replaying = repliq;
        }
        return fun.apply(repliq, args);
    }

}