import ora, { Ora } from "ora";
import { Command } from "commander";
import * as output from "./output";
import * as prompt from "./prompt";
import { version } from "../../package.json";
import { AnisonLyrics } from "../sources";
import defaultConfig from "../config/default";

class UtaCLI {
    private config: UtaConfig;
    private program: Command;
    private loader: Ora;
    private source?: LyricsSource;

    constructor(config = defaultConfig) {
        this.config = config;
        this.program = this.defineProgram();
        this.loader = ora({ spinner: "dots" });
    }

    public parse(args: string[]) {
        this.program.parse(args);
    }

    private defineProgram(): Command {
        const program = new Command();
        const defaultSource = this.config.defaultSource;

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
            .option("-S, --source <source>", "Specify source", defaultSource)
            .action((options: SongQuery) => this.searchSong(options));

        program
            .command("anime")
            .description("Search a specific anime song")
            .allowExcessArguments(false)
            .option("-t, --title <title>", "Search by title")
            .option("-s, --season <season>", "Search by season")
            .option("-S, --source <source>", "Specify source", defaultSource)
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

    // to fix
    private isInvalidArg(args: SongQuery | AnimeQuery) {
        const argsCount = Object.keys(args).length;

        if (!argsCount) {
            throw Error("error: No option provided");
        }

        return args.source ? argsCount > 2 : argsCount > 1;
    }

    private async searchSong(query: SongQuery) {
        try {
            this.source = this.getSource(query.source);

            if (!this.source.multipleFilters && this.isInvalidArg(query)) {
                throw Error(
                    "error: Multiple filters are not allowed for this source"
                );
            }

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
            const song = await this.source.fetchSong(songData);

            this.loader.stop();
            output.printSongInfo(song.info);

            const choice = await prompt.createLyricsPrompt(song.lyrics);
            output.printLyrics(choice);
        } catch (error: unknown) {
            if (error instanceof Error) {
                this.program.error(error.message);
            }
        }
    }

    private async searchAnime(query: AnimeQuery) {
        try {
            this.source = this.getSource(query.source);

            if (!this.source.searchAnime || !this.source.fetchAnime) {
                throw Error("error: This source doesn't provide anime search");
            }

            if (this.isInvalidArg(query)) {
                throw Error(
                    "error: Multiple filters are not allowed for anime"
                );
            }

            this.loader.start("Searching...\n");
            const result = await this.source.searchAnime(query);
            if (!result.length) {
                this.loader.fail("No anime found");
                process.exit();
            }

            this.loader.succeed(`${result.length} anime found`);
            const animeData = await prompt.createAnimePrompt(result);

            this.loader.start("Fetching anime...\n");
            const anime = await this.source.fetchAnime(animeData);

            this.loader.stop();
            output.printAnimeInfo(anime.info);

            const songData = await prompt.createSongPrompt(anime.songs, false);

            this.loader.start("Fetching song...\n");
            const song = await this.source.fetchSong(songData);

            this.loader.stop();
            output.printSongInfo(song.info);

            const choice = await prompt.createLyricsPrompt(song.lyrics);
            output.printLyrics(choice);
        } catch (error: unknown) {
            if (error instanceof Error) {
                this.program.error(error.message);
            }
        }
    }
}

export default UtaCLI;
