const fs = require("fs").promises;
const path = require("path");

/**
 * Validate image file extension
 * @param {string} filePath - Path to image file
 * @returns {boolean} True if supported format
 */
function isSupportedImageFormat(filePath) {
    const supportedExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".gif",
        ".tiff",
        ".tif",
        ".bmp",
        ".svg",
        ".avif",
        ".heif",
        ".heic",
    ];

    const ext = path.extname(filePath).toLowerCase();
    return supportedExtensions.includes(ext);
}

/**
 * Check if file exists and is readable
 * @param {string} filePath - Path to check
 * @returns {Promise<boolean>} True if file exists and is readable
 */
async function fileExists(filePath) {
    try {
        await fs.access(filePath, fs.constants.R_OK);
        return true;
    } catch {
        return false;
    }
}

/**
 * Ensure directory exists, create if it doesn't
 * @param {string} dirPath - Directory path
 */
async function ensureDir(dirPath) {
    try {
        await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
        if (error.code !== "EEXIST") {
            throw error;
        }
    }
}

/**
 * Generate output filename for ASCII art
 * @param {string} inputPath - Input image path
 * @param {string} [outputDir] - Output directory (optional)
 * @param {string} [suffix='ascii'] - Filename suffix
 * @returns {string} Output file path
 */
function generateOutputPath(inputPath, outputDir = null, suffix = "ascii") {
    const basename = path.basename(inputPath, path.extname(inputPath));
    const filename = `${basename}.${suffix}.txt`;

    if (outputDir) {
        return path.join(outputDir, filename);
    }

    return path.join(path.dirname(inputPath), filename);
}

/**
 * Validate conversion options
 * @param {Object} options - Options object
 * @returns {Object} Validated options
 */
function validateOptions(options = {}) {
    const defaults = {
        width: 80,
        charset: "detailed",
        contrast: 1.2,
        aspectRatio: 0.5,
        invert: false,
    };

    const validated = { ...defaults, ...options };

    // Validate width
    if (
        typeof validated.width !== "number" ||
        validated.width < 10 ||
        validated.width > 500
    ) {
        throw new Error("Width must be a number between 10 and 500");
    }

    // Validate contrast
    if (
        typeof validated.contrast !== "number" ||
        validated.contrast < 0.1 ||
        validated.contrast > 5.0
    ) {
        throw new Error("Contrast must be a number between 0.1 and 5.0");
    }

    // Validate aspect ratio
    if (
        typeof validated.aspectRatio !== "number" ||
        validated.aspectRatio < 0.1 ||
        validated.aspectRatio > 2.0
    ) {
        throw new Error("Aspect ratio must be a number between 0.1 and 2.0");
    }

    return validated;
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size string
 */
function formatFileSize(bytes) {
    const sizes = ["B", "KB", "MB", "GB"];
    if (bytes === 0) return "0 B";

    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = (bytes / Math.pow(1024, i)).toFixed(1);

    return `${size} ${sizes[i]}`;
}

/**
 * Create a progress indicator for batch operations
 * @param {number} current - Current item number
 * @param {number} total - Total items
 * @param {string} [filename] - Current filename
 * @returns {string} Progress string
 */
function formatProgress(current, total, filename = "") {
    const percentage = Math.round((current / total) * 100);
    const progress = `[${current}/${total}] ${percentage}%`;

    return filename ? `${progress} ${filename}` : progress;
}

/**
 * Calculate estimated dimensions for ASCII output
 * @param {number} imgWidth - Original image width
 * @param {number} imgHeight - Original image height
 * @param {number} targetWidth - Target ASCII width
 * @param {number} aspectRatio - Aspect ratio correction
 * @returns {Object} Dimensions object
 */
function calculateDimensions(imgWidth, imgHeight, targetWidth, aspectRatio) {
    const targetHeight = Math.floor(
        (imgHeight / imgWidth) * targetWidth * aspectRatio
    );

    return {
        width: targetWidth,
        height: targetHeight,
        originalRatio: imgWidth / imgHeight,
        newRatio: targetWidth / targetHeight,
    };
}

module.exports = {
    isSupportedImageFormat,
    fileExists,
    ensureDir,
    generateOutputPath,
    validateOptions,
    formatFileSize,
    formatProgress,
    calculateDimensions,
};
