///<reference path="../../src/shared/index" />

import {Repliq, List} from "../../src/shared/index";

export class MessageList extends Repliq {
    name: String;
    max: Number;
    items: List<Message>;

    init(name) {
        this.name = name;
        this.max = 20;
        this.items = List<Message>();
    }

    add(item) {
        //if (this.size() < max) {
        this.items = this.items.push(item);
        //}
    }

}

export class Message extends Repliq {
    text: String;
    sender: String;
    time: String;

    init(text) {
        this.text   = text;
        this.sender = "";
        this.time   = "";
    }
}