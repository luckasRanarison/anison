import axios from "axios";
import chalk from "chalk";
import { load } from "cheerio";
import { rubyParser } from "../utils/parser";
import { getActiveArg } from "../utils/args";

class AnisonLyrics implements LyricsSource {
    public name = "animesonglyrics";
    public baseUrl = "https://www.animesonglyrics.com";
    public language = "english";
    public lyricsPreview = true;
    public multipleFilters = false;

    public async searchSong(query: SongQuery): Promise<SongResult[]> {
        try {
            const arg = getActiveArg(query);
            const keyword = arg.value.split(" ");

            const token = await this.getToken();
            const url = `${this.baseUrl}/results?_token=${token}&q=${arg.value}`;
            const res = await axios.get(url);
            const parsedResult = this.parseSongResult(res.data);

            const match = (str: string, keyword: string[]): boolean =>
                keyword.some((word) => new RegExp(word, "i").test(str));

            // filter results manually
            const result = parsedResult.filter((result) => {
                const str = result[arg.name as keyof SongResult];
                if (str) {
                    return match(str, keyword) && url; // has a valid url
                }
            });

            return result;
        } catch (error) {
            throw Error("error: An error occured when fetching data");
        }
    }

    public async fetchSong(data: SongResult): Promise<SongEntry> {
        try {
            const res = await axios.get(data.url);
            const $ = load(res.data);

            const rawInfo = $("#snginfo").html();
            const info = rawInfo ? this.parseSongInfo(rawInfo, data) : data;

            const romajiLyrics = $(".romajilyrics").html();
            const englishLyrics = $(".englishlyrics").html();
            const kanjiLyrics = $(".kanjilyrics").html();

            const rawLyrics: Record<string, string> = {};
            if (romajiLyrics) rawLyrics.romajiLyrics = romajiLyrics;
            if (kanjiLyrics) rawLyrics.kanjiLyrics = kanjiLyrics;
            if (englishLyrics) rawLyrics.englishLyrics = englishLyrics;

            const lyrics = this.parseLyrics(rawLyrics);

            return { info, lyrics };
        } catch (error) {
            throw new Error("error: An error occured when fetching data");
        }
    }

    public async searchAnime(query: AnimeQuery): Promise<AnimeResult[]> {
        try {
            const arg = getActiveArg(query);

            if (arg.name === "title") {
                const token = await this.getToken();
                const url = `${this.baseUrl}/results?_token=${token}&q=${arg.value}`;
                const res = await axios.get(url);
                const parsedResult = this.parseAnimeResult(res.data);

                return parsedResult;
            } else {
                throw Error("Method not implemented.");
            }
        } catch (error) {
            throw Error("error: An error occured when fetching data");
        }
    }

    public async fetchAnime(data: AnimeResult): Promise<AnimeEntry> {
        try {
            const res = await axios.get(data.url);
            const $ = load(res.data);

            const rawInfo = $("#artinfo").html();
            const info = rawInfo ? this.parseAnimeInfo(rawInfo, data) : data;

            const songs: SongResult[] = [];
            const rawSongs = $("#songlist")
                .find("a")
                .not("[href^='#']")
                .not("li > a");
            rawSongs.each(function () {
                const a = $(this);
                const title = a.text().trim();
                const url = a.attr("href") as string;

                songs.push({ anime: data.title, title, url });
            });

            return { info, songs };
        } catch (error) {
            throw new Error("error: An error occured when fetching data");
        }
    }

    private async getToken(): Promise<string | undefined> {
        const res = await axios.get(this.baseUrl);
        const $ = load(res.data);
        const token = $("[name=_token]").first().attr("value");

        return token;
    }

    private parseSongResult(data: string): SongResult[] {
        try {
            const $ = load(data);
            const songList = $("#songlist").find(".homesongs");

            const result: SongResult[] = [];
            songList.each((_index, song) => {
                const a = $(song).children("a");
                const anime = a.children("strong").text().trim();
                const [artist, title] = a
                    .contents()
                    .filter(function () {
                        return this.type === "text";
                    })
                    .text()
                    .trim()
                    .split("-");
                const url = a.attr("href") || "";
                const lyrics = a.find("i").text().trim();

                result.push({ anime, title, url, artist, lyrics });
            });

            return result;
        } catch (error) {
            throw Error("error: An error ocurred when parsing results");
        }
    }

    private parseAnimeResult(data: string): AnimeResult[] {
        try {
            const $ = load(data);
            const animeList = $("#titlelist").find(".homesongs");

            const result: AnimeResult[] = [];
            animeList.each((_index, anime) => {
                const a = $(anime).children("a");
                const title = a.text().trim();
                const originalTitle = a.attr("title")?.split("|");
                const url = a.attr("href") as string;

                result.push({ title, originalTitle, url });
            });

            return result;
        } catch (error) {
            throw Error("error: An error ocurred when parsing results");
        }
    }

    private parseLyrics(lyrics: Record<string, string>): SongLyrics {
        const parseMethods = new Map<keyof SongLyrics, LyricsParser>([
            ["romajiLyrics", this.parseRomaji],
            ["englishLyrics", this.parseRomaji],
            ["kanjiLyrics", this.parseKanji],
        ]);

        const parsed: SongLyrics = {};
        for (const key of parseMethods.keys()) {
            if (lyrics[key]) {
                const parse = parseMethods.get(key) as LyricsParser;
                parsed[key] = parse(lyrics[key]);
            }
        }

        return parsed;
    }

    private parseRomaji(romaji: string): LyricsObject {
        const raw = romaji
            .replace(/<br>/g, "\n")
            .replace(/<div[^>]*>(.*?)<\/div>/, "")
            .replace(/<span[^>]*>(.*?)<\/span>/, "")
            .replace(/\[thanks for visiting animesonglyrics.com\]/g, "")
            .split("\n") // remove empty spaces at the start of each line
            .map((line) => line.trimStart())
            .join("\n");

        const colorized = raw
            .replace(/<hr>/, chalk.gray("    --------------------"))
            .replace(/\[(.*?)\]/g, (match) => chalk.cyan(match))
            .replace(/\(.*\)/g, (match) => chalk.gray(match));

        return { raw, colorized };
    }

    private parseKanji(kanji: string): LyricsObject {
        const raw = rubyParser(kanji)
            .replace(/<br>/g, "\n")
            .replace(/<div[^>]*>(.*?)<\/div>/, "")
            .replace(/<span[^>]*>(.*?)<\/span>/, "")
            .replace(/\[thanks for visiting animesonglyrics.com\]/g, "");

        const colorized = raw
            .replace(/<hr>/, chalk.gray("    --------------------"))
            .replace(/\[(.*?)\]/g, (match) => chalk.cyan(match))
            .replace(/\(.*\)/g, (match) => chalk.gray(match));

        return { raw, colorized };
    }

    private parseInfo(
        info: string,
        existingInfo: SongInfo | AnimeInfo,
        map: Map<string, keyof SongInfo | keyof AnimeInfo>
    ): SongInfo | AnimeInfo {
        const parsedInfo = existingInfo;
        const match = info.match(
            /<strong>(.*?)<\/strong>(?::|[\s\r\n]+)(.*?)<br>/gs
        );

        if (!match) {
            return parsedInfo;
        }

        for (const value of match) {
            const singleMatch = value.match(
                /<strong>(.*?)<\/strong>(?::|[\s\r\n]+)(.*?)<br>/s
            );
            if (singleMatch) {
                const key = singleMatch[1].trim().replace("\n", "");
                let prop = singleMatch[2].trim().replace("\n", "");
                const infoKey = map.get(key) as keyof (SongInfo | AnimeInfo);

                const matchLink = prop.match(/<a.*?>(.*?)<\/a>/s);

                if (matchLink) prop = matchLink[1];
                if (infoKey) parsedInfo[infoKey] = prop;
            }
        }

        return parsedInfo;
    }

    private parseSongInfo(info: string, existingInfo: SongInfo): SongInfo {
        const infoMap = new Map<string, keyof SongInfo>([
            ["Episodes", "episodes"],
            ["Description", "description"],
            ["Japanese Title", "japaneseTitle"],
            ["English Title", "englishTitle"],
            ["From Anime", "anime"],
            ["From Season", "season"],
            ["Performed by", "artist"],
            ["Lyrics by", "lyricsWritter"],
            ["Composed by", "compositor"],
            ["Arranged by", "arrangement"],
            ["Released:", "releaseDate"],
        ]);
        const songInfo = this.parseInfo(info, existingInfo, infoMap);

        return songInfo as SongInfo;
    }

    private parseAnimeInfo(info: string, existingInfo: AnimeInfo): AnimeInfo {
        const infoMap = new Map<string, keyof AnimeInfo>([
            ["Japanese Title", "japaneseTitle"],
            ["English Title", "englishTitle"],
            ["Released:", "releaseDate"],
        ]);

        const animeInfo = this.parseInfo(info, existingInfo, infoMap);

        return animeInfo as AnimeInfo;
    }
}

export default AnisonLyrics;
