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
    [id: number] : typeof Repliq;
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

    protected yielding : boolean;
    private yieldTimer : NodeJS.Timer;


    private templateIds: {[id: string]: number};


    constructor(schema?: RepliqTemplateMap, yieldEvery?: number) {
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
        this.templateIds = {};
        if (schema) {
            this.declareAll(schema);
        }
        if (yieldEvery)
            this.yieldEvery(yieldEvery);
    }

    getId(): ClientId {
        return this.id;
    }

    forEachData(f:RepliqDataIterator) {
        Object.keys(this.repliqsData).forEach((key)=>f(key, this.repliqsData[key]));
    }

    declare(template: typeof Repliq) {
        template.id = computeHash(template.prototype);
        this.templates[template.getId()] = template;
        this.templateIds[template.getId()] = 0;
        debug("declaring template with id " + template.id);
    }

    declareAll(templates: RepliqTemplateMap) {
        Object.keys(templates).forEach((key) => this.declare(templates[key]));
    }


    create(template: typeof Repliq, args = {})  {
        if (typeof this.getTemplate(template.getId()) == "undefined") {
            throw new Error("cannot create a repliq that is not declared ");
        }
        this.replaying = true;
        let data = new RepliqData(template.fields);
        let repl = new template(template, data, this, this.id);
        this.repliqs[repl.getId()] = repl;
        this.repliqsData[repl.getId()] = data;
        Object.keys(args).forEach((key) => {
            repl.set(key, args[key]);
        });
        data.commitValues();
        this.replaying = false;
        return repl;
    }

    add(template: typeof Repliq, args, id: string) {
        this.replaying = true;
        let data = new RepliqData(template.fields);
        let repl = new template(template, data, this, this.id, id);
        this.repliqs[repl.getId()] = repl;
        this.repliqsData[repl.getId()] = data;
        Object.keys(args).forEach((key) => {
            repl.set(key, args[key]);
        });
        data.commitValues();
        this.replaying = false;
        return repl;
    }

    getTemplate(id: number) {
        return this.templates[id];
    }

    getRepliq(id: string) {
        return this.repliqs[id];
    }

    getRepliqData(id: string) {
        return this.repliqsData[id];
    }

    getNextTemplateId(id: number) {
        console.assert(typeof this.templateIds[id] !== "undefined");
        let val = this.templateIds[id];
        this.templateIds[id] += 1;
        return val;
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
        let res = fun.apply(repliq, args);
        if (startReplay) {
            this.replaying = false;
            this.notifyChanged();
            repliq.emit(Repliq.CHANGE);
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


    protected notifyChanged() {
    }


    // Yield Periodic Mode
    // Propagates changes periodically, when yield is called.
    yieldEvery(ms: number) {
        if (this.yieldTimer)
            this.stopYielding();
        this.yieldTimer = setInterval(() => this.yield(), ms);
    }

    stopYielding() {
        if (this.yieldTimer) {
            clearInterval(this.yieldTimer);
        }
    }

    yield() { throw Error("should be implemented by client/server"); }


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
    //return obj.constructor.name;
    let str = Object.keys(obj).reduce((acc, key) => (obj.hasOwnProperty(key) ? (acc + key + obj[key].toString()) : ""), "");
    return computeHashString(str);
}