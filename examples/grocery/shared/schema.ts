///<reference path="../../../src/shared/references.d.ts"/>
import {List, Set, Repliq} from "../../../src/shared/index";

let GroceryList = HashMap.extend({
    keyName: String,

    getGrocery(name: string) {
        let exists = this.get(name);
        if (exists) {
            return exists;
        }
        let grocery = Grocery.create({name});
        this.put(grocery);
        return grocery;
    }
});

let Grocery = Repliq.extend({
    name : String,
    count: number,

    constructor(name) {
        this.name = name;
        this.count = 0;
    },

    add(delta) {
        this.count = this.count + delta;
    },

    merge(item) {
        this.add(item.count);
    }
});