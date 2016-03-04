/// <reference path="../shared/references.d.ts" />
/// <reference path="../../typings/tsd.d.ts" />
import { RepliqManager } from "../shared/RepliqManager";
import { Round, RoundJSON } from "../shared/Round";
import { RepliqTemplateMap } from "../shared/RepliqManager";
export declare class RepliqClient extends RepliqManager {
    onConnectP: Promise<any>;
    channel: SocketIOClient.Socket;
    serverNr: number;
    incoming: Round[];
    constructor(host: string, schema?: RepliqTemplateMap, yieldEvery?: number);
    connect(host: string): Promise<any>;
    setupYieldPush(channel: SocketIOClient.Socket): void;
    handshake(): Promise<any>;
    handleYieldPull(json: RoundJSON): void;
    onConnect(): Promise<any>;
    send(selector: string, ...args: Object[]): Promise<any>;
    stop(): void;
    yield(): void;
    getServerNr(): number;
}
