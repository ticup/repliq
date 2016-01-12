/// <reference path="../shared/references.d.ts" />
/// <reference path="../../typings/tsd.d.ts" />


import * as Debug from "debug";
import * as io from 'socket.io-client';
import * as Promise from "bluebird";

import * as com from "../shared/Communication";
import {RepliqManager} from "../shared/RepliqManager";

import {Repliq} from "../shared/Repliq";
import {RepliqData} from "../shared/RepliqData";
import {Round, RoundJSON} from "../shared/Round";
import {Operation} from "../shared/Operation";
import {RepliqTemplateMap} from "../shared/RepliqManager";
let debug = Debug("Repliq:com:client");

export class RepliqClient extends RepliqManager {

    onConnectP : Promise<boolean>;

    channel : SocketIOClient.Socket;

    serverNr : number = 0;

    incoming: Round[];

    constructor(host: string, schema?: RepliqTemplateMap, yieldEvery?: number) {
        super(schema, yieldEvery);
        this.channel = io(host, {forceNew: true});
        this.incoming = [];
        this.setupYieldPush();
        this.handshake();
    }

    setupYieldPush() {
        this.channel.on("YieldPush", (round: RoundJSON) => this.handleYieldPull(round));
    }

    handshake() {
        this.channel.emit("handshake", {clientId: this.getId(), clientNr: this.getRoundNr(), serverNr: this.serverNr});
    }

    handleYieldPull(json: RoundJSON) {
        debug("YieldPull: received round");
        let round = Round.fromJSON(json, this);
        this.incoming.push(round);
        //this.notifyChanged();
    }

    onConnect() {
        if (typeof this.onConnectP === "undefined") {
            this.onConnectP = new Promise<boolean>((resolve) => {
                this.channel.on("handshake", () => {
                    debug("handshaked");
                    resolve(true);
                });
            })
        }
        return this.onConnectP;
    }

    send(selector: string, ...args: Object[]): Promise<any> {
        return new Promise((resolve, reject) => {
            debug("sending rpc " + selector + "(" + args + ")");
            let rpc = <com.RpcRequest> {selector, args: args.map(com.toJSON)};
            this.channel.emit("rpc", rpc, (error: string, result: Object) => {
                let ser = <com.ValueJSON> result;
                debug("received rpc result for " + selector + "(" + args + ") : " + result);
                if (error)
                    return reject(new Error(error));
                resolve(com.fromJSON(ser, this));
            });
        });
    }

    stop() {
        this.channel.close();
    }

    //create(template: typeof Repliq, args) {
    //    let r = super.create(template, args);
    //    this.current.add(new Operation(r.getId(), Repliq.CREATE_SELECTOR, [template].concat(args)));
    //    return r;
    //}

    public yield() {
        // client->master yield
        if (this.current.hasOperations()) {
            let round = this.current;
            this.pending.push(round);
            this.current = this.newRound();
            debug("YieldPull: " + JSON.stringify(round.toJSON()));
            this.channel.emit("YieldPull", round.toJSON());
        }


        // master->client yield
        if (this.incoming.length > 0) {
            this.replaying = true;

            // 1) reset to commit values
            this.forEachData((_, r:RepliqData) =>
                r.setToCommit());

            // 2) play all rounds
            let affectedExt = this.replay(this.incoming);
            this.incoming.forEach((round:Round) => {
                if (round.getOriginId() == this.getId()) {
                    this.pending = this.pending.slice(1);
                }
            });


            // 3) recompute tentative state
            this.pending.forEach((round:Round) =>
                this.play(round));

            this.incoming = [];

            this.replaying = false;
            affectedExt.forEach((rep: Repliq) => { rep.emit(Repliq.CHANGE_EXTERNAL); rep.emit(Repliq.CHANGE)});
        }

    }


}