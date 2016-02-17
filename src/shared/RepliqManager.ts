/// <reference path="references.d.ts" />
/// <reference path="../../typings/tsd.d.ts" />

import {Repliq} from "./Repliq";
import {Operation} from "./Operation";
import {Round} from "./Round";
import * as Debug from "debug";
import * as guid from "node-uuid";
import {RepliqData} from "./RepliqData";
import {ClientId} from "./Types";
import {toJSON} from "./Communication";
import * as util from "util";
import {EventEmitter} from "events";

let debug = Debug("Repliq:local");

export interface RepliqDataIterator {
    (key: string, value: RepliqData): void;
}

export interface RepliqTemplateMap {
    [id: number] : typeof Repliq;
}

export class RepliqManager extends EventEmitter {
    private id : ClientId;
    private templates;
    private repliqs;

    private repliqsData;

    protected replaying : boolean;

    private roundNr : number;

    public current : Round;
    public pending : Round[];
    public confirmed : Round[];

    public incoming : Round[];

    protected yielding : boolean;
    private yieldTimer : NodeJS.Timer;


    private templateIds: {[id: string]: number};


    constructor(schema?: RepliqTemplateMap, yieldEvery?: number) {
        super();
        this.id = guid.v4();
        this.roundNr = -1;
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
        template.manager = this;
        debug("declaring template with id " + template.id);
    }

    declareAll(templates: RepliqTemplateMap) {
        Object.keys(templates).forEach((key) => this.declare(templates[key]));
    }


    create(template: typeof Repliq, args = {})  {
        if (typeof this.getTemplate(template.getId()) == "undefined") {
            throw new Error("cannot create a repliq that is not declared ");
        }

        // we have to put on replaying to not record what's in the constructor.
        let wasReplaying = this.replaying;
        this.replaying = true;
        let data = new RepliqData();
        let repl = new template(template, data, this, this.id);
        this.replaying = wasReplaying;
        this.repliqs[repl.getId()] = repl;
        this.repliqsData[repl.getId()] = data;
        Object.keys(args).forEach((key) => {
            repl.set(key, args[key]);
        });
        data.commitValues();
        if (!this.replaying)
            this.current.add(Operation.global(Repliq.CREATE_SELECTOR, (<Array<any>>[repl.getId(), template]).concat(args)));
        return repl;
    }

    add(template: typeof Repliq, args, id: string) {
        if (typeof this.getRepliq(id) !== "undefined") {
            return this.getRepliq(id);
        }
        let wasReplaying = this.replaying;
        this.replaying = true;
        let data = new RepliqData();
        let repl = new template(template, data, this, this.id, id);
        this.replaying = wasReplaying;
        this.repliqs[repl.getId()] = repl;
        this.repliqsData[repl.getId()] = data;
        Object.keys(args).forEach((key) => {
            repl.set(key, args[key]);
        });
        data.commitValues();
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

    getRoundNr() {
        return this.roundNr;
    }

    getNextTemplateId(id: number) {
        console.assert(typeof this.templateIds[id] !== "undefined");
        let val = this.templateIds[id];
        this.templateIds[id] += 1;
        return val;
    }


    call(repliq: Repliq, data: RepliqData, selector: string, fun: Function, args) {
        debug("calling " + selector + "(" + args.map((arg) => arg.toString()).join(", ") + ")");
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

    execute(selector: string, id: string, args) {
        if (selector === Repliq.CREATE_SELECTOR) {
            var template = args[0];
            debug("creating repliq with id " + id + "(" + args[1] + " )");
            this.add(template, args[1], id);
        }
        else {
            return new Error(selector + " does not exist");
        }
    }

    protected replay(rounds: Round[]): Repliq[] {
        this.replaying = true;

        rounds.forEach((r: Round) => this.play(r));

        this.commitValues();

        let affected = this.getAffectedIds(rounds);

        this.replaying = false;
        return affected.map((id) => this.getRepliq(id));
    }

    protected play(round: Round) {
        debug("playing round o:" + round.getClientNr() + " s: " + round.getServerNr());
        round.operations.forEach((op: Operation) => {
            debug(op.targetId + " . " + op.selector);
            if (!op.isMethodApplication()) {
                this.execute(op.selector, <string>op.args[0], op.args.slice(1));
            } else {
                let rep = this.getRepliq(op.targetId);
                rep[op.selector].apply(rep, op.args);
            }
        });
    }

    protected commitValues() {
        this.forEachData((_, r: RepliqData) =>
            r.commitValues());
    }

    protected getAffectedIds(rounds: Round[]): string[] {
        return rounds.reduce((acc, round: Round) =>
            acc.concat(round.operations.reduce((acc, op: Operation) =>
                op.isMethodApplication() ? acc.concat(op.targetId) : acc, [])), []);
    }


    protected newRound() {
        return new Round(this.newRoundNr(), this.getId());
    }

    protected newRoundNr() {
        return ++this.roundNr;
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

    yield() {
        this.emit("yield");
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
    //return obj.constructor.name;
    let str = Object.keys(obj).sort().reduce((acc, key) => (obj.hasOwnProperty(key) ? (acc + key + obj[key].toString()) : ""), "");
    return computeHashString(str);
}