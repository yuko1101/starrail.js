export const rubyRegex = /{RUBY_B#(.+?)}(.+?){RUBY_E#}/g;

export function removeRuby(text: string): string {
    // same as this.replaceRuby(text, (match, base, ruby) => base);
    return text.replace(rubyRegex, "$2");
}

export function replaceRuby(text: string, replacer: (match: string, base: string, ruby: string) => string): string {
    return text.replace(rubyRegex, (match, ruby, base) => replacer(match, base, ruby));
}
