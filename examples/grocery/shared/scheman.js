///<reference path="../../../src/shared/references.d.ts"/>
import {List, Set, Repliq, sync} from "../../../src/shared/index";

let GroceryList = Repliq.define({
    keyName: "name",

    getGrocery(name: string) {
        var exists = this.get(name);
        if (exists)
            return exists;

        let grocery = Grocery.create({name});
        this.add(grocery);
        return grocery;
    }

});

export class Grocery extends Repliq {
    name = "unnamed";
    count = 0;

    add(delta) {
        this.set("count", this.get("count") + delta);
    }

    merge(item) {
        this.add(item.get("count"));
    }
}