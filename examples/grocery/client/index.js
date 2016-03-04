var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require("react");
var ReactDOM = require("react-dom");
var index_1 = require("../../../src/client/index");
var schema_1 = require("../shared/schema");
var client = new index_1.RepliqClient(null, { Grocery: schema_1.Grocery, GroceryList: schema_1.GroceryList }, 1000);
var MainComponent = (function (_super) {
    __extends(MainComponent, _super);
    function MainComponent() {
        _super.apply(this, arguments);
        this.state = { groceries: null };
    }
    MainComponent.prototype.componentDidMount = function () {
        var _this = this;
        client.send("groceries").then(function (groceries) {
            _this.setState({ groceries: groceries });
        });
    };
    MainComponent.prototype.render = function () {
        var _this = this;
        if (this.state.groceries) {
            return (React.createElement("div", {"className": "container"}, React.createElement(GroceryListComponent, {"groceries": this.props.groceries}), React.createElement(NewGroceryComponent, {"addGrocery": function (name, count) {
                _this.props.groceries.call("add", client.create(schema_1.Grocery, { name: name, count: count }));
            }}), ";"));
        }
        return React.createElement(LoadingComponent, null);
    };
    return MainComponent;
})(React.Component);
var GroceryListComponent = (function (_super) {
    __extends(GroceryListComponent, _super);
    function GroceryListComponent() {
        _super.apply(this, arguments);
    }
    GroceryListComponent.prototype.render = function () {
        var items = this.props.groceries.get("items").map(function (grocery) {
            return React.createElement(GroceryComponent, {"key": grocery.getId(), "name": grocery.get("name"), "count": grocery.get("count")});
        });
        return (React.createElement("ul", {"className": 'list-group grocerylist'}, items));
    };
    return GroceryListComponent;
})(React.Component);
var GroceryComponent = (function (_super) {
    __extends(GroceryComponent, _super);
    function GroceryComponent() {
        _super.apply(this, arguments);
    }
    GroceryComponent.prototype.render = function () {
        return (React.createElement("li", {"className": 'list-group-item grocery-item'}, React.createElement("span", {"className": 'key-name'}, this.props.name), React.createElement("span", {"className": 'badge property-toBuy'}, this.props.count)));
    };
    return GroceryComponent;
})(React.Component);
var NewGroceryComponent = (function (_super) {
    __extends(NewGroceryComponent, _super);
    function NewGroceryComponent() {
        _super.apply(this, arguments);
    }
    NewGroceryComponent.prototype.render = function () {
        return (React.createElement("form", {"id": "newgroceryform", "role": "form", "className": "form-inline"}, React.createElement("div", {"className": "form-group"}, React.createElement("label", {"className": "sr-only"}, "Grocery name"), React.createElement("input", {"type": "text", "ref": "name", "placeholder": "Enter Grocery", "className": "form-control"})), React.createElement("div", {"className": "form-group"}, React.createElement("label", {"className": "sr-only"}, "Grocery quantity"), React.createElement("input", {"type": "text", "ref": "count", "placeholder": "Enter Quantity", "className": "form-control"})), React.createElement("div", {"className": "form-group"}, React.createElement("button", {"type": "submit", "className": "btn btn-primary form-control"}, "Add Grocery"))));
    };
    NewGroceryComponent.prototype.handleSubmit = function (e) {
        e.preventDefault();
        var name = this.refs["name"].value;
        var count = parseInt(this.refs["count"].value, 10);
        this.props.addGrocery(name, count);
        this.setState({ author: '', text: '' });
    };
    return NewGroceryComponent;
})(React.Component);
var LoadingComponent = (function (_super) {
    __extends(LoadingComponent, _super);
    function LoadingComponent() {
        _super.apply(this, arguments);
    }
    LoadingComponent.prototype.render = function () {
        React.createElement("div", {"class": "container"}, " Loading ... ");
    };
    return LoadingComponent;
})(React.Component);
client.send("getGroceries").then(function (groceries) {
    var comp = React.createElement(MainComponent, {"groceries": groceries});
    ReactDOM.render(comp, document.getElementById("main"));
    grocery.onChange(function () { return comp.forceUpdate(); });
});
//# sourceMappingURL=index.js.map