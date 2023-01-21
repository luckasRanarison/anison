import { AnisonLyrics } from "../../src/sources";

describe("searchSong()", () => {
    jest.setTimeout(8000); // may take more than 5s due to the double requests

    it("should get 3 results (title)", async () => {
        const source = new AnisonLyrics();
        const result = await source.searchSong(<SongQuery>{
            title: "shukufuku",
        });
        expect(result.length).toBe(3);
    });

    it("should get 4 results (artist)", async () => {
        const source = new AnisonLyrics();
        const result = await source.searchSong(<SongQuery>{
            artist: "yoasobi",
        });
        expect(result.length).toBe(4);
    });

    it("should get 10 results (lyrics)", async () => {
        const source = new AnisonLyrics();
        const result = await source.searchSong(<SongQuery>{
            lyrics: "kowashite",
        });
        expect(result.length).toBe(10);
    });
});

describe("fetchSong()", () => {
    it("should have all lyrics formats", async () => {
        const source = new AnisonLyrics();
        const song = await source.fetchSong(<SongResult>{
            url: "https://www.animesonglyrics.com/your-lie-in-april/orange-acoustic-ver",
        });
        const lyricsKeys = Object.keys(song.lyrics);
        expect(lyricsKeys.length).toBe(3);
    });

    it("should have all informations keys", async () => {
        const source = new AnisonLyrics();
        const song = await source.fetchSong({
            title: "Orange (Acoustic Ver.)",
            url: "https://www.animesonglyrics.com/your-lie-in-april/orange-acoustic-ver",
        });
        const infoKeys = Object.keys(song.info);
        expect(infoKeys.length).toBe(11);
    });
});

describe("searchAnime()", () => {
    jest.setTimeout(8000);

    it("should get 2 results", async () => {
        const source = new AnisonLyrics();
        const result = await source.searchAnime(<AnimeQuery>{
            title: "noragami",
        });
        expect(result.length).toBe(2);
    });
});

describe("fetchAnime()", () => {
    it("should have 2 songs", async () => {
        const source = new AnisonLyrics();
        const anime = await source.fetchAnime(<AnimeResult>{
            url: "https://www.animesonglyrics.com/noragami-aragoto",
        });
        expect(anime.songs.length).toBe(2);
    });
});
