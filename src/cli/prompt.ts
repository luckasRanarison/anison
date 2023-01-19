import chalk from "chalk";
import inquirer from "inquirer";

async function createSongPrompt(
    result: SongResult[],
    lyricsPreview: boolean
): Promise<SongResult> {
    const choices: any[] = result.reduce((acc: any[], item, index) => {
        const name: any = `${index + 1}) ${item.anime} ${
            item.artist ? `${item.artist}-` : `:`
        }${chalk.bold(item.title)}`;
        const value: any = { title: item.title, url: item.url };

        if (lyricsPreview) {
            const lyrics: any = new inquirer.Separator(chalk.gray(item.lyrics));
            return acc.concat([{ name, value }, lyrics]);
        } else {
            return acc.concat([{ name, value }]);
        }
    }, []);

    const choice = await inquirer.prompt({
        type: "list",
        name: "data",
        message: "Songs results",
        prefix: "♪",
        choices,
    });

    return choice.data;
}

async function createLyricsPrompt(lyrics: SongLyrics): Promise<LyricsObject> {
    const lyricsMap = new Map<keyof SongLyrics, string>([
        ["romajiLyrics", "Romaji"],
        ["englishLyrics", "English"],
        ["kanjiLyrics", "Kanji"],
    ]);

    let noLyrics = true;
    for (const key of lyricsMap.keys()) {
        if (lyrics[key]) {
            noLyrics = false;
        }
    }

    if (noLyrics) {
        console.log(chalk.bold("No lyrics available"));
        process.exit();
    }

    const choices: any[] = [];
    lyricsMap.forEach((value, key) => {
        if (lyrics[key]) {
            choices.push({ name: value, value: lyrics[key] });
        }
    });

    const choice = await inquirer.prompt({
        type: "list",
        name: "format",
        message: "Choose the lyrics format",
        prefix: "Aa",
        choices,
    });

    return choice.format;
}

async function createAnimePrompt(result: AnimeResult[]) {
    const choices: any[] = result.reduce((acc: any[], item, index) => {
        const name: any = `${index + 1}) ${item.title} ${
            item.originalTitle
                ? chalk.gray(`(${item.originalTitle.join("")})`)
                : ""
        }`;
        const value: any = { title: item.title, url: item.url };

        return acc.concat([{ name, value }]);
    }, []);

    const choice = await inquirer.prompt({
        type: "list",
        name: "data",
        message: "Anime results",
        prefix: "⏵",
        choices,
    });

    return choice.data;
}

export { createSongPrompt, createLyricsPrompt, createAnimePrompt };
