///<reference path="../src/server/references.d.ts" />

import {link} from "../src/server/analyser/Importer";



describe("Linker", () => {
    it("should create a PrototypeMap", (done) => {
        link("test/stubs/A.rpl").then((prototypes) => {
            should.exist(prototypes);
        });
    });
});