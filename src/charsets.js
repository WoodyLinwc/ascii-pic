/**
 * ASCII character sets for different visual styles
 * Characters are ordered from darkest to lightest
 */

const CHARSETS = {
    // Detailed set with many gradations
    detailed: "@%#*+=-:. ",

    // Unicode block characters for smooth gradients
    blocks: "█▉▊▋▌▍▎▏ ",

    // Classic ASCII art characters
    classic: "@#S%?*+;:,.",

    // Simple high-contrast set
    simple: "██▓▒░ ",

    // Minimal for small outputs
    minimal: "█▓░ ",

    // Numbers (fun alternative)
    numbers: "9876543210 ",

    // Binary style
    binary: "█ ",

    // Retro computer style
    retro: "▓▒░ ",
};

/**
 * Get available charset names
 * @returns {string[]} Array of charset names
 */
function getAvailableCharsets() {
    return Object.keys(CHARSETS);
}

/**
 * Get charset characters by name
 * @param {string} name - Charset name
 * @returns {string} Character string
 */
function getCharset(name) {
    if (!CHARSETS[name]) {
        throw new Error(
            `Unknown charset: ${name}. Available: ${getAvailableCharsets().join(
                ", "
            )}`
        );
    }
    return CHARSETS[name];
}

/**
 * Validate charset name
 * @param {string} name - Charset name to validate
 * @returns {boolean} True if valid
 */
function isValidCharset(name) {
    return Object.prototype.hasOwnProperty.call(CHARSETS, name);
}

/**
 * Get charset info for display
 * @returns {Array} Array of charset info objects
 */
function getCharsetInfo() {
    return Object.entries(CHARSETS).map(([name, chars]) => ({
        name,
        chars,
        length: chars.trim().length,
        preview: chars.trim(),
    }));
}

module.exports = {
    CHARSETS,
    getAvailableCharsets,
    getCharset,
    isValidCharset,
    getCharsetInfo,
};
