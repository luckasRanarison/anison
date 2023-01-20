class Utaten implements LyricsSource {
    public name: string = "utaten";
    public baseUrl: string = "https://utaten.com";
    public language: string = "japanese";
    public lyricsPreview: boolean = true;
    public multipleFilters: boolean = true;

    searchSong(query: SongQuery): Promise<SongResult[]> {
        throw new Error("Method not implemented.");
    }

    fetchSong(data: SongResult): Promise<SongEntry> {
        throw new Error("Method not implemented.");
    }
}

export default Utaten;
