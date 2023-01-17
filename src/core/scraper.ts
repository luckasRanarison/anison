import axios from "axios";
import chalk from "chalk";
import { load, CheerioAPI } from "cheerio";

class AnisoScraper {
    private static async getToken(): Promise<string | undefined> {
        try {
            const res = await axios.get("https://www.animesonglyrics.com");
            const $ = load(res.data);
            const token = $("[name=_token]").first().attr("value");
            return token;
        } catch {
            console.error("error: verify your internet connection");
            process.exit(2);
        }
    }

    private static async getParser(query: string): Promise<CheerioAPI> {
        try {
            const token = await this.getToken();
            const url = `https://www.animesonglyrics.com/results?_token=${token}&q=${query}`;
            const res = await axios.get(url);
            return load(res.data);
        } catch (error) {
            console.error("error: error when fetching data");
            process.exit(2);
        }
    }

    static async searchSong(
        query: string,
        type: QueryType
    ): Promise<SongResult[]> {
        const $ = await this.getParser(query);
        const songList = $("#songlist").find(".homesongs");
        const keyword = query.split(" ");

        const result: any[] = [];
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
            const url = a.attr("href") as string;
            let lyrics = a.find("i").text().trim();

            const match = (str: string, keyword: string[]): boolean => {
                return keyword.some((word) => new RegExp(word, "i").test(str));
            };

            const matchList: QueryMatch = {
                anime: match(anime, keyword),
                name: match(title, keyword),
                artist: match(artist, keyword),
                lyrics: match(lyrics, keyword),
            };

            if (matchList[type] && url) {
                if (type === "lyrics") {
                    keyword.forEach((word) => {
                        lyrics = lyrics.replace(
                            new RegExp(word, "i"),
                            chalk.red(word)
                        );
                    });
                }

                result.push({ anime, artist, title, url, lyrics });
            }
        });

        return result;
    }

    // to do
    static async fetchSong() {}

    // to do
    static async searchAnime() {
        // const animeList = $("#titlelist").find(".homesongs");
        // animeList.each((_index, anime) => {
        // const a = $(anime).find("a");
        // const title = a.text().trim();
        // const originalTitle = a.attr("title")?.split("|");
        // const url = a.attr("href");
        // result.push({ title, originalTitle, url });
        // });
    }
}

export default AnisoScraper;
