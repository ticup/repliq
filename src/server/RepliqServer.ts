/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="../shared/references.d.ts" />

import * as Debug from "debug";
import * as http from "http";
import * as io from "socket.io";
import * as guid from "node-uuid";

import * as com from "../shared/Communication";
import {Repliq} from "../shared/Repliq";
import {ClientId} from "../shared/Types";
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

            socket.on("handshake", ({clientId, clientNr, serverNr}: com.HandshakeClient, reply) => {
                debug("handshaking");

                var newClient = false;
                var client = this.getClient(clientId);

                if (typeof client === "undefined") {
                    debug("client connects for first time");
                    newClient = true;
                    client = this.newClient(clientId, socket);
                } else {
                    client.socket = socket;
                }

                debug("received round: " + client.clientNr + " , current round: " + clientNr);

                this.setupHandlers(clientId, socket);

                if (!newClient && serverNr + 1 < this.getRoundNr()) {

                    let round = this.getRoundFrom(clientId, serverNr);
                    return socket.emit("handshake", <com.HandshakeServer>{lastClientNr: client.clientNr, lastServerNr: client.serverNr, round: round.toJSON()});
                }

                return socket.emit("handshake", <com.HandshakeServer>{lastClientNr: client.clientNr, lastServerNr: client.serverNr});
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

    setupHandlers(clientId: ClientId, socket: SocketIO.Socket) {
        socket.on("rpc", (rpc: com.RpcRequest, reply: Function) => {
            this.handleRpc(clientId, rpc.selector, rpc.args, reply);
        });
        socket.on("YieldPull", (json: RoundJSON) => {
            this.handleYieldPull(json);
        });
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
            this.confirmed.push(cur);
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
            this.confirmed.push(cRound);
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
            if (this.requiresPush(id, round)) {
                let client = this.getClient(id);
                let json = this.prepareToSend(id, round);
                debug("   -> to " + id);
                client.socket.emit("YieldPush", json);
            }
        });
    }


    requiresPush(id: ClientId, round: Round) {
        let client = this.clients[id];
        if (round.containsOrigin(id)) {
            return true;
        }

        let ops = round.operations.filter((op: Operation) => !!client.repliqIds[op.getTargetId()]);
        return ops.length > 0;
    }

    extendReferences(id: ClientId, round: Round) {
        let client = this.getClient(id);
        round.operations.forEach((op) => {
            if (client.repliqIds[op.targetId]) {
                op.getNewRepliqIds().forEach((rid) => this.addReference(id, rid));
            }
        });
    }

    // assumes requiresPush is checked first.
    prepareToSend(id: ClientId, round: Round): RoundJSON {
        let client = this.getClient(id);

        client.serverNr = round.getServerNr();
        this.extendReferences(id, round);
        let cround = round.copyFor(client.clientNr, this.getReferences(id));
        let json = cround.toJSON();
        console.assert(round.containsOrigin(id) || json.operations.length > 0);
        return json;
    }

    getRoundFrom(id: ClientId, roundNr: number) {
        let sround = new Round(this.getClient(id).clientNr, this.getId(), this.getRoundNr() - 1, []);
        if (roundNr + 1 == this.getRoundNr()) {
            return sround;
        }

        console.assert(this.confirmed.length == 0 || this.confirmed[this.confirmed.length - 1].getServerNr() == this.getRoundNr() - 1);
        console.assert(roundNr < this.getRoundNr());
        this.confirmed.forEach((round: Round) => {
            if (this.requiresPush(id, round)) {
                this.extendReferences(id, round);
                let cround = round.copyFor(-1, this.getReferences(id));
                sround.merge(cround);
            }
        });
        return sround;
    }

    getReferences(clientId: ClientId) {
        return Object.keys(this.clients[clientId].repliqIds);
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



    private getClient(clientId: ClientId) {
        return this.clients[clientId];
    }


    private newClient(clientId: ClientId, socket: SocketIO.Socket) {
        return this.clients[clientId] = {
            clientNr: -1,
            serverNr: -1,
            repliqIds: {},
            socket: socket
        };
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


