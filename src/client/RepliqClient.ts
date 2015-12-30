/// <reference path="../shared/references.d.ts" />
/// <reference path="../../typings/tsd.d.ts" />


import * as Debug from "debug";
import * as io from 'socket.io-client';
import * as Promise from "bluebird";

import * as com from "../shared/Communication";
import {RepliqManager} from "../shared/RepliqManager";

import {Repliq} from "../shared/Repliq";
import {RepliqData} from "../shared/RepliqData";
import {Round} from "../shared/Round";
import {Operation} from "../shared/Operation";
import {RepliqTemplateMap} from "../shared/RepliqManager";
let debug = Debug("Repliq:com:client");

export class RepliqClient extends RepliqManager {

    channel : SocketIOClient.Socket;

    incoming: Round[];

    constructor(host: string, schema?: RepliqTemplateMap) {
        this.channel = io(host, {forceNew: true});
        this.incoming = [];
        super(schema);
    }

    onConnect() {
        return new Promise((resolve) => {
            this.channel.on("connect", () => {
                debug("client connected");
                resolve(true);
            });
        })
    }

    send(selector: string, ...args: Object[]) {
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

    create(template: typeof Repliq, args) {
        let r = super.create(template, args);
        this.current.add(new Operation(undefined, "CreateRepliq", [template, r.getId()].concat(args)));
        return r;
    }

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
            this.incoming.forEach((round:Round) => {
                this.play(round);
                if (round.getOriginId() == this.getId()) {
                    this.pending = this.pending.slice(1);
                }
            });

            // 3) commit all tentative values
            this.forEachData((_, r:RepliqData) =>
                r.commitValues());

            // 4) recompute tentative state
            this.pending.forEach((round:Round) =>
                this.play(round));

            this.replaying = false;
        }
    }


}