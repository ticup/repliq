var example = process.env.EXAMPLE;

if (example) {
    require("./examples/" + example + "/server/index.js");
}