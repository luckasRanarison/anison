import ora, { Ora } from "ora";
import { Command } from "commander";
import { version } from "../../package.json";
import AnisonLyrics from "../sources/anisonlyrics";
import { createSongPrompt, createLyricsPrompt } from "./prompt";
import { printInfo, printLyrics } from "./output";

class UtaCLI {
    private program: Command;
    private loader: Ora;
    private source: LyricsSource;

    constructor() {
        this.program = new Command();
        this.loader = ora({
            text: "Searching...\n",
            spinner: "dots",
        });
        this.source = new AnisonLyrics();
    }

    public run(): void {
        this.defineProgram();
        this.program.parse();
    }

    private defineProgram(): void {
        this.program
            .name("uta")
            .description("Japanse song lyrics websites scraper")
            .version(version);

        this.program
            .command("song")
            .description("Search song by title, artist or lyrics")
            .allowExcessArguments(false)
            .option("-a, --artist <artist>", "Search by artist")
            .option("-t, --title <title>", "Search by title")
            .option("-l, --lyrics <lyrics>", "Search by lyrics")
            .action((options: SearchOption) => this.searchSong(options));
    }

    private getSource() {}

    private async searchSong(options: SearchOption) {
        this.loader.start();

        const [type, query] = Object.entries(options).find(
            ([type, _query]) => type
        ) as [string, string]; // always return a value

        const result = await this.source.searchSong(query, type);

        if (!result.length) {
            this.loader.fail("No result found");
            process.exit();
        }

        this.loader.succeed(`${result.length} results found`);
        const songData = await createSongPrompt(
            result,
            this.source.lyricsPreview
        );

        this.loader.start("fetching song...");
        const [info, lyrics] = await this.source.fetchSong(songData);
        this.loader.stop();

        printInfo(info);
        const choice = await createLyricsPrompt(lyrics);
        printLyrics(choice);
    }
}

export default UtaCLI;
