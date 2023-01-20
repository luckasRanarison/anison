import ora, { Ora } from "ora";
import { Command } from "commander";
import * as output from "./output";
import * as prompt from "./prompt";
import { version } from "../../package.json";
import { defaultConfig } from "../config/default";
import AnisonLyrics from "../sources/anisonlyrics";

class UtaCLI {
    private program: Command;
    private loader: Ora;
    private source: LyricsSource;
    private config: typeof defaultConfig;

    constructor(config: any) {
        this.program = this.defineProgram();
        this.loader = ora();
        this.config = config;
        this.source = this.getSource(this.config.defaultSource);
    }

    public run() {
        this.program.parse();
    }

    public error(message: string) {
        this.program.error(message);
    }

    private defineProgram(): Command {
        const program = new Command();

        program
            .name("uta")
            .description("Japanse song lyrics websites scraper")
            .version(version, "-v, --version");

        program
            .command("song")
            .description("Search song by title, artist or lyrics")
            .allowExcessArguments(false)
            .option("-a, --artist <artist>", "Search by artist")
            .option("-t, --title <title>", "Search by title")
            .option("-l, --lyrics <lyrics>", "Search by lyrics")
            .option("-S, --source <source>", "Specify source")
            .action((options: SongQuery) => this.searchSong(options));

        program
            .command("anime")
            .description("Search a specific anime song")
            .allowExcessArguments(false)
            .option("-t, --title <title>", "Search by title")
            .option("-s, --season <season>", "Search by season")
            .option("-S, --source <source>", "Specify source")
            .action((options: AnimeQuery) => this.searchAnime(options));

        return program;
    }

    private getSource(source: string): LyricsSource {
        switch (source) {
            case "animesonglyrics":
                return new AnisonLyrics();
            default:
                throw Error("error: Invalid source");
        }
    }

    private checkFilters(
        filters: SongQuery | AnimeQuery,
        search: "anime" | "song"
    ) {
        if (!Object.keys(filters).length) {
            throw Error("error: No option provided");
        }

        const argOverflow = filters.source
            ? Object.keys(filters).length > 2
            : Object.keys(filters).length > 1;

        if (search === "song" && !this.source.multipleFilters && argOverflow) {
            throw Error(
                "error: Multiple filters are not allowed for this source"
            );
        }

        if (search === "anime" && argOverflow) {
            throw Error("error: Multiple filters are not allowed for anime");
        }
    }

    private async searchSong(query: SongQuery) {
        try {
            if (query.source) {
                this.source = this.getSource(query.source);
            }

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
            output.printSongInfo(info);

            const choice = await prompt.createLyricsPrompt(lyrics);
            output.printLyrics(choice);
        } catch (error: any) {
            this.program.error(error.message);
        }
    }

    private async searchAnime(query: AnimeQuery) {
        try {
            if (query.source) {
                this.source = this.getSource(query.source);
            }

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
            output.printAnimeInfo(animeInfo);

            const songData = await prompt.createSongPrompt(songs, false);
            this.loader.start("Fetching song...\n");
            const [songInfo, lyrics] = await this.source.fetchSong(songData);
            this.loader.stop();
            output.printSongInfo(songInfo);

            const choice = await prompt.createLyricsPrompt(lyrics);
            output.printLyrics(choice);
        } catch (error: any) {
            this.program.error(error.message);
        }
    }
}

export default UtaCLI;
