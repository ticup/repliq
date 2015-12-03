/// <reference path="../shared/references.d.ts" />
/// <reference path="../../typings/tsd.d.ts" />


import * as Debug from "debug";
import * as io from 'socket.io-client';
import * as com from "../shared/Communication";
import * as Promise from "bluebird";
import {RepliqTemplate, Repliq} from "../shared/Repliq";
import {guid} from "../shared/guid";

let debug = Debug("Repliq:com:client");

export class RepliqClient {

    private id : string;

    channel : SocketIOClient.Socket;

    repliqs : Object;


    constructor(host: string) {
        this.channel = io(host, {forceNew: true});
        this.repliqs = {};
        this.id = guid();
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
            let rpc = <com.RpcRequest> {selector, args: args.map(com.serialize)};
            debug("sending rpc " + selector + "(" + args + ")");
            this.channel.emit("rpc", rpc, (error: string, result: Object) => {
                let ser = <com.SerializedObject> result;
                debug("received rpc result for " + selector + "(" + args + ") : " + result);
                if (error)
                    return reject(error);
                resolve(com.deserialize(ser));
            });
        });
    }

    stop() {
        this.channel.close();
    }

    create(template: RepliqTemplate, args) {
        let repl = new Repliq(template, args, this.id);
        this.repliqs[repl.getId()] = repl;
        return replw;
    }
}