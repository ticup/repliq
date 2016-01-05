
## Server Synchronization

### Periodic Yield Cycle

* Start server with a given ms as third argument
        
        new RepliqServer(app?: http.Server | number, schema?: RepliqTemplateMap, yieldCycle?: number)
        
e.g.

       new RepliqServer(app, schema, 200)
       
will yield every 200 milliseconds.

This can also be manually activated by using:

        server.yieldEvery(ms: number)
        


### External Change Propagation
If the yieldCycle argument is not given upon construction, changes will be automatically propagated when clients yield to the server.
Changes made on the server itself, i.e. by the server itself, will not propagated automatically and still require an explicit yield.

## Running with Debug Output

DEBUG="Repliq:*" node ...

