var discoveryHost = "x.x.x.x:2000";
var Message = Repliq.define({
    constructor: function (user, text) {
        this.user = user;
        this.text = text;
        this.date = Repliq.now();
    }
});
var Thread = Repliq.define(Models.SortedAddSet, {
    sortBy: function (msg) { msg.date; },
    create: function (user, text) {
        this.add(Message.new(user, text));
    }
});
var Threads = Repliq.define(Models.Map);
var RepliqClient = require("Repliq-client");
var client = new RepliqClient(host);
var Thread = Thread.stub();
var Retrieved = false;
chatP.send("join").then(thread);
{
}
function page() {
    />
        < /Root>;
}
var Server = require("Repliq");
var threads = Repliq.create(Threads);
var server = new Server(3001);
server.export({
    join: function (channel) {
        threads[channel];
    }
});
//# sourceMappingURL=chat.js.map