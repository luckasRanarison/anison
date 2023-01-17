import AnisoCLI from "./cli/engine";

(async () => {
    try {
        const anison = new AnisoCLI();
        anison.run();
    } catch (error) {
        console.error("An error occured when parsing arrguments");
        process.exit(1);
    }
})();
