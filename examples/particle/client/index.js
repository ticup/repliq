///<reference path="../../../typings/tsd.d.ts" />
///<reference path="../shared/Schema.ts" />
///<reference path="../../../src/client/references.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var ReactDOM = require('react-dom');
var Schema_1 = require('../shared/Schema');
var index_1 = require("../../../src/client/index");
var client = new index_1.RepliqClient("localhost:3000", { Status: Schema_1.Status });
var MainComponent = (function (_super) {
    __extends(MainComponent, _super);
    function MainComponent() {
        _super.apply(this, arguments);
    }
    MainComponent.prototype.render = function () {
        return (React.createElement("div", {"className": "ui one column stackable grid"}, React.createElement(StartTimeComponent, null), React.createElement(StopTimeComponent, null), React.createElement(LightComponent, null)));
    };
    return MainComponent;
})(React.Component);
var StartTimeComponent = (function (_super) {
    __extends(StartTimeComponent, _super);
    function StartTimeComponent() {
        _super.apply(this, arguments);
    }
    StartTimeComponent.prototype.render = function () {
        return (React.createElement("div", {"className": "row"}, React.createElement("div", {"className": "column"}, React.createElement("h4", null, "Start Time"), React.createElement("div", {"className": "ui action left icon labeled input"}, React.createElement("i", {"className": "time icon"}), React.createElement("input", {"ref": "startHour", "type": "text", "name": "Start Hour", "placeholder": "hour..."}), React.createElement("input", {"ref": "startMinute", "type": "text", "name": "Start Minute", "placeholder": "minutes..."}), React.createElement("div", {"className": "ui teal button"}, "Set!")))));
    };
    return StartTimeComponent;
})(React.Component);
var StopTimeComponent = (function (_super) {
    __extends(StopTimeComponent, _super);
    function StopTimeComponent() {
        _super.apply(this, arguments);
    }
    StopTimeComponent.prototype.render = function () {
        return (React.createElement("div", {"className": "row"}, React.createElement("div", {"className": "column"}, React.createElement("h4", null, "End Time"), React.createElement("div", {"className": "ui action left icon input"}, React.createElement("i", {"className": "time icon"}), React.createElement("input", {"ref": "stopHour", "type": "text", "name": "Stop Hour", "placeholder": "hour..."}), React.createElement("input", {"ref": "stopMinute", "type": "text", "name": "Stop Minute", "placeholder": "minutes..."}), React.createElement("div", {"className": "ui teal button"}, "Set!")))));
    };
    return StopTimeComponent;
})(React.Component);
var LightComponent = (function (_super) {
    __extends(LightComponent, _super);
    function LightComponent() {
        _super.apply(this, arguments);
    }
    LightComponent.prototype.getInitialState = function () {
        return { status: Schema_1.Status.stub() };
    };
    LightComponent.prototype.componentDidMount = function () {
        var _this = this;
        client.send("status", function (status) {
            _this.setState({ status: status });
        });
    };
    LightComponent.prototype.switchLight = function () {
        var status = this.state.status;
        var val = status.getVal();
        if (val === "off") {
            status.on();
        }
        else if (val === "on") {
            status.off();
        }
    };
    LightComponent.prototype.render = function () {
        return (React.createElement("div", {"className": "row"}, React.createElement("div", {"className": "column"}, React.createElement("h4", null, "Status"), React.createElement("div", {"onClick": this.switchLight, "className": "ui teal button"}, this.state.status.getVal()))));
    };
    return LightComponent;
})(React.Component);
ReactDOM.render(React.createElement(MainComponent, null), document.getElementById('main'));
//# sourceMappingURL=index.js.map