import chalk from "chalk";

const printInfo = (info: SongInfo) => {
    const infoMap: any = {
        title: "Title",
        japanseTitle: "Japanese Title",
        englishTitle: "English Title",
        description: "Description",
        episodes: "Episodes",
        anime: "From Anime",
        season: "From Seaso",
        artist: "Performed by",
        lyricsWritter: "Lyrics by",
        compositor: "Composed by",
        arrangement: "Arranged by",
        releaseDate: "Released",
        url: "URL",
    };

    for (const key in infoMap) {
        if (info[key as keyof SongInfo]) {
            console.log(
                `${chalk.cyan(infoMap[key] + ":")} ${
                    info[key as keyof SongInfo]
                }`
            );
        }
    }

    console.log(chalk.gray("   -------------------"));
};

// todo
const printLyrics = (lyrics: LyricsObject) => {
    console.log(lyrics.colorized);
};

export { printInfo, printLyrics };
