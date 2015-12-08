/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="../shared/references.d.ts" />

import * as Debug from "debug";
import * as http from "http";
import * as io from "socket.io";
import * as guid from "node-uuid";

import * as com from "../shared/Communication";
import {RepliqTemplate, Repliq} from "../shared/Repliq";
import {RepliqManager} from "../shared/RepliqManager";
import {Listeners}  from "./Listeners";
import {OperationJSON} from "../shared/Operation";
import {Round, RoundJSON} from "../shared/Round";
import {Operation} from "../shared/Operation";
import {RepliqData} from "../shared/RepliqData";
let debug = Debug("Repliq:com:server");
let locald = Debug("Repliq:server");

export interface Api {
    [selector: string] : Function;
}

export class RepliqServer extends RepliqManager {

    private channel: SocketIO.Server;
    private api: Api;
    private listeners: Listeners;

    // http server or port number, which will create its own http server.
    constructor(app?: http.Server | number) {
        this.channel = io(app);
        //this.onConnect().then((socket: SocketIO.Socket) => {
        //    socket;
        //});
        this.channel.on("connect", (socket: SocketIO.Socket) => {
            debug("client connected");
            socket.on("rpc", (rpc: com.RpcRequest, reply: Function) => {
                this.handleRpc(rpc.selector, rpc.args, reply);
            });
            socket.on("YieldPull", (json: RoundJSON) => {
                this.handleYieldPull(json);
            });
        });
        this.channel.on("disconnect", (socket: SocketIO.Socket) => {
            debug("client disconnected");
        });
        this.channel.on("reconnect", (socket: SocketIO.Socket) => {
            debug("client reconnected");
        });
        this.listeners = new Listeners();

        super();
    }

    handleRpc(selector: string, sargs: com.ValueJSON[], reply: Function) {
        debug("received rpc " + selector + "(" + sargs + ")");
        if (!this.api) {
            return reply("No exported API");
        }
        let handler = this.api[selector];
        if (!handler) {
            return reply("No compatible function for " + selector);
        }
        let args = sargs.map((a) => com.fromJSON(a, this));
        let result = handler.apply(this.api, args);
        debug("result for rpc: " + result);
        reply(null, com.toJSON(result));
    }

    handleYieldPull(json: RoundJSON) {
        debug("received round");
        let round = Round.fromJSON(json, this);
        this.incoming.push(round);
    }

    yield() {
        locald("yielding");
        var rounds = [];
        // master->client yield
        if (this.current.hasOperations()) {
            locald("- adding current");
            rounds.push(this.current);
            this.current = this.newRound();
        }

        if (this.incoming.length > 0) {
            locald("- adding incoming");
            rounds = rounds.concat(this.incoming);
            this.incoming = [];
        }

        if (rounds.length > 0) {
            locald(rounds);
            rounds.forEach((round: Round) =>
                this.play(round));

            this.forEachData((_, r: RepliqData) =>
                r.commitValues());
        }
        rounds.forEach((round: Round) => this.broadcastRound(round));
    }

    broadcastRound(round: Round) {
        this.channel.emit("YieldPush", round.toJSON());
    }


    onConnect() {
        return new Promise((resolve) => {

        });
    }

    stop() {
        this.channel.close();
    }

    export(api) {
        if (this.api) {
            throw new Error("Cannot export multiple objects");
        }
        this.api = api;
    }
}