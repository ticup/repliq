///<reference path="../../../typings/tsd.d.ts" />
///<reference path="../../../src/client/references.d.ts" />
///<reference path="../shared/schema.ts" />

import * as React from "react";
import * as ReactDOM from "react-dom";


import {RepliqClient, Repliq} from "../../../src/client/index";
import {Grocery, GroceryList} from "../shared/schema";

let client = new RepliqClient(null, {Grocery, GroceryList}, 1000);


class MainComponent extends React.Component<{groceries: GroceryList}, {}> {

    state = {groceries: null};

    componentDidMount() {
        client.send("groceries").then( groceries => {
            this.setState({groceries});
        });
    }

    render() {
        if (this.state.groceries) {
            return (
                <div className="container">
                    <GroceryListComponent groceries={this.props.groceries}/>
                    <NewGroceryComponent addGrocery={(name, count)=> {
                        this.props.groceries.call("add", client.create(Grocery, { name, count })); }} />;
                </div>
            );
        }
        return <LoadingComponent />;

    }
}

class GroceryListComponent extends React.Component<{groceries: Repliq}, {}> {
    render() {
        let items = this.props.groceries.get("items").map((grocery) =>
            <GroceryComponent
                key={grocery.getId()}
                name={grocery.get("name")}
                count={grocery.get("count")} /> );

        return (
            <ul className='list-group grocerylist'>
                { items }
            </ul>
        );
    }
}

class GroceryComponent extends React.Component<{key: string, name: string, count: number}, {}> {
    render() {
        return (
            <li className='list-group-item grocery-item'>
                <span className='key-name'>{this.props.name}</span>
                <span className='badge property-toBuy'>{this.props.count}</span>
            </li>
        );
    }
}

class NewGroceryComponent extends React.Component<{addGrocery(name:string, count:number) : void}, {}> {
    render() {
        return (
            <form id="newgroceryform" role="form" className="form-inline">
                <div className="form-group">
                    <label className="sr-only">Grocery name</label>
                    <input type="text" ref="name" placeholder="Enter Grocery" className="form-control" />
                </div>
                <div className="form-group">
                    <label className="sr-only">Grocery quantity</label>
                    <input type="text" ref="count" placeholder="Enter Quantity" className="form-control" />
                </div>
                <div className="form-group">
                    <button type="submit" className="btn btn-primary form-control">Add Grocery</button>
                </div>
            </form>
        );
    }

    handleSubmit(e) {
        e.preventDefault();
        let name = this.refs["name"].value;
        let count = parseInt(this.refs["count"].value, 10);
        this.props.addGrocery(name, count);
        this.setState({author: '', text: ''});
    }
}

class LoadingComponent extends React.Component<{}, {}> {
    render() {
        <div class="container"> Loading ... </div>
    }
}


client.send("getGroceries").then((groceries: Repliq) => {
    let comp = <MainComponent groceries={groceries}/>;
    ReactDOM.render(comp, document.getElementById("main"));
    grocery.onChange(() => comp.forceUpdate());
});
