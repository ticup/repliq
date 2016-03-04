var Importer_1 = require("../src/server/analyser/Importer");
describe("Linker", function () {
    it("should create a PrototypeMap", function (done) {
        Importer_1.link("test/stubs/A.rpl").then(function (prototypes) {
            should.exist(prototypes);
        });
    });
});
//# sourceMappingURL=importer.js.map