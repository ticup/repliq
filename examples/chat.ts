
let discoveryHost = "x.x.x.x:2000"

let Message = Repliq.define({
    constructor(user, text) {
        this.user = user;
        this.text = text;
        this.date = Repliq.now();
    }
});

let Thread = Repliq.define(Models.SortedAddSet, {
    sortBy(msg) { msg.date },
    create(user, text) {
        this.add(Message.new(user, text));
    }
});

let Threads = Repliq.define(Models.Map);


// client


import RepliqClient = require("Repliq-client")

var client = new RepliqClient(host);

let Thread = Thread.stub();
let Retrieved = false;

chatP.send("join").then(thread) => {


})

function page() {
    <Root>
        <RetrievingComponent />
    </Root>
}







// server

import Server = require("Repliq")


let threads = Repliq.create(Threads);

let server = new Server(3001);

server.export({
    join(channel) {
        threads[channel]
    }
})