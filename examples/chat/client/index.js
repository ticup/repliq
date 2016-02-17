var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var ReactDOM = require('react-dom');
var schema_1 = require('../schema');
var index_1 = require("../../../src/client/index");
var client = new index_1.RepliqClient(null, { Message: schema_1.Message, MessageList: schema_1.MessageList }, 1000);
var MainComponent = (function (_super) {
    __extends(MainComponent, _super);
    function MainComponent() {
        _super.apply(this, arguments);
    }
    MainComponent.prototype.render = function () {
        return (React.createElement("div", {"className": "ui three column centered stackable grid"}, React.createElement("div", {"className": "ui column"}, React.createElement("div", {"className": "ui stackable vertically divided grid"}, React.createElement(MessageListComponent, {"getMessages": function () { return client.send("lobby"); }, "title": "Lobby"})))));
    };
    return MainComponent;
})(React.Component);
var MessageListComponent = (function (_super) {
    __extends(MessageListComponent, _super);
    function MessageListComponent() {
        _super.apply(this, arguments);
        this.state = { messages: schema_1.MessageList.stub() };
    }
    MessageListComponent.prototype.componentDidMount = function () {
        var _this = this;
        this.props.getMessages().then(function (messages) {
            _this.setState({ messages: messages });
            client.on("yield", function () {
                return _this.setState({ messages: messages });
            });
        });
    };
    MessageListComponent.prototype.render = function () {
        var _this = this;
        var items = this.state.messages.get("items").map(function (message) { return React.createElement(MessageComponent, {"message": message}); });
        return (React.createElement("div", null, React.createElement("div", {"className": "row"}, React.createElement("div", {"className": "ui list"}, items)), React.createElement(NewMessageComponent, {"sendMessage": function (text) { return _this.state.messages.add(schema_1.Message.create({ text: text })); }})));
    };
    return MessageListComponent;
})(React.Component);
var MessageComponent = (function (_super) {
    __extends(MessageComponent, _super);
    function MessageComponent() {
        _super.apply(this, arguments);
    }
    MessageComponent.prototype.render = function () {
        return (React.createElement("div", {"className": "item"}, React.createElement("div", null, this.props.message.get("text"))));
    };
    return MessageComponent;
})(React.Component);
var NewMessageComponent = (function (_super) {
    __extends(NewMessageComponent, _super);
    function NewMessageComponent() {
        _super.apply(this, arguments);
    }
    NewMessageComponent.prototype.submit = function () {
        var text = ReactDOM.findDOMNode(this.refs["text"]).value;
        this.props.sendMessage(text);
    };
    NewMessageComponent.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", {"className": "row"}, React.createElement("div", {"className": "column"}, React.createElement("div", {"className": "segment"}, React.createElement("div", {"className": "ui action left icon labeled input"}, React.createElement("i", {"className": "comment icon"}), React.createElement("input", {"ref": "text", "type": "text", "name": "Message", "placeholder": "say something..."}), React.createElement("div", {"className": "ui teal button", "onClick": function (e) { return _this.submit(); }}, "Set!"))))));
    };
    return NewMessageComponent;
})(React.Component);
ReactDOM.render(React.createElement(MainComponent, null), document.getElementById('main'));
//# sourceMappingURL=index.js.map