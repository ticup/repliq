///<reference path="../../../src/server/references.d.ts" />
///<reference path="../../../typings/tsd.d.ts" />
///<reference path="../shared/schema.ts" />

import {Grocery, GroceryList} from "../shared/schema";
import * as express from "express";
import {RepliqServer} from "../../../src/server/RepliqServer";
import {RepliqTemplateMap} from "../../../src/shared/RepliqManager";

let app = express();
app.use(express.static(__dirname + '/../client'));
let hserv = app.listen(3000);

let server = new RepliqServer(hserv, {Grocery, GroceryList});

let groceries = server.create(GroceryList);
groceries.call("add", server.create(Grocery, { name: "peers",  count: 10 }));
groceries.call("add", server.create(Grocery, { name: "apples", count: 10 }));

console.log(groceries.getCommit("items"));
//groceries.get('items').forEach((item) => console.log(item));
server.export({
    getGroceries: ()=> groceries
});

console.log("Listening on 3000");