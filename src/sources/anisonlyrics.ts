import axios from "axios";
import chalk from "chalk";
import { load } from "cheerio";
import { rubyParser } from "../utils/parser";
import { getActiveArgProps } from "../utils/args";

class AnisonLyrics implements LyricsSource {
    public baseUrl: string;
    public language: string;
    public lyricsPreview: boolean;
    public multipleFilters: boolean;

    constructor() {
        this.baseUrl = "https://www.animesonglyrics.com";
        this.language = "english";
        this.lyricsPreview = true;
        this.multipleFilters = false;
    }

    public async searchSong(query: SongFilter): Promise<SongResult[]> {
        try {
            const [name, value] = getActiveArgProps(query);
            const keyword = value.split(" ");

            const token = await this.getToken();
            const url = `${this.baseUrl}/results?_token=${token}&q=${value}`;
            const res = await axios.get(url);
            const parsedResult = this.parseSongResult(res.data);

            const match = (str: any, keyword: string[]): boolean =>
                keyword.some((word) => new RegExp(word, "i").test(str));

            // filter results manually
            const result = parsedResult.filter(
                (result) =>
                    match(result[name as keyof SongFilter], keyword) && url
            );

            return result;
        } catch (error) {
            throw Error("error: An error occured when fetching data");
        }
    }

    public async fetchSong(data: SongResult): Promise<[SongInfo, SongLyrics]> {
        try {
            const res = await axios.get(data.url);
            const $ = load(res.data);

            const info = $("#snginfo").html();
            const parsedInfo = info ? this.parseSongInfo(info) : data;

            if (!parsedInfo.url) {
                parsedInfo.url = data.url;
                parsedInfo.title = data.title;
            }

            const romajiLyrics = $(".romajilyrics").html();
            const englishLyrics = $(".englishlyrics").html();
            const kanjiLyrics = $(".kanjilyrics").html();

            const lyrics: any = {};
            if (romajiLyrics) lyrics.romajiLyrics = romajiLyrics;
            if (kanjiLyrics) lyrics.kanjiLyrics = kanjiLyrics;
            if (englishLyrics) lyrics.englishLyrics = englishLyrics;

            const parsedLyrics = this.parseLyrics(lyrics);

            return [parsedInfo, parsedLyrics];
        } catch (error) {
            throw new Error("error: An error occured when fetching data");
        }
    }

    public async searchAnime(query: AnimeFilter): Promise<AnimeResult[]> {
        try {
            const [name, value] = getActiveArgProps(query);

            if (name === "title") {
                const token = await this.getToken();
                const url = `${this.baseUrl}/results?_token=${token}&q=${value}`;
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

    public async fetchAnime(
        data: AnimeResult
    ): Promise<[AnimeInfo, SongResult[]]> {
        try {
            const res = await axios.get(data.url);
            const $ = load(res.data);

            const info = $("#artinfo").html();
            const parsedInfo = info ? this.parseAnimeInfo(info) : data;
            parsedInfo.title = data.title;

            const result: SongResult[] = [];
            const songs = $("#songlist")
                .find("a")
                .not("[href^='#']")
                .not("li > a");
            songs.each(function () {
                const a = $(this);
                const title = a.text().trim();
                const url = a.attr("href") as string;

                result.push({ anime: data.title, title, url });
            });

            return [parsedInfo, result];
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
                let lyrics = a.find("i").text().trim();

                result.push({ anime, title, url, artist, lyrics });
            });

            return result;
        } catch (error) {
            throw Error("error: An error ocurred when parsing results");
        }
    }

    private parseAnimeResult(data: any): AnimeResult[] {
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

    private parseLyrics(lyrics: SongLyrics): SongLyrics {
        const parseMethods = new Map<keyof SongLyrics, any>([
            ["romajiLyrics", this.parseRomaji],
            ["englishLyrics", this.parseRomaji],
            ["kanjiLyrics", this.parseKanji],
        ]);

        const parsed: SongLyrics = {};
        for (const key of parseMethods.keys()) {
            if (lyrics[key]) {
                const parse = parseMethods.get(key);
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

    private parseInfo(info: string, map: Map<string, any>) {
        const parsedInfo: any = {};
        const match = info.match(
            /<strong>(.*?)<\/strong>(?::|[\s\r\n]+)(.*?)<br>/gs
        );

        if (match) {
            match.forEach((value) => {
                const singleMatch = value.match(
                    /<strong>(.*?)<\/strong>(?::|[\s\r\n]+)(.*?)<br>/s
                );
                if (singleMatch) {
                    const key = singleMatch[1].trim().replace("\n", "");
                    let prop = singleMatch[2].trim().replace("\n", "");
                    const infoKey = map.get(key);
                    const matchLink = prop.match(/<a.*?>(.*?)<\/a>/s); // nested tag

                    if (matchLink) prop = matchLink[1];
                    if (infoKey) parsedInfo[infoKey] = prop;
                }
            });
        }

        return parsedInfo;
    }

    private parseSongInfo(info: string): SongInfo {
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
        const songInfo: SongInfo = this.parseInfo(info, infoMap);

        return songInfo;
    }

    private parseAnimeInfo(info: string): AnimeInfo {
        const infoMap = new Map<string, keyof AnimeInfo>([
            ["Japanese Title", "japaneseTitle"],
            ["English Title", "englishTitle"],
            ["Released:", "releaseDate"],
        ]);

        const animeInfo: AnimeInfo = this.parseInfo(info, infoMap);

        return animeInfo;
    }
}

export default AnisonLyrics;
