/// <reference path="../../typings/tsd.d.ts" />


interface ObjectToListenersMap {
    [objectId: string] : SocketIO.Socket[];
}

export class Listeners {
    private clients : ObjectToListenersMap;

    constructor() {
        this.clients = {};
    }
}