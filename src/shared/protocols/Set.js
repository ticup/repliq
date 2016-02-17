var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var index_1 = require("../index");
var immutable_1 = require("immutable");
var Set = (function (_super) {
    __extends(Set, _super);
    function Set() {
        _super.apply(this, arguments);
        this.items = immutable_1.Map();
    }
    Set.prototype.add = function (item) {
        var exists;
        var items = this.get('items');
        var key = item.get(this.get("keyName"));
        var existing = items.get(key);
        if (existing) {
            this.set("items", items.set(key, existing.merge(item)));
        }
        else {
            this.set("items", items.set(key, item));
        }
    };
    Set.prototype.remove = function (item) {
        this.set('items', this.get('items').remove(item.get(this.get("keyName"))));
    };
    Set.prototype.getItem = function (key) {
        return this.get("items").get(key);
    };
    __decorate([
        index_1.sync
    ], Set.prototype, "add", null);
    __decorate([
        index_1.sync
    ], Set.prototype, "remove", null);
    return Set;
})(index_1.Repliq);
exports.Set = Set;
//# sourceMappingURL=Set.js.map