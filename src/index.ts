import AnisonCLI from "./cli/main";

try {
    const anison = new AnisonCLI();
    anison.run();
} catch (error) {
    throw Error("An error occured when parsing arrguments");
}
