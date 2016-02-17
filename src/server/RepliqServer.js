var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Debug = require("debug");
var io = require("socket.io");
var com = require("../shared/Communication");
var Repliq_1 = require("../shared/Repliq");
var RepliqManager_1 = require("../shared/RepliqManager");
var Listeners_1 = require("./Listeners");
var Round_1 = require("../shared/Round");
var Communication_1 = require("../shared/Communication");
var debug = Debug("Repliq:com:server");
var locald = Debug("Repliq:server");
function createServer(opts) {
    return new RepliqServer(opts.port ? opts.port : opts.app, opts.schema, opts.yieldEvery, opts.manualPropagation);
}
exports.createServer = createServer;
var RepliqServer = (function (_super) {
    __extends(RepliqServer, _super);
    function RepliqServer(app, schema, yieldEvery, manualPropagation) {
        var _this = this;
        _super.call(this, schema, yieldEvery);
        this.clients = {};
        this.requiresYield = false;
        this.channel = io(app);
        this.channel.on("connect", function (socket) {
            debug("client connected");
            socket.on("handshake", function (_a, reply) {
                var clientId = _a.clientId, clientNr = _a.clientNr, serverNr = _a.serverNr;
                debug("handshaking");
                var newClient = false;
                var client = _this.getClient(clientId);
                if (typeof client === "undefined") {
                    debug("client connects for first time");
                    newClient = true;
                    client = _this.newClient(clientId, socket);
                }
                else {
                    client.socket = socket;
                }
                debug("received round: " + client.clientNr + " , current round: " + clientNr);
                _this.setupHandlers(clientId, socket);
                if (!newClient && serverNr + 1 < _this.getRoundNr()) {
                    var round = _this.getRoundFrom(clientId, serverNr);
                    return socket.emit("handshake", { lastClientNr: client.clientNr, lastServerNr: client.serverNr, round: round.toJSON() });
                }
                return socket.emit("handshake", { lastClientNr: client.clientNr, lastServerNr: client.serverNr });
            });
        });
        this.channel.on("disconnect", function (socket) {
            debug("client disconnected");
        });
        this.channel.on("reconnect", function (socket) {
            debug("client reconnected");
        });
        this.listeners = new Listeners_1.Listeners();
        this.propagator = !manualPropagation;
    }
    RepliqServer.prototype.setupHandlers = function (clientId, socket) {
        var _this = this;
        socket.on("rpc", function (rpc, reply) {
            _this.handleRpc(clientId, rpc.selector, rpc.args, reply);
        });
        socket.on("YieldPull", function (json) {
            _this.handleYieldPull(json);
        });
    };
    RepliqServer.prototype.handleRpc = function (clientId, selector, sargs, reply) {
        var _this = this;
        debug("received rpc " + selector + "(" + sargs + ")");
        if (!this.api) {
            return reply("No exported API: " + selector);
        }
        var handler = this.api[selector];
        if (!handler) {
            return reply("No compatible function for " + selector);
        }
        var args = sargs.map(function (a) { return com.fromJSON(a, _this); });
        var result = handler.apply(this.api, args);
        var references = Communication_1.getRepliqReferences(result);
        references.forEach(function (ref) { return _this.addReference(clientId, ref); });
        reply(null, com.toJSON(result));
    };
    RepliqServer.prototype.handleYieldPull = function (json) {
        debug("YieldPull: received round");
        var round = Round_1.Round.fromJSON(json, this);
        this.incoming.push(round);
        this.notifyChanged();
    };
    RepliqServer.prototype.yield = function () {
        var _this = this;
        console.assert(!this.yielding);
        this.yielding = true;
        locald("yielding");
        if (this.current.hasOperations()) {
            var cur = this.current;
            locald("- playing current round");
            this.replay([cur]);
            this.broadcastRound(cur);
            this.current = this.newRound();
            this.confirmed.push(cur);
        }
        if (this.incoming.length > 0) {
            var cRound = this.current;
            var cRoundNr = this.current.getServerNr();
            locald("- adding incoming round");
            this.incoming.forEach(function (round) {
                round.setServerNr(cRoundNr);
                var client = _this.clients[round.getOriginId()];
                client.clientNr = round.getClientNr();
                cRound.merge(round);
            });
            var affectedExt = this.replay(this.incoming);
            this.incoming.forEach(function (r) {
                r.operations.forEach(function (op) {
                    if (op.selector === Repliq_1.Repliq.CREATE_SELECTOR) {
                        _this.addReference(r.getOriginId(), op.targetId);
                    }
                });
            });
            this.broadcastRound(cRound);
            this.confirmed.push(cRound);
            this.incoming = [];
            this.current = this.newRound();
            affectedExt.forEach(function (rep) { rep.emit(Repliq_1.Repliq.CHANGE_EXTERNAL); rep.emit(Repliq_1.Repliq.CHANGE); });
        }
        this.yielding = false;
        _super.prototype.yield.call(this);
        if (this.requiresYield) {
            this.requiresYield = false;
            this.yield();
        }
    };
    RepliqServer.prototype.broadcastRound = function (round) {
        var _this = this;
        var roundNr = round.getServerNr();
        debug("broadcasting round " + roundNr);
        Object.keys(this.clients).forEach(function (id) {
            if (_this.requiresPush(id, round)) {
                var client = _this.getClient(id);
                var json = _this.prepareToSend(id, round);
                debug("   -> to " + id);
                client.socket.emit("YieldPush", json);
            }
        });
    };
    RepliqServer.prototype.requiresPush = function (id, round) {
        var client = this.clients[id];
        if (round.containsOrigin(id)) {
            return true;
        }
        var ops = round.operations.filter(function (op) { return !!client.repliqIds[op.getTargetId()]; });
        return ops.length > 0;
    };
    RepliqServer.prototype.extendReferences = function (id, round) {
        var _this = this;
        var client = this.getClient(id);
        round.operations.forEach(function (op) {
            if (client.repliqIds[op.targetId]) {
                op.getNewRepliqIds().forEach(function (rid) { return _this.addReference(id, rid); });
            }
        });
    };
    RepliqServer.prototype.prepareToSend = function (id, round) {
        var client = this.getClient(id);
        client.serverNr = round.getServerNr();
        this.extendReferences(id, round);
        var cround = round.copyFor(client.clientNr, this.getReferences(id));
        var json = cround.toJSON();
        console.assert(round.containsOrigin(id) || json.operations.length > 0);
        return json;
    };
    RepliqServer.prototype.getRoundFrom = function (id, roundNr) {
        var _this = this;
        var sround = new Round_1.Round(this.getClient(id).clientNr, this.getId(), this.getRoundNr() - 1, []);
        if (roundNr + 1 == this.getRoundNr()) {
            return sround;
        }
        console.assert(this.confirmed.length == 0 || this.confirmed[this.confirmed.length - 1].getServerNr() == this.getRoundNr() - 1);
        console.assert(roundNr < this.getRoundNr());
        this.confirmed.forEach(function (round) {
            if (_this.requiresPush(id, round)) {
                _this.extendReferences(id, round);
                var cround = round.copyFor(-1, _this.getReferences(id));
                sround.merge(cround);
            }
        });
        return sround;
    };
    RepliqServer.prototype.getReferences = function (clientId) {
        return Object.keys(this.clients[clientId].repliqIds);
    };
    RepliqServer.prototype.notifyChanged = function () {
        if (this.propagator) {
            if (!this.yielding) {
                this.yield();
            }
            else {
                this.requiresYield = true;
            }
        }
    };
    RepliqServer.prototype.getClient = function (clientId) {
        return this.clients[clientId];
    };
    RepliqServer.prototype.newClient = function (clientId, socket) {
        return this.clients[clientId] = {
            clientNr: -1,
            serverNr: -1,
            repliqIds: {},
            socket: socket
        };
    };
    RepliqServer.prototype.newRound = function () {
        var nr = this.newRoundNr();
        return new Round_1.Round(nr, this.getId(), nr);
    };
    RepliqServer.prototype.stop = function () {
        this.channel.close();
    };
    RepliqServer.prototype.addReference = function (clientId, repliqId) {
        this.clients[clientId].repliqIds[repliqId] = true;
    };
    RepliqServer.prototype.export = function (api) {
        if (this.api) {
            throw new Error("Cannot export multiple objects");
        }
        this.api = api;
    };
    return RepliqServer;
})(RepliqManager_1.RepliqManager);
exports.RepliqServer = RepliqServer;
//# sourceMappingURL=RepliqServer.js.map