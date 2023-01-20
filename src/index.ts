import UtaCLI from "./cli/main";
import Configurer from "./config/configurer";

(async () => {
    try {
        const config = await Configurer.getConfig();
        const uta = new UtaCLI(config);

        uta.run();
    } catch (error: any) {
        console.error(error.message);
        process.exit(1);
    }
})();
