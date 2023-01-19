import axios from "axios";
import chalk from "chalk";
import { load } from "cheerio";
import { rubyParser } from "../utils/parser";

class AnisonLyrics implements LyricsSource {
    public targetUrl: string;
    public language: string;
    public lyricsPreview: boolean;
    public multipleFilters: boolean;

    constructor() {
        this.targetUrl = "https://www.animesonglyrics.com";
        this.language = "english";
        this.lyricsPreview = true;
        this.multipleFilters = false;
    }

    public async searchSong(query: QueryFilter): Promise<SongResult[]> {
        try {
            // get the active filters (args)
            const [type, value] = Object.entries(query).find(
                ([type, _query]) => type
            ) as [keyof QueryFilter, string];
            const keyword = value.split(" ");

            const token = await this.getToken();
            const url = `${this.targetUrl}/results?_token=${token}&q=${value}`;
            const res = await axios.get(url);
            const parsedResult = this.parseSongResult(res.data);

            const match = (str: any, keyword: string[]): boolean =>
                keyword.some((word) => new RegExp(word, "i").test(str));

            // filter results manually
            const result = parsedResult.filter(
                (result) => match(result[type], keyword) && url
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
            const parsedInfo = info ? this.parseInfo(info) : data;

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

    public async searchAnime(query: string): Promise<AnimeResult[]> {
        throw new Error("Method not implemented.");
    }

    public async fetchAnime(url: string): Promise<AnimeResult[]> {
        throw new Error("Method not implemented.");
    }

    private async getToken(): Promise<string | undefined> {
        try {
            const res = await axios.get(this.targetUrl);
            const $ = load(res.data);
            const token = $("[name=_token]").first().attr("value");
            return token;
        } catch {
            throw Error(
                "error: An error occured, verify your internet connection"
            );
        }
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

    private parseInfo(info: string): SongInfo {
        try {
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

            const songInfo: any = {};
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
                        const infoKey = infoMap.get(key);
                        const matchLink = prop.match(/<a.*?>(.*?)<\/a>/s); // nested tag

                        if (matchLink) prop = matchLink[1];
                        if (infoKey) songInfo[infoKey] = prop;
                    }
                });
            }

            return songInfo;
        } catch (error) {
            throw new Error("error: An error occured when parsing data.");
        }
    }

    private parseLyrics(lyrics: any): SongLyrics {
        try {
            const parsed: SongLyrics = {};

            if (lyrics.romajiLyrics) {
                parsed.romajiLyrics = this.parseRomaji(lyrics.romajiLyrics);
            }

            if (lyrics.englishLyrics) {
                parsed.englishLyrics = this.parseRomaji(lyrics.englishLyrics);
            }

            if (lyrics.kanjiLyrics) {
                parsed.kanjiLyrics = this.parseKanji(lyrics.kanjiLyrics);
            }

            return parsed;
        } catch (error) {
            throw Error("error: An error occured when parsing data");
        }
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
        kanji = rubyParser(kanji);

        const raw = kanji
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
}

export default AnisonLyrics;
