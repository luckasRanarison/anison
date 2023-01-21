import UtaCLI from "./cli/main";
import Configurer from "./config/configurer";

(async () => {
    try {
        const config = await Configurer.getConfig();
        const uta = new UtaCLI(config);

        uta.parse(process.argv);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();
