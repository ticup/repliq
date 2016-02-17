var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/// <reference path="references.d.ts" />
System.register("shared/Operation", ["shared/Repliq", "shared/Communication"], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var Repliq_1, Communication_1, Communication_2;
    var Operation;
    return {
        setters:[
            function (Repliq_1_1) {
                Repliq_1 = Repliq_1_1;
            },
            function (Communication_1_1) {
                Communication_1 = Communication_1_1;
                Communication_2 = Communication_1_1;
            }],
        execute: function() {
            Operation = (function () {
                function Operation(targetId, selector, args) {
                    this.targetId = targetId;
                    this.selector = selector;
                    this.args = args;
                }
                Operation.prototype.toJSON = function () {
                    return {
                        targetId: this.targetId,
                        selector: this.selector,
                        args: this.args.map(function (arg) { return Communication_1.toJSON(arg); })
                    };
                };
                Operation.prototype.getNewRepliqIds = function () {
                    if (this.isMethodApplication()) {
                        return Communication_2.getRepliqReferences(this.args);
                    }
                    else {
                        return [this.args[0]].concat(Communication_2.getRepliqReferences(this.args.slice(1)));
                    }
                };
                Operation.prototype.isMethodApplication = function () {
                    return (typeof this.targetId !== "undefined");
                };
                Operation.prototype.getTargetId = function () {
                    if (this.isMethodApplication()) {
                        return this.targetId;
                    }
                    if (this.selector === Repliq_1.Repliq.CREATE_SELECTOR) {
                        return this.args[0];
                    }
                };
                Operation.fromJSON = function (json, manager) {
                    return new Operation(json.targetId, json.selector, json.args.map(function (arg) { return Communication_1.fromJSON(arg, manager); }));
                };
                Operation.global = function (selector, args) {
                    return new Operation(undefined, selector, args);
                };
                Operation.prototype.toString = function () {
                    return "" + this.targetId.slice(-5) + "." + this.selector + "(" + this.args.map(function (arg) { return arg.toString(); }).join(", ") + ")";
                };
                return Operation;
            }());
            exports_1("Operation", Operation);
        }
    }
});
System.register("shared/Types", [], function(exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
    return {
        setters:[],
        execute: function() {
        }
    }
});
///<reference path="./references.d.ts" />
System.register("shared/Round", ["shared/Operation"], function(exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    var Operation_1;
    var Round;
    return {
        setters:[
            function (Operation_1_1) {
                Operation_1 = Operation_1_1;
            }],
        execute: function() {
            Round = (function () {
                function Round(clientNr, originId, serverNr, operations) {
                    if (serverNr === void 0) { serverNr = -1; }
                    if (operations === void 0) { operations = []; }
                    this.origins = [];
                    this.serverNr = serverNr;
                    this.clientNr = clientNr;
                    this.originId = originId;
                    this.operations = operations;
                }
                Round.prototype.getOriginId = function () {
                    return this.originId;
                };
                Round.prototype.getClientNr = function () {
                    return this.clientNr;
                };
                Round.prototype.setServerNr = function (nr) {
                    this.serverNr = nr;
                };
                Round.prototype.getServerNr = function () {
                    return this.serverNr;
                };
                Round.prototype.add = function (operation) {
                    this.operations.push(operation);
                };
                Round.prototype.hasOperations = function () {
                    return this.operations.length !== 0;
                };
                Round.prototype.getNewRepliqIds = function () {
                    return this.operations.map(function (op) { return op.getNewRepliqIds(); });
                };
                Round.prototype.getTargetRepliqIds = function () {
                    return this.operations.map(function (op) { return op.targetId; });
                };
                Round.prototype.containsOrigin = function (clientId) {
                    return this.origins.indexOf(clientId) !== -1;
                };
                Round.prototype.merge = function (round) {
                    this.operations = this.operations.concat(round.operations);
                    this.origins.push(round.getOriginId());
                };
                Round.prototype.toJSON = function () {
                    return {
                        serverNr: this.serverNr,
                        clientNr: this.clientNr,
                        originId: this.originId,
                        operations: this.operations.map(function (op) { return op.toJSON(); })
                    };
                };
                Round.prototype.copyFor = function (clientNr, repliqIds) {
                    var ops = this.operations.filter(function (op) { return repliqIds.indexOf(op.getTargetId()) !== -1; });
                    return new Round(clientNr, this.originId, this.serverNr, ops);
                };
                Round.fromJSON = function (json, manager) {
                    return new Round(json.clientNr, json.originId, json.serverNr, json.operations.map(function (op) { return Operation_1.Operation.fromJSON(op, manager); }));
                };
                Round.prototype.toString = function () {
                    return "{Round#s:" + this.getServerNr() + "o:" + this.getClientNr() + " | [" + this.operations.map(function (op) { return op.toString(); }).join(", ") + "]}";
                };
                return Round;
            }());
            exports_3("Round", Round);
        }
    }
});
/// <reference path="references.d.ts" />
System.register("shared/RepliqData", [], function(exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    var RepliqData;
    return {
        setters:[],
        execute: function() {
            RepliqData = (function () {
                function RepliqData(fields) {
                    var _this = this;
                    if (fields === void 0) { fields = {}; }
                    this.committed = {};
                    this.tentative = {};
                    Object.keys(fields).forEach(function (name) {
                        _this.committed[name] = fields[name];
                    });
                }
                RepliqData.prototype.get = function (key) {
                    return this.getTentative(key);
                };
                RepliqData.prototype.set = function (key, val) {
                    return this.setTentative(key, val);
                };
                RepliqData.prototype.getTentative = function (key) {
                    var val = this.tentative[key];
                    if (typeof val === "undefined")
                        return this.committed[key];
                    return val;
                };
                RepliqData.prototype.setTentative = function (key, val) {
                    return this.tentative[key] = val;
                };
                RepliqData.prototype.hasTentative = function () {
                    return Object.keys(this.tentative).length !== 0;
                };
                RepliqData.prototype.getKeys = function () {
                    return Object.keys(this.tentative);
                };
                RepliqData.prototype.getCommitted = function (key) {
                    return this.committed[key];
                };
                RepliqData.prototype.getCommittedKeys = function () {
                    return Object.keys(this.committed);
                };
                RepliqData.prototype.commitValues = function () {
                    var _this = this;
                    this.getKeys().forEach(function (key) {
                        _this.committed[key] = _this.tentative[key];
                        delete _this.tentative[key];
                    });
                };
                RepliqData.prototype.setToCommit = function () {
                    var _this = this;
                    this.getCommittedKeys().forEach(function (key) {
                        return _this.tentative[key] = _this.committed[key];
                    });
                };
                return RepliqData;
            }());
            exports_4("RepliqData", RepliqData);
        }
    }
});
/// <reference path="references.d.ts" />
/// <reference path="../../typings/tsd.d.ts" />
System.register("shared/RepliqManager", ["shared/Repliq", "shared/Operation", "shared/Round", "debug", "node-uuid", "shared/RepliqData", "events"], function(exports_5, context_5) {
    "use strict";
    var __moduleName = context_5 && context_5.id;
    var Repliq_2, Operation_2, Round_1, Debug, guid, RepliqData_1, events_1;
    var debug, RepliqManager;
    function computeHashString(str) {
        var hash = 0, i, chr, len;
        if (str.length == 0)
            return hash;
        for (i = 0, len = str.length; i < len; i++) {
            chr = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }
    function computeHash(obj) {
        //return obj.constructor.name;
        var str = Object.keys(obj).sort().reduce(function (acc, key) { return (obj.hasOwnProperty(key) ? (acc + key + obj[key].toString()) : ""); }, "");
        return computeHashString(str);
    }
    return {
        setters:[
            function (Repliq_2_1) {
                Repliq_2 = Repliq_2_1;
            },
            function (Operation_2_1) {
                Operation_2 = Operation_2_1;
            },
            function (Round_1_1) {
                Round_1 = Round_1_1;
            },
            function (Debug_1) {
                Debug = Debug_1;
            },
            function (guid_1) {
                guid = guid_1;
            },
            function (RepliqData_1_1) {
                RepliqData_1 = RepliqData_1_1;
            },
            function (events_1_1) {
                events_1 = events_1_1;
            }],
        execute: function() {
            debug = Debug("Repliq:local");
            RepliqManager = (function (_super) {
                __extends(RepliqManager, _super);
                function RepliqManager(schema, yieldEvery) {
                    _super.call(this);
                    this.id = guid.v4();
                    this.roundNr = -1;
                    this.templates = {};
                    this.repliqs = {};
                    this.repliqsData = {};
                    this.current = this.newRound();
                    this.pending = [];
                    this.confirmed = [];
                    this.incoming = [];
                    this.replaying = false;
                    this.templateIds = {};
                    if (schema) {
                        this.declareAll(schema);
                    }
                    if (yieldEvery)
                        this.yieldEvery(yieldEvery);
                }
                RepliqManager.prototype.getId = function () {
                    return this.id;
                };
                RepliqManager.prototype.forEachData = function (f) {
                    var _this = this;
                    Object.keys(this.repliqsData).forEach(function (key) { return f(key, _this.repliqsData[key]); });
                };
                RepliqManager.prototype.declare = function (template) {
                    template.id = computeHash(template.prototype);
                    this.templates[template.getId()] = template;
                    this.templateIds[template.getId()] = 0;
                    template.manager = this;
                    debug("declaring template with id " + template.id);
                };
                RepliqManager.prototype.declareAll = function (templates) {
                    var _this = this;
                    Object.keys(templates).forEach(function (key) { return _this.declare(templates[key]); });
                };
                RepliqManager.prototype.create = function (template, args) {
                    if (args === void 0) { args = {}; }
                    if (typeof this.getTemplate(template.getId()) == "undefined") {
                        throw new Error("cannot create a repliq that is not declared ");
                    }
                    // we have to put on replaying to not record what's in the constructor.
                    var wasReplaying = this.replaying;
                    this.replaying = true;
                    var data = new RepliqData_1.RepliqData();
                    var repl = new template(template, data, this, this.id);
                    this.replaying = wasReplaying;
                    this.repliqs[repl.getId()] = repl;
                    this.repliqsData[repl.getId()] = data;
                    Object.keys(args).forEach(function (key) {
                        repl.set(key, args[key]);
                    });
                    data.commitValues();
                    if (!this.replaying)
                        this.current.add(Operation_2.Operation.global(Repliq_2.Repliq.CREATE_SELECTOR, [repl.getId(), template].concat(args)));
                    return repl;
                };
                RepliqManager.prototype.add = function (template, args, id) {
                    if (typeof this.getRepliq(id) !== "undefined") {
                        return this.getRepliq(id);
                    }
                    var wasReplaying = this.replaying;
                    this.replaying = true;
                    var data = new RepliqData_1.RepliqData();
                    var repl = new template(template, data, this, this.id, id);
                    this.replaying = wasReplaying;
                    this.repliqs[repl.getId()] = repl;
                    this.repliqsData[repl.getId()] = data;
                    Object.keys(args).forEach(function (key) {
                        repl.set(key, args[key]);
                    });
                    data.commitValues();
                    return repl;
                };
                RepliqManager.prototype.getTemplate = function (id) {
                    return this.templates[id];
                };
                RepliqManager.prototype.getRepliq = function (id) {
                    return this.repliqs[id];
                };
                RepliqManager.prototype.getRepliqData = function (id) {
                    return this.repliqsData[id];
                };
                RepliqManager.prototype.getRoundNr = function () {
                    return this.roundNr;
                };
                RepliqManager.prototype.getNextTemplateId = function (id) {
                    console.assert(typeof this.templateIds[id] !== "undefined");
                    var val = this.templateIds[id];
                    this.templateIds[id] += 1;
                    return val;
                };
                RepliqManager.prototype.call = function (repliq, data, selector, fun, args) {
                    debug("calling " + selector + "(" + args.map(function (arg) { return arg.toString(); }).join(", ") + ")");
                    var startReplay = false;
                    //var fun = repliq.getMethod(selector);
                    //if (!fun) {
                    //    throw new Error("Undefined method " + selector + " in " + repliq);
                    //}
                    //if (this.replaying) {
                    //    if (repliq !== this.replaying) {
                    //        throw new Error("Cannot call repliq method from within another repliq method");
                    //    }
                    //} else {
                    if (!this.replaying) {
                        startReplay = true;
                        debug("recording " + selector + "(" + args + ")");
                        this.current.add(new Operation_2.Operation(repliq.getId(), selector, args));
                        this.replaying = true;
                    }
                    var res = fun.apply(repliq, args);
                    if (startReplay) {
                        this.replaying = false;
                        this.notifyChanged();
                        repliq.emit(Repliq_2.Repliq.CHANGE);
                    }
                    return res;
                };
                RepliqManager.prototype.execute = function (selector, id, args) {
                    if (selector === Repliq_2.Repliq.CREATE_SELECTOR) {
                        var template = args[0];
                        debug("creating repliq with id " + id + "(" + args[1] + " )");
                        this.add(template, args[1], id);
                    }
                    else {
                        return new Error(selector + " does not exist");
                    }
                };
                RepliqManager.prototype.replay = function (rounds) {
                    var _this = this;
                    this.replaying = true;
                    rounds.forEach(function (r) { return _this.play(r); });
                    this.commitValues();
                    var affected = this.getAffectedIds(rounds);
                    this.replaying = false;
                    return affected.map(function (id) { return _this.getRepliq(id); });
                };
                RepliqManager.prototype.play = function (round) {
                    var _this = this;
                    debug("playing round o:" + round.getClientNr() + " s: " + round.getServerNr());
                    round.operations.forEach(function (op) {
                        debug(op.targetId + " . " + op.selector);
                        if (!op.isMethodApplication()) {
                            _this.execute(op.selector, op.args[0], op.args.slice(1));
                        }
                        else {
                            var rep = _this.getRepliq(op.targetId);
                            rep[op.selector].apply(rep, op.args);
                        }
                    });
                };
                RepliqManager.prototype.commitValues = function () {
                    this.forEachData(function (_, r) {
                        return r.commitValues();
                    });
                };
                RepliqManager.prototype.getAffectedIds = function (rounds) {
                    return rounds.reduce(function (acc, round) {
                        return acc.concat(round.operations.reduce(function (acc, op) {
                            return op.isMethodApplication() ? acc.concat(op.targetId) : acc;
                        }, []));
                    }, []);
                };
                RepliqManager.prototype.newRound = function () {
                    return new Round_1.Round(this.newRoundNr(), this.getId());
                };
                RepliqManager.prototype.newRoundNr = function () {
                    return ++this.roundNr;
                };
                RepliqManager.prototype.notifyChanged = function () {
                };
                // Yield Periodic Mode
                // Propagates changes periodically, when yield is called.
                RepliqManager.prototype.yieldEvery = function (ms) {
                    var _this = this;
                    if (this.yieldTimer)
                        this.stopYielding();
                    this.yieldTimer = setInterval(function () { return _this.yield(); }, ms);
                };
                RepliqManager.prototype.stopYielding = function () {
                    if (this.yieldTimer) {
                        clearInterval(this.yieldTimer);
                    }
                };
                RepliqManager.prototype.yield = function () {
                    this.emit("yield");
                };
                return RepliqManager;
            }(events_1.EventEmitter));
            exports_5("RepliqManager", RepliqManager);
        }
    }
});
///<reference path="../../typings/tsd.d.ts" />
/// <reference path="references.d.ts" />
System.register("shared/Repliq", ["shared/RepliqData", "events", "immutable"], function(exports_6, context_6) {
    "use strict";
    var __moduleName = context_6 && context_6.id;
    var RepliqData_2, events_2, immutable_1;
    var Repliq;
    function sync(target, key, prop) {
        return {
            value: function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                args.forEach(validate);
                return this.call(key, prop.value, args);
            }
        };
    }
    exports_6("sync", sync);
    function validate(val) {
        var type = typeof val;
        if (type === "number" || type === "string" || type == "boolean" || type == "undefined") {
            return true;
        }
        if (type === "object") {
            if (val instanceof immutable_1.List) {
                return true;
            }
            if (val instanceof Array) {
                return true;
            }
            if (val instanceof Repliq) {
                return true;
            }
        }
        throw Error("cannot use " + val + " as an argument to a repliq method");
    }
    return {
        setters:[
            function (RepliqData_2_1) {
                RepliqData_2 = RepliqData_2_1;
            },
            function (events_2_1) {
                events_2 = events_2_1;
            },
            function (immutable_1_1) {
                immutable_1 = immutable_1_1;
            }],
        execute: function() {
            Repliq = (function (_super) {
                __extends(Repliq, _super);
                function Repliq(template, data, manager, clientId, id) {
                    _super.call(this);
                    this.clientId = clientId;
                    this.manager = manager;
                    this.data = data;
                    this.template = template;
                    this.id = id ? id : clientId + "@" + this.getTemplate().getId() + ":" + (manager ? manager.getNextTemplateId(template.getId()) : "0");
                }
                Repliq.getId = function () {
                    return this.id;
                };
                Repliq.stub = function (args) {
                    if (args === void 0) { args = {}; }
                    var data = new RepliqData_2.RepliqData(args);
                    var repl = new this(this, data, null, null);
                    var Stub = (function (_super) {
                        __extends(Stub, _super);
                        function Stub(template, data) {
                            _super.call(this, Stub, data, null, null);
                        }
                        Stub.prototype.call = function (op) {
                            var args = [];
                            for (var _i = 1; _i < arguments.length; _i++) {
                                args[_i - 1] = arguments[_i];
                            }
                            return this.getMethod(op).call(args);
                        };
                        ;
                        Stub.prototype.confirmed = function () {
                            return false;
                        };
                        return Stub;
                    }(this));
                    return new Stub(this, data);
                };
                Repliq.create = function (args) {
                    if (args === void 0) { args = {}; }
                    if (typeof this.manager === "undefined") {
                        throw new Error("Repliq must first be declared to a manager");
                    }
                    this.manager.create(this, args);
                };
                Repliq.prototype.getMethod = function (op) {
                    return this[op];
                };
                // user interface:
                Repliq.prototype.get = function (key) {
                    return this.data.getTentative(key);
                };
                Repliq.prototype.set = function (key, value) {
                    return this.data.setTentative(key, value);
                };
                Repliq.prototype.confirmed = function () {
                    return !this.data.hasTentative();
                };
                //set(key, val) {
                //    this.call("set", key, val);
                //return this.data.setTentative(key, val);
                //}
                Repliq.prototype.getCommit = function (key) {
                    return this.data.getCommitted(key);
                };
                Repliq.prototype.call = function (op, fun, args) {
                    var val = this.manager.call(this, this.data, op, fun, args);
                    //this.manager.notifyChanged();
                    return val;
                };
                // internals
                Repliq.prototype.getTemplate = function () {
                    return this.template;
                };
                Repliq.prototype.getId = function () {
                    return this.id;
                };
                Repliq.prototype.committedKeys = function () {
                    return this.data.getCommittedKeys();
                };
                Repliq.prototype.init = function () { };
                Repliq.prototype.toString = function () {
                    return "{" + this.clientId.slice(-5) + "@" + this.getId().slice(-5) + "}";
                };
                Repliq.CHANGE_EXTERNAL = "change_external";
                Repliq.CHANGE = "change";
                Repliq.CREATE_SELECTOR = "createRepliq";
                Repliq.isRepliq = true;
                Repliq.fields = {};
                return Repliq;
            }(events_2.EventEmitter));
            exports_6("Repliq", Repliq);
        }
    }
});
///<reference path="./references.d.ts" />
System.register("shared/Communication", ["shared/Repliq", "immutable"], function(exports_7, context_7) {
    "use strict";
    var __moduleName = context_7 && context_7.id;
    var Repliq_3, immutable_2;
    function serializeArgs(args) {
        return args.map(toJSON);
    }
    exports_7("serializeArgs", serializeArgs);
    // Highly inefficient serialization/deserialization :)
    function toJSON(val) {
        var type = typeof val;
        if (type === "number") {
            return { val: val, type: "number" };
        }
        if (type === "string") {
            return { val: val, type: "string" };
        }
        if (type === "boolean") {
            return { val: val, type: "boolean" };
        }
        //if (type === "function") {
        //    return {val: val.toString(), type: "function" };
        //}
        if (type === "object") {
            if (val instanceof immutable_2.List) {
                console.log(val.toArray());
                return { val: val.toArray().map(toJSON), type: "Array" };
            }
            if (val instanceof Array) {
                return { val: val.map(toJSON), type: "Array" };
            }
            if (val instanceof Repliq_3.Repliq) {
                var obj_1 = { id: val.getId(), values: {}, templateId: val.getTemplate().getId() };
                val.committedKeys().forEach(function (key) { return obj_1.values[key] = toJSON(val.getCommit(key)); });
                return { val: obj_1, type: "Repliq" };
            }
            var obj = {};
            for (var key in val) {
                obj[key] = toJSON(val[key]);
            }
            return { val: obj, type: "object" };
        }
        if (type === "function" && val.isRepliq) {
            return { val: val.getId(), type: "RepliqTemplate" };
        }
        if (type === "undefined") {
            return { val: val, type: "undefined" };
        }
        throw new Error("unknown serialize value: " + val);
    }
    exports_7("toJSON", toJSON);
    function fromJSON(_a, client) {
        var val = _a.val, type = _a.type;
        console.log("deserializing: " + JSON.stringify(val));
        if ((type === "number") || (type === "string") || (type === "boolean")) {
            return val;
        }
        if (type === "Array") {
            return immutable_2.List(val.map(function (v) { return fromJSON(v, client); }));
        }
        if (type === "object") {
            for (var key in val) {
                val[key] = fromJSON(val[key], client);
            }
            return val;
        }
        if (type === "Repliq") {
            var repl = client.getRepliq(val.id);
            if (repl)
                return repl;
            var template = client.getTemplate(val.templateId);
            if (!template) {
                throw new Error("undefined template: " + val.templateId);
            }
            var obj = {};
            for (var key in val.values) {
                obj[key] = fromJSON(val.values[key], client);
            }
            return client.add(template, obj, val.id);
        }
        if (type === "RepliqTemplate") {
            return client.getTemplate(val);
        }
        //if (type === "function") {
        //    eval("var result = " + val);
        //    return result;
        //}
        if (type === "undefined") {
            return undefined;
        }
        throw new Error("unknown serialize value" + val);
    }
    exports_7("fromJSON", fromJSON);
    function getRepliqReferences(val) {
        var type = typeof val;
        if (type === "object") {
            if (val instanceof immutable_2.List) {
                return getRepliqReferences(val.toArray());
            }
            if (val instanceof Array) {
                return val.reduce(function (acc, val) { return acc.concat(getRepliqReferences(val)); }, []);
            }
            if (val instanceof Repliq_3.Repliq) {
                var repl_1 = val;
                return [repl_1.getId()].concat(repl_1.committedKeys().reduce(function (acc, key) { return acc.concat(getRepliqReferences(repl_1.get(key))); }, []));
            }
            return Object.keys(val).reduce(function (acc, key) { return acc.concat(getRepliqReferences(val[key])); }, []);
        }
        if (type === "function" && val.isRepliq) {
            return Object.keys(val.fields).reduce(function (acc, name) { return acc.concat(getRepliqReferences(val.fields[name])); }, []);
        }
        return [];
    }
    exports_7("getRepliqReferences", getRepliqReferences);
    return {
        setters:[
            function (Repliq_3_1) {
                Repliq_3 = Repliq_3_1;
            },
            function (immutable_2_1) {
                immutable_2 = immutable_2_1;
            }],
        execute: function() {
        }
    }
});
///<reference path="../Repliq.ts" />
System.register("shared/protocols/Register", ["shared/Repliq"], function(exports_8, context_8) {
    "use strict";
    var __moduleName = context_8 && context_8.id;
    var Repliq_4;
    var Register;
    return {
        setters:[
            function (Repliq_4_1) {
                Repliq_4 = Repliq_4_1;
            }],
        execute: function() {
            Register = (function (_super) {
                __extends(Register, _super);
                function Register() {
                    _super.apply(this, arguments);
                }
                Register.prototype.setVal = function (value) {
                    return this.set("value", value);
                };
                Register.prototype.getVal = function () {
                    return this.get("value");
                };
                __decorate([
                    Repliq_4.sync
                ], Register.prototype, "setVal");
                return Register;
            }(Repliq_4.Repliq));
            exports_8("Register", Register);
        }
    }
});
/// <reference path="../shared/references.d.ts" />
/// <reference path="../../typings/tsd.d.ts" />
System.register("client/RepliqClient", ["debug", 'socket.io-client', "bluebird", "shared/Communication", "shared/RepliqManager", "shared/Repliq", "shared/Round"], function(exports_9, context_9) {
    "use strict";
    var __moduleName = context_9 && context_9.id;
    var Debug, io, Promise, com, RepliqManager_1, Repliq_5, Round_2;
    var debug, RepliqClient;
    return {
        setters:[
            function (Debug_2) {
                Debug = Debug_2;
            },
            function (io_1) {
                io = io_1;
            },
            function (Promise_1) {
                Promise = Promise_1;
            },
            function (com_1) {
                com = com_1;
            },
            function (RepliqManager_1_1) {
                RepliqManager_1 = RepliqManager_1_1;
            },
            function (Repliq_5_1) {
                Repliq_5 = Repliq_5_1;
            },
            function (Round_2_1) {
                Round_2 = Round_2_1;
            }],
        execute: function() {
            debug = Debug("Repliq:com:client");
            RepliqClient = (function (_super) {
                __extends(RepliqClient, _super);
                function RepliqClient(host, schema, yieldEvery) {
                    _super.call(this, schema, yieldEvery);
                    this.serverNr = -1;
                    this.incoming = [];
                    this.connect(host);
                }
                RepliqClient.prototype.connect = function (host) {
                    this.channel = io(host, { forceNew: true });
                    return this.handshake();
                };
                RepliqClient.prototype.setupYieldPush = function (channel) {
                    var _this = this;
                    channel.on("YieldPush", function (round) { return _this.handleYieldPull(round); });
                };
                RepliqClient.prototype.handshake = function () {
                    var _this = this;
                    this.channel.emit("handshake", { clientId: this.getId(), clientNr: this.getRoundNr(), serverNr: this.serverNr });
                    this.onConnectP = new Promise(function (resolve, reject) {
                        _this.channel.on("handshake", function (_a) {
                            var err = _a.err, lastClientNr = _a.lastClientNr, lastServerNr = _a.lastServerNr, round = _a.round;
                            if (err) {
                                // Requires complete reset of the data
                                reject("failed to handshake");
                                throw err;
                            }
                            _this.setupYieldPush(_this.channel);
                            debug("handshaking... clientNr: " + _this.getRoundNr() + " , server received clientNr: " + lastClientNr);
                            if (round) {
                                console.assert(lastClientNr <= _this.getRoundNr());
                                console.assert(lastServerNr <= _this.getServerNr() || _this.getServerNr() == -1);
                                if (_this.incoming.length > 0) {
                                    _this.yield();
                                }
                                _this.incoming = [Round_2.Round.fromJSON(round, _this)];
                                _this.yield();
                            }
                            if (_this.pending.length > 0) {
                                console.assert(_this.pending[_this.pending.length - 1].getClientNr() > lastClientNr);
                                _this.pending.forEach(function (r) { return _this.channel.emit("YieldPull", r.toJSON()); });
                            }
                            resolve();
                        });
                    });
                    return this.onConnectP;
                };
                RepliqClient.prototype.handleYieldPull = function (json) {
                    debug("YieldPull: received round");
                    var round = Round_2.Round.fromJSON(json, this);
                    this.incoming.push(round);
                    //this.notifyChanged();
                };
                // Should only be called after connect() and handshake() is called!
                RepliqClient.prototype.onConnect = function () {
                    return this.onConnectP;
                };
                RepliqClient.prototype.send = function (selector) {
                    var _this = this;
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    return this.onConnect().then(function () {
                        return new Promise(function (resolve, reject) {
                            debug("sending rpc " + selector + "(" + args + ")");
                            var rpc = { selector: selector, args: args.map(com.toJSON) };
                            _this.channel.emit("rpc", rpc, function (error, result) {
                                var ser = result;
                                debug("received rpc result for " + selector + "(" + args + ") : " + result);
                                if (error)
                                    return reject(new Error(error));
                                resolve(com.fromJSON(ser, _this));
                            });
                        });
                    });
                };
                RepliqClient.prototype.stop = function () {
                    this.channel.close();
                };
                //create(template: typeof Repliq, args) {
                //    let r = super.create(template, args);
                //    this.current.add(new Operation(r.getId(), Repliq.CREATE_SELECTOR, [template].concat(args)));
                //    return r;
                //}
                RepliqClient.prototype.yield = function () {
                    var _this = this;
                    // client->master yield
                    if (this.current.hasOperations()) {
                        var round = this.current;
                        this.pending.push(round);
                        this.current = this.newRound();
                        debug("YieldPull: " + JSON.stringify(round.toJSON()));
                        this.channel.emit("YieldPull", round.toJSON());
                    }
                    // master->client yield
                    if (this.incoming.length > 0) {
                        this.replaying = true;
                        var pending = this.pending;
                        var last = this.incoming[this.incoming.length - 1];
                        // 1) reset to commit values
                        this.forEachData(function (_, r) {
                            return r.setToCommit();
                        });
                        // 2) play all rounds
                        var affectedExt = this.replay(this.incoming);
                        // 3) remove pending rounds up to where it is confirmed
                        var confirmedNr_1 = last.getClientNr();
                        this.pending = pending.filter(function (r) { return r.getClientNr() > confirmedNr_1; });
                        console.assert(this.serverNr <= last.getServerNr() || this.serverNr == -1);
                        this.serverNr = last.getServerNr();
                        // 4) recompute tentative state
                        this.pending.forEach(function (round) {
                            return _this.play(round);
                        });
                        this.incoming = [];
                        pending.forEach(function (r) { return r.getClientNr() <= confirmedNr_1 ? _this.confirmed.push(r) : null; });
                        this.replaying = false;
                        affectedExt.forEach(function (rep) { rep.emit(Repliq_5.Repliq.CHANGE_EXTERNAL); rep.emit(Repliq_5.Repliq.CHANGE); });
                    }
                    _super.prototype.yield.call(this);
                };
                RepliqClient.prototype.getServerNr = function () {
                    return this.serverNr;
                };
                return RepliqClient;
            }(RepliqManager_1.RepliqManager));
            exports_9("RepliqClient", RepliqClient);
        }
    }
});
/// <reference path="./RepliqClient" />
System.register("client/index", ["client/RepliqClient", "shared/Repliq"], function(exports_10, context_10) {
    "use strict";
    var __moduleName = context_10 && context_10.id;
    return {
        setters:[
            function (RepliqClient_1_1) {
                exports_10({
                    "RepliqClient": RepliqClient_1_1["RepliqClient"]
                });
            },
            function (Repliq_6_1) {
                exports_10({
                    "sync": Repliq_6_1["sync"],
                    "Repliq": Repliq_6_1["Repliq"]
                });
            }],
        execute: function() {
        }
    }
});
