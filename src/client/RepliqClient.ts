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

    onConnectP : Promise<any>;

    channel : SocketIOClient.Socket;

    serverNr : number = -1;

    incoming: Round[] = [];

    constructor(host: string, schema?: RepliqTemplateMap, yieldEvery?: number) {
        super(schema, yieldEvery);
        this.connect(host);
    }

    connect(host: string) {
        this.channel = io(host, {forceNew: true});
        this.handshake();
        return this.onConnectP;
    }

    setupYieldPush(channel: SocketIO.Socket) {
        channel.on("YieldPush", (round: RoundJSON) => this.handleYieldPull(round));
    }

    handshake() {
        this.channel.emit("handshake", <com.HandshakeClient>{clientId: this.getId(), clientNr: this.getRoundNr(), serverNr: this.serverNr});
        let d = Promise.defer();
        this.onConnectP = d.promise;
        this.channel.on("handshake", ({err, lastClientNr, lastServerNr, round}: com.HandshakeServer) => {
            if (err) {
                // Requires complete reset of the data
                throw err;
            }
            debug("handshaking... clientNr: " + this.getRoundNr() + " , server received clientNr: " + lastClientNr);

            if (round) {
                console.assert(lastClientNr <= this.getRoundNr());
                console.assert(lastServerNr <= this.getServerNr() || this.getServerNr() == -1);

                if (this.incoming.length > 0) {
                    this.yield();
                }
                this.incoming = [Round.fromJSON(round, this)];
                this.yield();

                this.pending.forEach((r:Round) => this.channel.emit("YieldPull", r.toJSON()));
            }
            this.setupYieldPush(this.channel);

            d.resolve();
        });
    }

    handleYieldPull(json: RoundJSON) {
        debug("YieldPull: received round");
        let round = Round.fromJSON(json, this);
        this.incoming.push(round);
        //this.notifyChanged();
    }

    onConnect() {
        return this.onConnectP;
    }

    send(selector: string, ...args: Object[]): Promise<any> {
        return this.onConnect().then(() => {
            return new Promise((resolve, reject) => {
                debug("sending rpc " + selector + "(" + args + ")");
                let rpc = <com.RpcRequest> {selector, args: args.map(com.toJSON)};
                this.channel.emit("rpc", rpc, (error:string, result:Object) => {
                    let ser = <com.ValueJSON> result;
                    debug("received rpc result for " + selector + "(" + args + ") : " + result);
                    if (error)
                        return reject(new Error(error));
                    resolve(com.fromJSON(ser, this));
                });
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

    // TODO: work with merging rounds, save id.

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

            let last = this.incoming[this.incoming.length - 1];

            // 1) reset to commit values
            this.forEachData((_, r:RepliqData) =>
                r.setToCommit());

            // 2) play all rounds
            let affectedExt = this.replay(this.incoming);

            // 3) remove pending rounds up to where it is confirmed
            let confirmedNr = last.getClientNr();
            this.pending = this.pending.filter((r: Round) => r.getClientNr() > confirmedNr);


            console.assert(this.serverNr <= last.getServerNr() || this.serverNr == -1);
            this.serverNr = last.getServerNr();

            // 4) recompute tentative state
            this.pending.forEach((round:Round) =>
                this.play(round));

            this.incoming = [];

            this.replaying = false;
            affectedExt.forEach((rep: Repliq) => { rep.emit(Repliq.CHANGE_EXTERNAL); rep.emit(Repliq.CHANGE)});
        }

    }


    getServerNr() {
        return this.serverNr;
    }

}