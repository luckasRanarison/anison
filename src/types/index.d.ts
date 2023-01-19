type SearchOption = {
    name: string;
    artist: string;
    lyrics: string;
};

interface LyricsSource {
    targetUrl: string;
    language: string;
    lyricsPreview: boolean;

    searchSong(query: string, type: string): Promise<SongResult[]>;
    fetchSong(data: SongResult): Promise<[SongInfo, SongLyrics]>;
    searchAnime?(query: string): Promise<AnimeResult[]>;
    fetchAnime?(url: string): Promise<AnimeResult[]>;
}

interface AnimeResult {
    title: string;
    originalTitle: string[];
    url: string;
}

interface SongResult {
    anime?: string;
    artist?: string;
    title: string;
    lyrics?: string;
    url: string;
}

interface SongInfo extends SongResult {
    japaneseTitle?: string;
    englishTitle?: string;
    description?: string;
    season?: string;
    lyricsWritter?: string;
    compositor?: string;
    arrangement?: string;
    episodes?: string;
    releaseDate?: string;
}

interface LyricsObject {
    raw: string;
    colorized: string;
}

interface SongLyrics {
    romajiLyrics?: LyricsObject;
    englishLyrics?: LyricsObject;
    kanjiLyrics?: LyricsObject;
}
