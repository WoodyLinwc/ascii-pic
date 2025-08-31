/**
 * ASCII-PIC - Transform images into beautiful ASCII art
 *
 * @author Your Name
 * @license MIT
 */

const {
    convertToAscii,
    convertAndSave,
    saveToFile,
    getImageInfo,
    previewAscii,
} = require("./converter");

const {
    CHARSETS,
    getAvailableCharsets,
    getCharset,
    isValidCharset,
    getCharsetInfo,
} = require("./charsets");

const {
    isSupportedImageFormat,
    fileExists,
    ensureDir,
    generateOutputPath,
    validateOptions,
    formatFileSize,
    formatProgress,
    calculateDimensions,
} = require("./utils");

const fs = require("fs").promises;
const path = require("path");
const { glob } = require("glob");

/**
 * Main ASCII-PIC class for easy usage
 */
class AsciiPic {
    constructor(defaultOptions = {}) {
        this.defaultOptions = validateOptions(defaultOptions);
    }

    /**
     * Convert single image to ASCII
     * @param {string|Buffer} input - Image input
     * @param {Object} options - Conversion options
     * @returns {Promise<string>} ASCII art
     */
    async convert(input, options = {}) {
        const mergedOptions = { ...this.defaultOptions, ...options };
        return await convertToAscii(input, mergedOptions);
    }

    /**
     * Convert and save to file
     * @param {string|Buffer} input - Image input
     * @param {string} output - Output file path
     * @param {Object} options - Conversion options
     * @returns {Promise<Object>} Result object
     */
    async convertToFile(input, output, options = {}) {
        const mergedOptions = { ...this.defaultOptions, ...options };
        return await convertAndSave(input, output, mergedOptions);
    }

    /**
     * Batch convert multiple files
     * @param {string|string[]} inputPattern - Glob pattern or array of files
     * @param {Object} options - Conversion options
     * @returns {Promise<Object[]>} Array of results
     */
    async batchConvert(inputPattern, options = {}) {
        const mergedOptions = { ...this.defaultOptions, ...options };

        // Resolve input files
        let inputFiles;
        if (Array.isArray(inputPattern)) {
            inputFiles = inputPattern;
        } else if (typeof inputPattern === "string") {
            inputFiles = await glob(inputPattern);
        } else {
            throw new Error(
                "Input must be a string pattern or array of file paths"
            );
        }

        // Filter for supported image formats
        inputFiles = inputFiles.filter((file) => isSupportedImageFormat(file));

        if (inputFiles.length === 0) {
            throw new Error("No supported image files found");
        }

        // Process each file
        const results = [];
        const { outputDir, ...convertOptions } = mergedOptions;

        for (let i = 0; i < inputFiles.length; i++) {
            const inputFile = inputFiles[i];
            const outputFile = generateOutputPath(inputFile, outputDir);

            // Ensure output directory exists
            if (outputDir) {
                await ensureDir(outputDir);
            }

            // Convert file
            const result = await convertAndSave(
                inputFile,
                outputFile,
                convertOptions
            );
            result.progress = formatProgress(
                i + 1,
                inputFiles.length,
                path.basename(inputFile)
            );

            results.push(result);
        }

        return results;
    }
}

/**
 * Quick conversion functions (functional API)
 */
const api = {
    // Core functions
    convertToAscii,
    convertAndSave,
    saveToFile,
    getImageInfo,
    previewAscii,

    // Utility functions
    isSupportedImageFormat,
    fileExists,
    ensureDir,
    generateOutputPath,
    validateOptions,
    formatFileSize,
    formatProgress,
    calculateDimensions,

    // Charset functions
    CHARSETS,
    getAvailableCharsets,
    getCharset,
    isValidCharset,
    getCharsetInfo,

    // Main class
    AsciiPic,
};

// Export everything
module.exports = api;

// Also export as ES6 default for modern usage
module.exports.default = api;
