var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
///<reference path="../../../src/shared/references.d.ts"/>
var index_1 = require("../../../src/shared/index");
var GroceryList = (function (_super) {
    __extends(GroceryList, _super);
    function GroceryList() {
        _super.apply(this, arguments);
        this.items = index_1.List();
    }
    GroceryList.prototype.add = function (item) {
        var exists;
        var items = this.get('items');
        items.forEach(function (cur) {
            if (cur.get("name") == item.get("name")) {
                cur.call("add", item.get("count"));
                exists = true;
            }
        });
        if (!exists)
            this.set("items", items.push(item));
    };
    return GroceryList;
})(index_1.Repliq);
exports.GroceryList = GroceryList;
var Grocery = (function (_super) {
    __extends(Grocery, _super);
    function Grocery() {
        _super.apply(this, arguments);
        this.name = "unnamed";
        this.count = 0;
    }
    Grocery.prototype.add = function (delta) {
        this.set("count", this.get("count") + delta);
    };
    return Grocery;
})(index_1.Repliq);
exports.Grocery = Grocery;
//# sourceMappingURL=schema.js.map