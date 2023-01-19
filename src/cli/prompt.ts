import chalk from "chalk";
import inquirer from "inquirer";

const createSongPrompt = async (
    result: SongResult[],
    lyricsPreview: boolean
): Promise<SongResult> => {
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
};

const createLyricsPrompt = async (
    lyrics: SongLyrics
): Promise<LyricsObject> => {
    const lyricsMap = [
        { index: "romajiLyrics", value: "Romaji" },
        { index: "englishLyrics", value: "English" },
        { index: "kanjiLyrics", value: "Kanji" },
    ];

    const noLyrics = lyricsMap.every(
        ({ index }) => !lyrics[index as keyof SongLyrics]
    );

    if (noLyrics) {
        console.log(chalk.bold("No lyrics available"));
        process.exit();
    }

    const choices: any[] = [];
    for (const { index, value } of lyricsMap) {
        const entryKey = index as keyof SongLyrics;
        if (lyrics[entryKey]) {
            choices.push({ name: value, value: lyrics[entryKey] });
        }
    }

    const choice = await inquirer.prompt({
        type: "list",
        name: "format",
        message: "Choose the lyrics format",
        prefix: "Aa",
        choices,
    });

    return choice.format;
};

const createAnimePrompt = () => {};

export { createSongPrompt, createLyricsPrompt, createAnimePrompt };
