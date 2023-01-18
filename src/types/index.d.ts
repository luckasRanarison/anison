type QueryType = "anime" | "name" | "artist" | "lyrics";

type QueryMatch = {
    [key in QueryType]: boolean;
};

type SearchOption = {
    anime: string;
    name: string;
    artist: string;
    lyrics: string;
};

interface AnimeResult {
    title: string;
    originalTitle: string[];
    url: string;
}

interface SongResult {
    anime: string;
    artist: string;
    title: string;
    lyrics: string;
    url: string;
}

interface SongEntry extends SongResult {
    japaneseTitle?: string;
    englishTitle?: string;
    description?: string;
    season?: string;
    lyricsWritter?: string;
    compositor?: string;
    arrangement?: string;
    episodes?: string;
    releaseDate?: string;
    romajiLyrics?: string;
    englishLyrics?: string;
    kanjiLyrics?: string;
}
