/**
 * Parse furigana ruby tags and return the kanji writting of each tags
 * @param str - text containing ruby tags
 * @returns parsed kanji text
 */

function rubyParser(str: string): string {
    const rubyTags = str.match(/<ruby>.*?<rb>([^<]+)<\/rb>.*?<\/ruby>/g);

    if (rubyTags) {
        rubyTags.forEach((tag) => {
            let match = tag.match(/<rb>([^<]+)<\/rb>/);
            if (match) {
                str = str.replace(tag, match[1]);
            }
        });
    }

    return str;
}

export { rubyParser };
