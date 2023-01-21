import fs from "fs-extra";
import defaultConfig from "./default";

class Configurer {
    static filePath = "config.json";

    static async getConfig(): Promise<UtaConfig> {
        try {
            if (await fs.pathExists(this.filePath)) {
                const data = await fs.readFile(this.filePath, "utf8");

                return JSON.parse(data);
            } else {
                this.createConfig();

                return defaultConfig;
            }
        } catch (error) {
            throw Error("error: Error when reading config");
        }
    }

    private static createConfig() {
        fs.writeFileSync(this.filePath, JSON.stringify(defaultConfig));
    }
}

export default Configurer;
