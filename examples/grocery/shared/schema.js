var index_1 = require("../../../src/shared/index");
var GroceryList = HashMap.extend({
    keyName: String,
    getGrocery: function (name) {
        var exists = this.get(name);
        if (exists) {
            return exists;
        }
        var grocery = Grocery.create({ name: name });
        this.put(grocery);
        return grocery;
    }
});
var Grocery = index_1.Repliq.extend({
    name: String,
    count: number,
    constructor: function (name) {
        this.name = name;
        this.count = 0;
    },
    add: function (delta) {
        this.count = this.count + delta;
    },
    merge: function (item) {
        this.add(item.count);
    }
});
//# sourceMappingURL=schema.js.map