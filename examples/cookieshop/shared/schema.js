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
var CookieList = (function (_super) {
    __extends(CookieList, _super);
    function CookieList() {
        _super.apply(this, arguments);
    }
    CookieList.prototype.add = function (name, count, client) {
        var cookie = client.create(Cookie, { name: name, count: count });
        this.add;
    };
    return CookieList;
})(Set);
exports.CookieList = CookieList;
var Cookie = (function (_super) {
    __extends(Cookie, _super);
    function Cookie() {
        _super.apply(this, arguments);
        this.name = "unnamed";
        this.count = 0;
        this.defaultPrice = 0;
    }
    Cookie.prototype.adjust = function (delta) {
        this.set("count", this.get("count") + delta);
    };
    __decorate([
        sync
    ], Cookie.prototype, "adjust", null);
    return Cookie;
})(Repliq);
exports.Cookie = Cookie;
var Customer = (function (_super) {
    __extends(Customer, _super);
    function Customer() {
        _super.apply(this, arguments);
        this.name = "unnamed";
        this.cards = List();
        this.credit = 0;
    }
    return Customer;
})(Repliq);
exports.Customer = Customer;
//# sourceMappingURL=schema.js.map