## Repliq Creation

        client.create(Repliq, arg1, arg2);

record into current by adding 

        let op = Operation {
            targetId: undefined,
            selector: "CREATE_REPLIQ",
            args: ["<id>", template, arg1, arg2]
        }
        current.push(op)
        
yield client:

        { serverNr: this.serverNr,
          clientNr: this.clientNr,
          originId: this.originId,
          operations: this.operations.map((op) => op.toJSON()) }
          
        op.toJSON():
        return {
            targetId: this.targetId,
            selector: this.selector,
            args: this.args.map((arg) => toJSON(arg))
        }
        
yield server, round.FromJSON():

        public static fromJSON(json: RoundJSON, manager: RepliqManager) {
            return new Round(
                json.clientNr,
                json.originId,
                json.serverNr,
                json.operations.map((op) => Operation.fromJSON(op, manager)));
        }
        
        Operation.fromJSON():
        return new Operation(
            json.targetId,
            json.selector,
            json.args.map((arg) => fromJSON(arg, manager))
        );

