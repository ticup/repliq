///<reference path="../../src/shared/references.d.ts"/>

import {Repliq, sync, Register, List} from "../../src/shared/index";

export class MessageList extends Repliq {
    max = 20;
    items = List();

    @sync
    add(item) {
        //if (this.size() < max) {
        this.items = this.items.push(item);
        //}
    }

}

export class Message extends Repliq {
    text   = "";
    sender = "";
    time   = "";
}