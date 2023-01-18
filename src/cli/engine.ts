import chalk from "chalk";
import inquirer from "inquirer";
import ora, { Ora } from "ora";
import { Command } from "commander";
import { version } from "../../package.json";
import AnisoScraper from "../core/scraper";
import { infoMap } from "../utils/parser";

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

    private defineProgram(): void {
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
            .action(async (options: SearchOption) => {
                const song = await this.searchSong(options);

                if (song) {
                    this.showSongInfo(song);
                    this.createLyricsPrompt(song);
                }
            });
    }

    private async searchSong(
        options: SearchOption
    ): Promise<SongEntry | undefined> {
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
                    this.loader.succeed(
                        `${result.length} result${
                            result.length > 1 ? "s" : ""
                        } found`
                    );
                    const url = await this.createSongPrompt(result);
                    this.loader.start("fetching song...");
                    const songData = await AnisoScraper.fetchSong(url);
                    this.loader.stop();

                    return songData;
                } else {
                    this.loader.fail("No result found");
                }

                break;
            }
        }
    }

    private async createSongPrompt(list: any[]): Promise<string> {
        const choices: any[] = list.reduce((acc, item: SongResult, index) => {
            const name = `${index + 1}) ${item.anime} ${
                item.artist ? `${item.artist}-` : `:`
            }${chalk.bold(item.title)}`;
            const value = item.url;
            const lyrics = new inquirer.Separator(chalk.gray(item.lyrics));
            return acc.concat([{ name, value }, lyrics]);
        }, []);

        return inquirer
            .prompt({ ...this.promptSettings, choices })
            .then((choice) => choice.result);
    }

    private showSongInfo(songInfo: SongEntry): void {
        Object.keys(infoMap).forEach((key) => {
            const entryKey = infoMap[key] as keyof SongEntry;

            if (songInfo[entryKey]) {
                console.log(
                    `${chalk.cyan(`${key}${key !== "Released:" ? ":" : ""}`)} ${
                        songInfo[entryKey]
                    }`
                );
            }
        });

        console.log(chalk.gray("   -------------------"));
    }

    private createLyricsPrompt(songInfo: SongEntry): void {
        const lyrics = [
            { index: "romajiLyrics", value: "Romaji" },
            { index: "englishLyrics", value: "English" },
            { index: "kanjiLyrics", value: "Kanji" },
        ];

        const noLyrics = lyrics.every(({ index }) => {
            const entryKey = index as keyof SongEntry;
            return !songInfo[entryKey] ? true : false;
        });

        if (noLyrics) {
            console.log(chalk.bold("No lyrics available"));
            return;
        }

        const choices: any[] = [];
        for (const { index, value } of lyrics) {
            const entryKey = index as keyof SongEntry;
            if (songInfo[entryKey]) {
                choices.push({ name: value, value: songInfo[entryKey] });
            }
        }

        inquirer
            .prompt({
                ...this.promptSettings,
                message: "Choose the type of lyrics",
                choices,
            })
            .then((choice) => {
                console.log(choice.result);
            });
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
        //     .then((choice) => choice.result);
    }
}

export default AnisoCLI;
