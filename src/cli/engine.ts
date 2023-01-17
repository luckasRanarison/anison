import inquirer from "inquirer";
import ora, { Ora } from "ora";
import { Command } from "commander";
import { version } from "../../package.json";
import AnisoScraper from "../core/scraper";
import chalk from "chalk";

class AnisoCLI {
    private program: Command;
    private loader: Ora;
    private promptSettings: any;

    constructor() {
        this.program = new Command();
        this.loader = ora({
            text: "Searching...\n",
            spinner: "dots",
        });
        this.promptSettings = {
            type: "list",
            name: "result",
            message: "Select one",
            prefix: "",
        };
    }

    public run(): void {
        this.defineProgram();
        this.program.parse();
    }

    private defineProgram() {
        this.program
            .name("aniso")
            .description("www.animesonglyrics.com scraper")
            .version(version);

        this.program
            .command("search")
            .alias("s")
            .description("Search song by name, anime, artist or lyrics")
            .allowExcessArguments(false)
            .option("-A, --anime <anime>", "Search by anime")
            .option("-a, --artist <artist>", "Search by artist")
            .option("-n, --name <name>", "Search by name")
            .option("-l, --lyrics <lyrics>", "Search by lyrics")
            .action((options: SearchOption) => this.searchSong(options));
    }

    private async searchSong(options: SearchOption) {
        // exception handling
        if (!Object.keys(options).length) {
            console.error("error: no option provided");
            process.exit(1);
        }

        if (Object.keys(options).length > 1) {
            console.error("error: one option expected");
            process.exit(1);
        }

        this.loader.start();

        // check active option
        for (const [type, query] of Object.entries(options)) {
            if (query) {
                const queryType = type as QueryType;
                const result = await AnisoScraper.searchSong(query, queryType);

                if (result.length) {
                    this.loader.succeed(`${result.length} results found`);
                    this.createSongPrompt(result);
                } else {
                    this.loader.fail("No result found");
                }

                break;
            }
        }
    }

    private async createSongPrompt(list: any[]) {
        const choices: any[] = list.reduce((acc, item: SongResult, index) => {
            const name = `${index}) ${item.anime} ${
                item.artist ? `${item.artist}-` : `:`
            }${chalk.bold(item.title)}`;
            const value = item.url;
            const lyrics = new inquirer.Separator(chalk.gray(item.lyrics));
            return acc.concat([{ name, value }, lyrics]);
        }, []);

        return inquirer
            .prompt({ ...this.promptSettings, choices })
            .then((choice) => {});
    }

    // to do
    private async createAnimePrompt(list: any[]) {
        // const choices: any[] = list.map((item: IAnimeResult, index) => {
        //     const name = `${index}: ${item.title}${
        //         item.originalTitle ? ` (${chalk.gray(item.originalTitle)})` : ""
        //     }`;
        //     const value = item.url;
        //     return { name, value };
        // });
        // return inquirer
        //     .prompt({ ...this.promptStyle, choices })
        //     .then((choice) => {});
    }
}

export default AnisoCLI;
