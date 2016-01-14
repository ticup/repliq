/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="../shared/references.d.ts" />

import * as Debug from "debug";
import * as http from "http";
import * as io from "socket.io";
import * as guid from "node-uuid";

import * as com from "../shared/Communication";
import {Repliq} from "../shared/Repliq";
import {RepliqManager, RepliqTemplateMap} from "../shared/RepliqManager";
import {Listeners}  from "./Listeners";
import {OperationJSON} from "../shared/Operation";
import {Round, RoundJSON} from "../shared/Round";
import {Operation} from "../shared/Operation";
import {RepliqData} from "../shared/RepliqData";
import {getRepliqReferences} from "../shared/Communication";
let debug = Debug("Repliq:com:server");
let locald = Debug("Repliq:server");


export interface ServerOptions {
    port?: number;
    app?: http.Server;
    schema?: RepliqTemplateMap;
    yieldEvery?: number;
    manualPropagation?: boolean;
}

export function createServer(opts: ServerOptions) {
    return new RepliqServer(opts.port ? opts.port : opts.app, opts.schema, opts.yieldEvery, opts.manualPropagation);
}



export interface Api {
    [selector: string] : Function;
}

interface Clients {
    [id: string]: {
        clientNr: number;
        serverNr: number;
        repliqIds: RepliqIdSet;
        socket: SocketIO.Socket;
    };
}

interface RepliqIdSet {
    [id: string]: boolean;
}

export class RepliqServer extends RepliqManager {

    private channel: SocketIO.Server;
    private api: Api;
    private listeners: Listeners;

    private propagator : boolean;

    private clients: Clients = {};

    private requiresYield = false;

    // http server or port number, which will create its own http server.
    constructor(app?: http.Server | number, schema?: RepliqTemplateMap, yieldEvery?: number, manualPropagation?: boolean) {
        super(schema, yieldEvery);

        this.channel = io(app);
        //this.onConnect().then((socket: SocketIO.Socket) => {
        //    socket;
        //});
        this.channel.on("connect", (socket: SocketIO.Socket) => {
            debug("client connected");

            socket.on("handshake", ({clientId, clientRound, serverRound}) => {
                debug("handshaking");

                this.clients[clientId] = {
                    clientNr: -1,
                    serverNr: -1,
                    repliqIds: {},
                    socket: socket
                };

                //if (typeof rounds === "undefined") {
                //    return socket.emit("initiate");
                //}
                //
                //socket.emit("sync", {rounds.server, rounds.client, rounds: });

                socket.on("rpc", (rpc: com.RpcRequest, reply: Function) => {
                    this.handleRpc(clientId, rpc.selector, rpc.args, reply);
                });
                socket.on("YieldPull", (json: RoundJSON) => {
                    this.handleYieldPull(json);
                });

                socket.emit("handshake");
            });


        });
        this.channel.on("disconnect", (socket: SocketIO.Socket) => {
            debug("client disconnected");
        });
        this.channel.on("reconnect", (socket: SocketIO.Socket) => {
            debug("client reconnected");
        });
        this.listeners = new Listeners();


        this.propagator = !manualPropagation;
    }

    handleRpc(clientId: string, selector: string, sargs: com.ValueJSON[], reply: Function) {
        debug("received rpc " + selector + "(" + sargs + ")");
        if (!this.api) {
            return reply("No exported API: " + selector);
        }
        let handler = this.api[selector];
        if (!handler) {
            return reply("No compatible function for " + selector);
        }
        let args = sargs.map((a) => com.fromJSON(a, this));
        let result = handler.apply(this.api, args);
        let references = getRepliqReferences(result);
        references.forEach((ref) => this.addReference(clientId, ref));
        reply(null, com.toJSON(result));
    }

    handleYieldPull(json: RoundJSON) {
        debug("YieldPull: received round");
        let round = Round.fromJSON(json, this);
        this.incoming.push(round);
        this.notifyChanged();
    }



    yield() {
        console.assert(!this.yielding);
        this.yielding = true;
        locald("yielding");
        //var rounds = [];

        // master->client yield
        if (this.current.hasOperations()) {
            let cur = this.current;
            locald("- playing current round");
            this.replay([cur]); // TODO: actually, should just commit here!!
            this.broadcastRound(cur);
            this.current = this.newRound();
        }

        // client->master yield
        if (this.incoming.length > 0) {
            let cRound = this.current;
            let cRoundNr = this.current.getServerNr();
            locald("- adding incoming round");

            // Merge all incoming rounds in a server batch round
            this.incoming.forEach((round: Round) => {
                round.setServerNr(cRoundNr);
                let client = this.clients[round.getOriginId()];
                client.clientNr = round.getClientNr();
                cRound.merge(round);
                //rounds.push(round);
            });
            let affectedExt = this.replay(this.incoming);
            this.incoming.forEach((r) => {
                r.operations.forEach((op) => {
                    if (op.selector === Repliq.CREATE_SELECTOR) {
                        this.addReference(r.getOriginId(), op.targetId);
                    }
                });
            });
            this.broadcastRound(cRound);
            this.incoming = [];
            this.current = this.newRound();

            affectedExt.forEach((rep: Repliq) => { rep.emit(Repliq.CHANGE_EXTERNAL); rep.emit(Repliq.CHANGE) });
        }
        this.yielding = false;
        if (this.requiresYield) {
            this.requiresYield = false;
            this.yield();
        }

    }

    broadcastRound(round: Round) {
        let roundNr = round.getServerNr();
        debug("broadcasting round " + roundNr);
        Object.keys(this.clients).forEach((id) => {
            let client = this.clients[id];

            client.serverNr = roundNr;

            round.operations.forEach((op) => {
                if (client.repliqIds[op.targetId]) {
                    op.getNewRepliqIds().forEach((rid) => this.addReference(id, rid));
                }
            });

            let json = round.toJSON(Object.keys(client.repliqIds));
            json.clientNr = client.clientNr;

            if (round.containsOrigin(id) || json.operations.length > 0) {
                client.socket.emit("YieldPush", json);
            }
        });
    }

    // Yield Propagator Mode
    // Propagates changes instantly instead of waiting for yield.
    public notifyChanged() {
        if (this.propagator) {
            if (! this.yielding) {
                this.yield();
            } else {
                this.requiresYield = true;
            }
        }

    }






    protected newRound() {
        let nr = this.newRoundNr();
        return new Round(nr, this.getId(), nr);
    }


    stop() {
        this.channel.close();
    }

    addReference(clientId: string, repliqId: string) {
        this.clients[clientId].repliqIds[repliqId] = true;
    }

    export(api) {
        if (this.api) {
            throw new Error("Cannot export multiple objects");
        }
        this.api = api;
    }
}


