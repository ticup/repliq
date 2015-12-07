/// <reference path="../shared/references.d.ts" />
/// <reference path="../../typings/tsd.d.ts" />


import * as Debug from "debug";
import * as io from 'socket.io-client';
import * as Promise from "bluebird";

import * as com from "../shared/Communication";
import {RepliqManager} from "../shared/RepliqManager";

import {RepliqTemplate, Repliq} from "../shared/Repliq";
let debug = Debug("Repliq:com:client");

export class RepliqClient extends RepliqManager {

    channel : SocketIOClient.Socket;

    constructor(host: string) {
        this.channel = io(host, {forceNew: true});
        super();
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
            let rpc = <com.RpcRequest> {selector, args: args.map(com.serialize)};
            this.channel.emit("rpc", rpc, (error: string, result: Object) => {
                let ser = <com.SerializedObject> result;
                debug("received rpc result for " + selector + "(" + args + ") : " + result);
                if (error)
                    return reject(error);
                resolve(com.deserialize(ser, this));
            });
        });
    }

    stop() {
        this.channel.close();
    }
}