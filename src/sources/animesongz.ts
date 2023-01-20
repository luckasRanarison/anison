class Anisongz implements LyricsSource {
    public name: string = "animesongz";
    public baseUrl: string = "https://animesongz.com";
    public language: string = "japanese";
    public lyricsPreview: boolean = false;
    public multipleFilters: boolean = false;

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
