/**
 * Renders a label name as a coloured badge for the Actions log, using the
 * label's own GitHub colour as the background (24-bit ANSI escapes).
 */

const ESC = '\x1b';

function hexToRgb(hex: string): number[] | null {
    if (!/^[\da-f]{6}$/i.test(hex)) {
        return null;
    }
    return [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
}

export function badge(label: string, hex: string): string {
    const rgb = hexToRgb(hex);
    if (rgb === null) {
        return label;
    }
    const average = rgb.reduce((sum, channel) => sum + channel, 0) / rgb.length;
    const textRgb = average > 175 ? [0, 0, 0] : [255, 255, 255];
    const bg = `${ESC}[48;2;${rgb.join(';')}m`;
    const fg = `${ESC}[38;2;${textRgb.join(';')}m`;
    return `${bg}${fg} ${label} ${ESC}[0m`;
}
