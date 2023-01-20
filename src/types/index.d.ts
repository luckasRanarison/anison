interface LyricsSource {
    name: string;
    baseUrl: string;
    language: string;
    lyricsPreview: boolean;
    multipleFilters: boolean;

    searchSong(query: SongQuery): Promise<SongResult[]>;
    fetchSong(data: SongResult): Promise<[SongInfo, SongLyrics]>;
    searchAnime?(query: AnimeQuery): Promise<AnimeResult[]>;
    fetchAnime?(data: AnimeResult): Promise<[AnimeInfo, SongResult[]]>;
}

interface AnimeQuery {
    title: string;
    season: string;
    source: string;
}

interface SongQuery {
    title: string;
    artist: string;
    lyrics: string;
    source: string;
}

interface AnimeResult {
    title: string;
    originalTitle?: string[];
    url: string;
}

interface AnimeInfo extends AnimeResult {
    japaneseTitle?: string;
    englishTitle?: string;
    releaseDate?: string;
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
