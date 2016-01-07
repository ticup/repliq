var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var ReactDOM = require('react-dom');
var Schema_1 = require('../shared/Schema');
var Time_1 = require('../../../src/shared/protocols/Time');
var index_1 = require("../../../src/client/index");
var client = new index_1.RepliqClient({ Status: Schema_1.Status, Time: Time_1.Time }, 1000);
var MainComponent = (function (_super) {
    __extends(MainComponent, _super);
    function MainComponent() {
        _super.apply(this, arguments);
    }
    MainComponent.prototype.render = function () {
        return (React.createElement("div", {"className": "ui one column stackable grid"}, React.createElement(TimeComponent, {"getTime": function () { return client.send("startTime"); }, "title": "Start Time"}), React.createElement(TimeComponent, {"getTime": function () { return client.send("endTime"); }, "title": "End Time"}), React.createElement(LightComponent, null)));
    };
    return MainComponent;
})(React.Component);
var TimeComponent = (function (_super) {
    __extends(TimeComponent, _super);
    function TimeComponent() {
        _super.apply(this, arguments);
        this.state = { time: Time_1.Time.stub() };
    }
    TimeComponent.prototype.componentDidMount = function () {
        var _this = this;
        this.props.getTime().then(function (time) {
            _this.setState({ time: time });
            time.on("change", function () {
                _this.setState({ time: time });
            });
        });
    };
    TimeComponent.prototype.submit = function () {
        var hour = ReactDOM.findDOMNode(this.refs["hour"]).valueAsNumber;
        var minutes = ReactDOM.findDOMNode(this.refs["minutes"]).valueAsNumber;
        this.state.time.setHour(hour);
        this.state.time.setMinutes(minutes);
        client.yield();
    };
    TimeComponent.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", {"className": "row"}, React.createElement("div", {"className": "column"}, React.createElement("h4", null, " ", this.props.title, " -- ", this.state.time.getHour(), ":", this.state.time.getMinutes(), "h"), React.createElement("div", {"className": "ui action left icon labeled input"}, React.createElement("i", {"className": "time icon"}), React.createElement("input", {"ref": "hour", "type": "text", "name": "Start Hour", "placeholder": "hour"}), React.createElement("input", {"ref": "minutes", "type": "text", "name": "Start Minute", "placeholder": "minutes"}), React.createElement("div", {"className": "ui teal button", "onClick": function (e) { return _this.submit(); }}, "Set!")))));
    };
    return TimeComponent;
})(React.Component);
var LightComponent = (function (_super) {
    __extends(LightComponent, _super);
    function LightComponent() {
        _super.apply(this, arguments);
        this.state = { status: Schema_1.Status.stub() };
    }
    LightComponent.prototype.componentDidMount = function () {
        var _this = this;
        client.send("status").then(function (status) {
            window["STATUS"] = status;
            _this.setState({ status: status });
            status.on("change", function () {
                _this.setState({ status: status });
            });
        });
    };
    LightComponent.prototype.switchLight = function () {
        var status = this.state.status;
        if (status.isOff()) {
            status.turnOn();
        }
        else if (status.isOn()) {
            status.turnOff();
        }
    };
    LightComponent.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", {"className": "row"}, React.createElement("div", {"className": "column"}, React.createElement("h4", null, "Status"), React.createElement("div", {"onClick": function (e) { return _this.switchLight(); }, "className": "ui " + (this.state.status.confirmed() ? "teal" : "red") + " button"}, this.state.status.getVal()))));
    };
    return LightComponent;
})(React.Component);
ReactDOM.render(React.createElement(MainComponent, null), document.getElementById('main'));
//# sourceMappingURL=index.js.map