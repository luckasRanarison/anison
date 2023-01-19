import chalk from "chalk";

const printInfo = (info: SongInfo) => {
    const infoMap = new Map<keyof SongInfo, string>([
        ["title", "Title"],
        ["japaneseTitle", "Japanese Title"],
        ["englishTitle", "English Title"],
        ["description", "Description"],
        ["episodes", "Episodes"],
        ["anime", "From Anime"],
        ["season", "From Seaso"],
        ["artist", "Performed by"],
        ["lyricsWritter", "Lyrics by"],
        ["compositor", "Composed by"],
        ["arrangement", "Arranged by"],
        ["releaseDate", "Released"],
        ["url", "URL"],
    ]);

    for (const key of infoMap.keys()) {
        if (info[key]) {
            console.log(`${chalk.cyan(infoMap.get(key) + ":")} ${info[key]}`);
        }
    }

    console.log(chalk.gray("   -------------------"));
}; // get the active filter

// todo
const printLyrics = (lyrics: LyricsObject) => {
    console.log(lyrics.colorized);
};

export { printInfo, printLyrics };
