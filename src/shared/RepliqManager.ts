/// <reference path="references.d.ts" />
/// <reference path="../../typings/tsd.d.ts" />

import {RepliqTemplate, Repliq} from "./Repliq";
import {Operation} from "./Operation";
import {Round} from "./Round";
import * as Debug from "debug";
import * as guid from "node-uuid";
import {RepliqData} from "./RepliqData";
import {ClientId} from "./Types";

let debug = Debug("Repliq:local");

export interface RepliqDataIterator {
    (key: string, value: RepliqData): void;
}

export class RepliqManager {
    private id : ClientId;
    private templates;
    private repliqs;

    private repliqsData;

    private replaying : Repliq;

    private roundNr : number;

    protected current : Round;
    protected pending : Round[];
    protected confirmed : Round[];

    protected incoming : Round[];

    constructor() {
        this.id = guid.v4();
        this.roundNr = 0;
        this.templates = {};
        this.repliqs = {};
        this.repliqsData = {};
        this.current = this.newRound();
        this.pending = [];
        this.confirmed =[];
        this.incoming = [];
    }

    getId(): ClientId {
        return this.id;
    }

    forEachData(f:RepliqDataIterator) {
        Object.keys(this.repliqsData).forEach((key)=>f(key, this.repliqsData[key]));
    }

    declare(template: RepliqTemplate) {
        this.templates[template.getId()] = template;
    }

    create(template: RepliqTemplate, args) {
        let data = new RepliqData(template.defaults, args);
        let repl = new Repliq(template, data, this, this.id);
        this.repliqs[repl.getId()] = repl;
        this.repliqsData[repl.getId()] = data;
        return repl;
    }

    add(template: RepliqTemplate, args, id: string) {
        let data = new RepliqData(template.defaults, args);
        let repl = new Repliq(template, data, this, this.id, id);
        this.repliqs[repl.getId()] = repl;
        this.repliqsData[repl.getId()] = data;
        return repl;
    }

    getTemplate(id: string) {
        return this.templates[id];
    }

    getRepliq(id: string) {
        return this.repliqs[id];
    }

    getRepliqData(id: string) {
        return this.repliqsData[id];
    }


    call(repliq: Repliq, data: RepliqData, selector: string, args) {
        debug("calling " + selector + "(" + args + ")");
        let startReplay = false;
        let fun = (selector == "set") ? (() => { console.log('calling set'); data.setTentative(args[0], args[1])}) : repliq.getTemplate().getMethod(selector);
        if (!fun) {
            throw new Error("Undefined method " + selector + " in " + repliq);
        }
        if (this.replaying) {
            if (repliq !== this.replaying) {
                throw new Error("Cannot call repliq method from within another repliq method");
            }
        } else {
            startReplay = true;
            this.current.add(new Operation(repliq.getId(), selector, args));
            this.replaying = repliq;
        }
        let res = fun.apply(repliq, args);
        if (startReplay) {
            this.replaying = undefined;
        }
        return res;

    }

    execute(selector: string, args) {
        if (selector === "CreateRepliq") {
            var template = args[0];
            var id = args[1];
            debug("creating repliq with id " + id + "(" + args.slice(2) + " )");
            this.add(template, args[2], id);
        }
        else {
            return new Error(selector + " does not exist");
        }
    }

    protected play(round: Round) {
        debug("playing round " + round.getNr() + " (" + round.operations.length + ")");
        round.operations.forEach((op: Operation) => {
            debug(op.targetId + " . " + op.selector);
            if (op.targetId === undefined) {
                this.execute(op.selector, op.args)
            } else {
                this.call(this.getRepliq(op.targetId), this.getRepliqData(op.targetId), op.selector, op.args);
            }
        });
    }


    protected newRound() {
        return new Round(this.roundNr++, this.getId());
    }



}