/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="../shared/references.d.ts" />

import * as Debug from "debug";
import * as http from "http";
import * as io from "socket.io";
import * as com from "../shared/Communication";
import {RepliqTemplate, Repliq} from "../shared/Repliq";
import {Listeners}  from "./Listeners";
let debug = Debug("Repliq:com:server");
import {guid} from "../shared/guid";


export interface Api {
    [selector: string] : Function;
}

export class RepliqServer {
    private id: string;

    private channel: SocketIO.Server;
    private api: Api;
    private listeners: Listeners;

    repliqs : Object;

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
        });
        this.channel.on("disconnect", (socket: SocketIO.Socket) => {
            debug("client disconnected");
        });
        this.channel.on("reconnect", (socket: SocketIO.Socket) => {
            debug("client reconnected");
        });
        this.listeners = new Listeners();

        this.repliqs = {};
        this.id = guid();
    }

    handleRpc(selector: string, sargs: Object[], reply: Function) {
        debug("received rpc " + selector + "(" + sargs + ")");
        if (!this.api) {
            return reply("No exported API");
        }
        let handler = this.api[selector];
        if (!handler) {
            return reply("No compatible function for " + selector);
        }
        let args = sargs.map(com.deserialize);
        let result = handler.apply(this.api, args);
        debug("result for rpc: " + result);
        reply(null, com.serialize(result));
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

    create(template: RepliqTemplate, args) {
        let repl = new Repliq(template, args, this.id);
        this.repliqs[repl.getId()] = repl;
        return replw;
    }
}