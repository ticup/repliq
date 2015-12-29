///<reference path="../../../src/shared/references.d.ts"/>
import {List, Repliq} from "../../../src/shared/index";

export class GroceryList extends Repliq {
    items = List();
    add(item) {
        var exists;
        let items = this.get('items');
        items.forEach((cur) => {
            if (cur.get("name") == item.get("name")) {
                cur.call("add", item.get("count"));
                exists = true;
            }
        });
        if (!exists)
            this.set("items", items.push(item));
    }
}


export class Grocery extends Repliq {
    name = "unnamed";
    count = 0;
    add(delta) {
        this.set("count", this.get("count") + delta);
    }
}