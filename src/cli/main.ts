import ora, { Ora } from "ora";
import { Command } from "commander";
import { version } from "../../package.json";
import { printSongInfo, printLyrics, printAnimeInfo } from "./output";
import * as prompt from "./prompt";
import AnisonLyrics from "../sources/anisonlyrics";

class UtaCLI {
    private program: Command;
    private loader: Ora;
    private source: LyricsSource;

    constructor() {
        this.program = new Command();
        this.loader = ora({ spinner: "dots" });
        this.source = new AnisonLyrics();
    }

    public run() {
        this.defineProgram();
        this.program.parse();
    }

    private defineProgram() {
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
            .action((options: SongFilter) => this.searchSong(options));

        this.program
            .command("anime")
            .description("Search a specific anime song")
            .allowExcessArguments(false)
            .option("-t, --title <title>", "Search by title")
            .option("-s, --season <season>", "Search by season")
            .action((options: AnimeFilter) => this.searchAnime(options));
    }

    private getSource() {}

    private checkFilters(
        filters: SongFilter | AnimeFilter,
        search: "anime" | "song"
    ) {
        if (!Object.keys(filters).length) {
            throw Error("error: No option provided");
        }

        const argOverflow = Object.keys(filters).length > 1;

        if (search === "song" && !this.source.multipleFilters && argOverflow) {
            throw Error(
                "error: Multiple filters are not allowed for this source"
            );
        }

        if (search === "anime" && argOverflow) {
            throw Error("error: Multiple filters are not allowed for anime");
        }
    }

    private async searchSong(query: SongFilter) {
        try {
            this.checkFilters(query, "song");
            this.loader.start("Searching...\n");

            const result = await this.source.searchSong(query);
            if (!result.length) {
                this.loader.fail("No song found");
                process.exit();
            }

            this.loader.succeed(
                `${result.length} song${result.length > 1 ? "s" : ""} found`
            );
            const songData = await prompt.createSongPrompt(
                result,
                this.source.lyricsPreview
            );

            this.loader.start("Fetching song...\n");
            const [info, lyrics] = await this.source.fetchSong(songData);
            this.loader.stop();
            printSongInfo(info);

            const choice = await prompt.createLyricsPrompt(lyrics);
            printLyrics(choice);
        } catch (error: any) {
            this.program.error(error.message);
        }
    }

    private async searchAnime(query: AnimeFilter) {
        try {
            if (!this.source.searchAnime || !this.source.fetchAnime) {
                throw Error("error: This source doesn't provide anime search");
            }

            this.checkFilters(query, "anime");
            this.loader.start("Searching...\n");

            const result = await this.source.searchAnime(query);
            if (!result.length) {
                this.loader.fail("No anime found");
                process.exit();
            }

            this.loader.succeed(`${result.length} anime found`);
            const animeData = await prompt.createAnimePrompt(result);

            this.loader.start("Fetching anime...\n");
            const [animeInfo, songs] = await this.source.fetchAnime(animeData);
            this.loader.stop();
            printAnimeInfo(animeInfo);

            const songData = await prompt.createSongPrompt(songs, false);
            this.loader.start("Fetching song...\n");
            const [songInfo, lyrics] = await this.source.fetchSong(songData);
            this.loader.stop();
            printSongInfo(songInfo);

            const choice = await prompt.createLyricsPrompt(lyrics);
            printLyrics(choice);
        } catch (error: any) {
            this.program.error(error.message);
        }
    }
}

export default UtaCLI;
