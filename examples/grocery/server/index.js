///<reference path="../../../src/server/references.d.ts" />
///<reference path="../../../typings/tsd.d.ts" />
///<reference path="../shared/schema.ts" />
var schema_1 = require("../shared/schema");
var express = require("express");
var RepliqServer_1 = require("../../../src/server/RepliqServer");
var app = express();
app.use(express.static(__dirname + '/../client'));
var hserv = app.listen(3000);
var server = new RepliqServer_1.RepliqServer(hserv, { Grocery: schema_1.Grocery, GroceryList: schema_1.GroceryList });
var groceries = server.create(schema_1.GroceryList);
groceries.call("add", server.create(schema_1.Grocery, { name: "peers", count: 10 }));
groceries.call("add", server.create(schema_1.Grocery, { name: "apples", count: 10 }));
console.log(groceries.getCommit("items"));
server.export({
    getGroceries: function () { return groceries; }
});
console.log("Listening on 3000");
//# sourceMappingURL=index.js.map