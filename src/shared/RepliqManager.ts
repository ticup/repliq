/// <reference path="references.d.ts" />
/// <reference path="../../typings/tsd.d.ts" />

import {Repliq} from "./Repliq";
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

export interface RepliqTemplateMap {
    [name: string] : typeof Repliq;
}

export class RepliqManager {
    private id : ClientId;
    private templates;
    private repliqs;

    private repliqsData;

    protected replaying : boolean;

    private roundNr : number;

    protected current : Round;
    protected pending : Round[];
    protected confirmed : Round[];

    protected incoming : Round[];

    constructor(schema?: RepliqTemplateMap) {
        this.id = guid.v4();
        this.roundNr = 0;
        this.templates = {};
        this.repliqs = {};
        this.repliqsData = {};
        this.current = this.newRound();
        this.pending = [];
        this.confirmed =[];
        this.incoming = [];
        this.replaying = false;
        if (schema) {
            this.declareAll(schema);
        }
    }

    getId(): ClientId {
        return this.id;
    }

    forEachData(f:RepliqDataIterator) {
        Object.keys(this.repliqsData).forEach((key)=>f(key, this.repliqsData[key]));
    }

    declare(template: typeof Repliq) {
        template.id = computeHash(template);
        this.templates[template.getId()] = template;
    }

    declareAll(templates: RepliqTemplateMap) {
        Object.keys(templates).forEach((key) => this.declare(templates[key]));
    }


    create(template: typeof Repliq, args = {})  {
        let data = new RepliqData(args);
        let repl = new template(template, data, this, this.id);
        this.repliqs[repl.getId()] = repl;
        this.repliqsData[repl.getId()] = data;
        return repl;
    }

    add(template: typeof Repliq, args, id: string) {
        let data = new RepliqData(args);
        let repl = new template(template, data, this, this.id, id);
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


    call(repliq: Repliq, data: RepliqData, selector: string, fun: Function, args) {
        debug("calling " + selector + "(" + args + ")");
        let startReplay = false;
        //var fun = repliq.getMethod(selector);
        //if (!fun) {
        //    throw new Error("Undefined method " + selector + " in " + repliq);
        //}
        //if (this.replaying) {
        //    if (repliq !== this.replaying) {
        //        throw new Error("Cannot call repliq method from within another repliq method");
        //    }
        //} else {
        if (!this.replaying) {
            startReplay = true;
            debug("recording " + selector +  "(" + args + ")");
            this.current.add(new Operation(repliq.getId(), selector, args));
            this.replaying = true;
        }
        let res = fun.apply(data, args);
        if (startReplay) {
            this.replaying = false;
            this.notifyChanged();
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

    protected replay(rounds: Round[]): Repliq[] {
        this.replaying = true;

        let affected = rounds.reduce((acc, round: Round) =>
            acc.concat(this.play(round)), []);

        this.forEachData((_, r: RepliqData) =>
            r.commitValues());

        this.replaying = false;
        return affected;
    }

    protected play(round: Round): Repliq[] {
        //debug("playing round " + round.getOriginNr() + " (" + round.operations.length + ")");
        let affected = [];
        round.operations.forEach((op: Operation) => {
            debug(op.targetId + " . " + op.selector);
            if (op.targetId === undefined) {
                this.execute(op.selector, op.args)
            } else {
                let rep = this.getRepliq(op.targetId);
                rep[op.selector].apply(rep, op.args);
                affected.push(rep);
            }
        });
        return affected;
    }


    protected newRound() {
        return new Round(this.newRoundNr(), this.getId());
    }

    protected newRoundNr() {
        return this.roundNr++;
    }


    public notifyChanged() {

    }


}


function computeHashString(str: string): number {
    var hash = 0, i, chr, len;
    if (str.length == 0) return hash;
    for (i = 0, len = str.length; i < len; i++) {
        chr   = str.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

function computeHash(obj: Object): number {
    let str = Object.keys(obj).reduce((acc, key) => Object.hasOwnProperty(key) ? (acc + key + obj[key].toString()) : "", "");
    return computeHashString(str);
}