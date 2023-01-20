/**
 * defines a set of properties and methods of a lyrics source class
 */
interface LyricsSource {
    name: string;
    baseUrl: string;
    language: string;
    lyricsPreview: boolean;
    multipleFilters: boolean;

    /**
     * @param query - list of filters
     */
    searchSong(query: SongQuery): Promise<SongResult[]>;

    /**
     * fetch a song relevant data
     * @param data - minimal song data (only the URL will be used for fetching)
     */
    fetchSong(data: SongResult): Promise<SongEntry>;

    /**
     * @param query - whether title or season but as an object
     */
    searchAnime?(query: AnimeQuery): Promise<AnimeResult[]>;

    /**
     * fetch an anime relevant data and its songs
     * @param data - minimal anime data (only the URL will be used for fetching)
     */
    fetchAnime?(data: AnimeResult): Promise<AnimeEntry>;
}

/**
 * argument passed to a searchSong() function
 */
interface SongQuery {
    title?: string;
    artist?: string;
    lyrics?: string;
    source?: string;
}

/**
 * result of a searchSong() function
 */
interface SongResult {
    anime?: string;
    artist?: string;
    title: string;
    lyrics?: string;
    url: string;
}

/**
 * more detailed informations about the song
 */
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

/**
 * result of a fetchSong() function
 */
interface SongEntry {
    info: SongInfo;
    lyrics: SongLyrics;
}

/**
 * used to separate the raw and colorize text using chalk
 */
interface LyricsObject {
    raw: string;
    colorized: string;
}

/**
 * a collection of lyrics format
 */
interface SongLyrics {
    romajiLyrics?: LyricsObject;
    englishLyrics?: LyricsObject;
    kanjiLyrics?: LyricsObject;
}

/**
 * argument passed to a searchAnime() function
 */
interface AnimeQuery {
    title?: string;
    season?: string;
    source?: string;
}

/**
 * result of a fetchAnime() function
 */
interface AnimeResult {
    title: string;
    originalTitle?: string[];
    url: string;
}

/**
 * more detailed informations about the anime
 */
interface AnimeInfo extends AnimeResult {
    japaneseTitle?: string;
    englishTitle?: string;
    releaseDate?: string;
}

/**
 * result of a fetchAnime() function
 */
interface AnimeEntry {
    info: AnimeInfo;
    songs: SongResult[];
}
