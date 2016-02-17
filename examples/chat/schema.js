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
var index_1 = require("../../src/shared/index");
var MessageList = (function (_super) {
    __extends(MessageList, _super);
    function MessageList() {
        _super.apply(this, arguments);
        this.max = 20;
        this.items = index_1.List();
    }
    MessageList.prototype.add = function (item) {
        this.items = this.items.push(item);
    };
    __decorate([
        index_1.sync
    ], MessageList.prototype, "add", null);
    return MessageList;
})(index_1.Repliq);
exports.MessageList = MessageList;
var Message = (function (_super) {
    __extends(Message, _super);
    function Message() {
        _super.apply(this, arguments);
        this.text = "";
        this.sender = "";
        this.time = "";
    }
    return Message;
})(index_1.Repliq);
exports.Message = Message;
//# sourceMappingURL=schema.js.map