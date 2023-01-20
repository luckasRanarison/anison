import chalk from "chalk";

function printSongInfo(info: SongInfo) {
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
}

function printAnimeInfo(info: AnimeInfo) {
    const infoMap = new Map<keyof AnimeInfo, string>([
        ["title", "Title"],
        ["japaneseTitle", "Japanese Title"],
        ["englishTitle", "English Title"],
        ["releaseDate", "Released"],
        ["url", "URL"],
    ]);

    for (const key of infoMap.keys()) {
        if (info[key]) {
            console.log(`${chalk.cyan(infoMap.get(key) + ":")} ${info[key]}`);
        }
    }

    console.log(chalk.gray("   -------------------"));
}

// todo
function printLyrics(lyrics: LyricsObject) {
    console.log(lyrics.colorized);
}

export { printSongInfo, printLyrics, printAnimeInfo };
