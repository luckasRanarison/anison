import chalk from "chalk";

const parseRomajiLyrics = (lyrics: string): string => {
    return lyrics
        .replace(/<br>/g, "\n")
        .replace(/<div[^>]*>(.*?)<\/div>/, "")
        .replace(/<span[^>]*>(.*?)<\/span>/, "")
        .replace(/\[thanks for visiting animesonglyrics.com\]/g, "")
        .replace(/<hr>/, chalk.gray("    --------------------"))
        .replace(/\[(.*?)\]/g, (match) => chalk.cyan(match))
        .replace(/\(.*\)/g, (match) => chalk.gray(match))
        .split("\n") // remove empty spaces at the start of each line
        .map((line) => line.trimStart())
        .join("\n");
};

const parseKanjiLyrics = (lyrics: string): string => {
    lyrics = rubyParser(lyrics);

    return lyrics
        .replace(/<br>/g, "\n")
        .replace(/<div[^>]*>(.*?)<\/div>/, "")
        .replace(/<span[^>]*>(.*?)<\/span>/, "")
        .replace(/<hr>/, chalk.gray("    --------------------"))
        .replace(/\[thanks for visiting animesonglyrics.com\]/g, "")
        .replace(/\[(.*?)\]/g, (match) => chalk.cyan(match))
        .replace(/\(.*\)/g, (match) => chalk.gray(match));
};

const rubyParser = (str: string): string => {
    const rubyTags = str.match(/<ruby>.*?<rb>([^<]+)<\/rb>.*?<\/ruby>/g);

    if (rubyTags) {
        rubyTags.forEach((tag) => {
            let match = tag.match(/<rb>([^<]+)<\/rb>/);
            if (match) {
                str = str.replace(tag, match[1]);
            }
        });
    }

    return str;
};

const infoMap: any = {
    Episodes: "episodes",
    Description: "description",
    "Japanese Title": "japanseTitle",
    "English Title": "englishTitle",
    "From Anime": "anime",
    "From Season": "season",
    "Performed by": "artist",
    "Lyrics by": "lyricsWritter",
    "Composed by": "compositor",
    "Arranged by": "arrangement",
    "Released:": "releaseDate",
};

const parseInfo = (info: string): any => {
    const songInfo: any = {};

    if (info) {
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
                    const infoKey = infoMap[key];
                    const matchLink = prop.match(/<a.*?>(.*?)<\/a>/s); // nested tag

                    if (matchLink) prop = matchLink[1];

                    songInfo[infoKey] = prop;
                }
            });
        }
    }

    return songInfo;
};

export { parseRomajiLyrics, parseKanjiLyrics, parseInfo, infoMap };
