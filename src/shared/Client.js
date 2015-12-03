/// <reference path="references.d.ts" />
/// <reference path="../../typings/tsd.d.ts" />
var Repliq_1 = require("../shared/Repliq");
var guid = require("node-uuid");
var Client = (function () {
    function Client() {
        this.id = guid.v4();
        this.templates = {};
        this.repliqs = {};
    }
    Client.prototype.getId = function () {
        return this.id;
    };
    Client.prototype.declare = function (template) {
        this.templates[template.getId()] = template;
    };
    Client.prototype.create = function (template, args) {
        var repl = new Repliq_1.Repliq(template, args, this.id);
        this.repliqs[repl.getId()] = repl;
        return repl;
    };
    Client.prototype.getTemplate = function (id) {
        return this.templates[id];
    };
    return Client;
})();
exports.Client = Client;
//# sourceMappingURL=Client.js.map