class Utaten implements LyricsSource {
    public name = "utaten";
    public baseUrl = "https://utaten.com";
    public language = "japanese";
    public lyricsPreview = true;
    public multipleFilters = true;

    searchSong(query: SongQuery): Promise<SongResult[]> {
        throw new Error("Method not implemented.");
    }

    fetchSong(data: SongResult): Promise<SongEntry> {
        throw new Error("Method not implemented.");
    }
}

export default Utaten;
