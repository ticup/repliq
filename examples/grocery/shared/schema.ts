///<reference path="../../../src/shared/references.d.ts"/>
import {List, Set, Repliq, sync} from "../../../src/shared/index";

export class GroceryList extends Set {
    keyName = "name";
}

export class Grocery extends Repliq {
    name = "unnamed";
    count = 0;
    add(delta) {
        this.set("count", this.get("count") + delta);
    }
}