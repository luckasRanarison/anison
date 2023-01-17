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

export { parseRomajiLyrics, parseKanjiLyrics };
