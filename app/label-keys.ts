/**
 * Derives the two lookup keys published for every pull request label:
 *  - `slug`:   lowercase, dash separated (used in the step outputs)
 *  - `envVar`: GITHUB_PR_LABEL_ + upper snake case, ASCII only
 */

export interface LabelKeys {
    slug: string;
    envVar: string;
}

const ENV_PREFIX = 'GITHUB_PR_LABEL_';

// Straight and curly single/double quotes are dropped rather than replaced,
// so "don't" becomes "dont" instead of "don-t".
const QUOTES = /['"‘’“”]/g;

// Letters with no NFD decomposition, mapped to a conventional ASCII form.
const LATIN_EXTRAS = new Map<string, string>([
    ['ß', 'ss'], ['ſ', 's'], ['ı', 'i'],
    ['Æ', 'Ae'], ['æ', 'ae'], ['Œ', 'Oe'], ['œ', 'oe'],
    ['Ø', 'O'], ['ø', 'o'], ['Ł', 'L'], ['ł', 'l'],
    ['Ð', 'D'], ['ð', 'd'], ['Đ', 'D'], ['đ', 'd'],
    ['Þ', 'Th'], ['þ', 'th'], ['Ħ', 'H'], ['ħ', 'h'],
    ['Ŧ', 'T'], ['ŧ', 't'], ['Ĳ', 'IJ'], ['ĳ', 'ij'],
    ['Ŋ', 'Ng'], ['ŋ', 'ng'],
]);

function foldToAscii(input: string): string {
    return Array.from(input.normalize('NFD'))
        .filter((ch) => !/\p{Mn}/u.test(ch))
        .map((ch) => LATIN_EXTRAS.get(ch) ?? ch)
        .join('');
}

function toSlug(label: string): string {
    return label
        .replace(QUOTES, '')
        .replace(/[^\p{L}\p{N}]+/gu, '-')
        .toLowerCase();
}

function toEnvVar(label: string): string {
    const body = foldToAscii(label)
        .replace(QUOTES, '')
        .replace(/[\W_]+/g, '_')
        .toUpperCase();
    return ENV_PREFIX + body;
}

export function keysFor(label: string): LabelKeys {
    return {slug: toSlug(label), envVar: toEnvVar(label)};
}
