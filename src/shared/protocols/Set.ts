///<reference path="../Repliq.ts" />

///<reference path="../references.d.ts" />
///<reference path="../../../typings/tsd.d.ts" />

import {Repliq, sync} from "../index";
import {Map} from "immutable"

export abstract class Set<T> extends Repliq {
    items = Map();

    @sync
    add(item) {
        var exists;
        let items = this.get('items');
        let key = item.get(this.get("keyName"));
        let existing = items.get(key);
        if (existing) {
            this.set("items", items.set(key, existing.merge(item)));
        } else {
            this.set("items", items.set(key, item));
        }
    }

    getItem(key: string) {
        return this.get("items").get(key);
    }

    merge(item: T) {

    }
}