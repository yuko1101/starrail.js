class TextUtils {
    static removeRuby(text: string): string {
        return text.replace(/{RUBY_B#.+?}(.+?){RUBY_E#}/g, "$1");
    }
}

export default TextUtils;