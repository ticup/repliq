"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var index_1 = require("../../src/shared/index");
var MessageList = (function (_super) {
    __extends(MessageList, _super);
    function MessageList() {
        _super.apply(this, arguments);
    }
    MessageList.prototype.init = function (name) {
        this.name = name;
        this.max = 20;
        this.items = index_1.List();
    };
    MessageList.prototype.add = function (item) {
        this.items = this.items.push(item);
    };
    return MessageList;
}(index_1.Repliq));
exports.MessageList = MessageList;
var Message = (function (_super) {
    __extends(Message, _super);
    function Message() {
        _super.apply(this, arguments);
    }
    Message.prototype.init = function (text) {
        this.text = text;
        this.sender = "";
        this.time = "";
    };
    return Message;
}(index_1.Repliq));
exports.Message = Message;
//# sourceMappingURL=schema.js.map