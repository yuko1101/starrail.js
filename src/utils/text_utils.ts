class TextUtils {

    static readonly rubyRegex = /{RUBY_B#(.+?)}(.+?){RUBY_E#}/g;

    static removeRuby(text: string): string {
        // same as this.replaceRuby(text, (match, base, ruby) => base);
        return text.replace(this.rubyRegex, "$2");
    }
    static replaceRuby(text: string, replacer: (match: string, base: string, ruby: string) => string): string {
        return text.replace(this.rubyRegex, (match, base, ruby) => replacer(match, base, ruby));
    }
}

export default TextUtils;