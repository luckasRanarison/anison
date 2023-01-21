class Anisongz implements LyricsSource {
    public name = "animesongz";
    public baseUrl = "https://animesongz.com";
    public language = "japanese";
    public lyricsPreview = false;
    public multipleFilters = false;

    searchSong(query: SongQuery): Promise<SongResult[]> {
        throw new Error("Method not implemented.");
    }

    fetchSong(data: SongResult): Promise<SongEntry> {
        throw new Error("Method not implemented.");
    }

    searchAnime(query: AnimeQuery): Promise<AnimeResult[]> {
        throw new Error("Method not implemented.");
    }

    fetchAnime(data: AnimeResult): Promise<AnimeEntry> {
        throw new Error("Method not implemented.");
    }
}

export default Anisongz;
