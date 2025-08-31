const sharp = require("sharp");
const fs = require("fs").promises;
const { getCharset } = require("./charsets");
const {
    validateOptions,
    fileExists,
    isSupportedImageFormat,
} = require("./utils");

/**
 * Convert image to ASCII art
 * @param {string|Buffer} input - Image file path or buffer
 * @param {Object} options - Conversion options
 * @returns {Promise<string>} ASCII art string
 */
async function convertToAscii(input, options = {}) {
    // Validate options
    const opts = validateOptions(options);

    // Validate input
    if (typeof input === "string") {
        if (!(await fileExists(input))) {
            throw new Error(`File not found: ${input}`);
        }

        if (!isSupportedImageFormat(input)) {
            throw new Error(`Unsupported image format: ${input}`);
        }
    }

    try {
        // Get charset
        const charset = getCharset(opts.charset);

        // Calculate target dimensions
        let sharpInstance = sharp(input);
        const metadata = await sharpInstance.metadata();
        const { width: imgWidth, height: imgHeight } = metadata;

        const targetWidth = opts.width;
        const targetHeight = Math.floor(
            (imgHeight / imgWidth) * targetWidth * opts.aspectRatio
        );

        // Process image: resize, convert to grayscale, get raw pixels
        const { data, info } = await sharpInstance
            .resize(targetWidth, targetHeight, {
                fit: "fill",
                kernel: sharp.kernel.lanczos3,
            })
            .grayscale()
            .raw()
            .toBuffer({ resolveWithObject: true });

        // Convert pixels to ASCII
        let asciiArt = "";
        const { width, height } = info;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pixelIndex = y * width + x;
                let brightness = data[pixelIndex] / 255;

                // Apply contrast adjustment
                brightness = Math.pow(brightness, 1 / opts.contrast);

                // Clamp brightness
                brightness = Math.max(0, Math.min(1, brightness));

                // Invert if requested
                if (opts.invert) {
                    brightness = 1 - brightness;
                }

                // Map brightness to character
                const charIndex = Math.floor(brightness * (charset.length - 1));
                const char = charset[charset.length - 1 - charIndex];

                asciiArt += char;
            }

            // Add newline at end of each row
            asciiArt += "\n";
        }

        return asciiArt;
    } catch (error) {
        if (error.message.includes("Input file is missing")) {
            throw new Error(`Unable to read image file: ${input}`);
        }

        if (
            error.message.includes(
                "Input file contains unsupported image format"
            )
        ) {
            throw new Error(`Unsupported or corrupted image format: ${input}`);
        }

        throw new Error(`Image conversion failed: ${error.message}`);
    }
}

/**
 * Convert image to ASCII and save to file
 * @param {string|Buffer} input - Image file path or buffer
 * @param {string} outputPath - Output file path
 * @param {Object} options - Conversion options
 * @returns {Promise<Object>} Result object with stats
 */
async function convertAndSave(input, outputPath, options = {}) {
    const startTime = Date.now();

    try {
        // Convert to ASCII
        const asciiArt = await convertToAscii(input, options);

        // Save to file
        await saveToFile(asciiArt, outputPath);

        // Get file stats
        const stats = await fs.stat(outputPath);
        const processingTime = Date.now() - startTime;

        return {
            success: true,
            inputFile: typeof input === "string" ? input : "[Buffer]",
            outputFile: outputPath,
            fileSize: stats.size,
            processingTime,
            lines: asciiArt.split("\n").length - 1, // -1 for trailing newline
            characters: asciiArt.length,
        };
    } catch (error) {
        return {
            success: false,
            inputFile: typeof input === "string" ? input : "[Buffer]",
            outputFile: outputPath,
            error: error.message,
            processingTime: Date.now() - startTime,
        };
    }
}

/**
 * Save ASCII art to file
 * @param {string} asciiArt - ASCII art content
 * @param {string} filePath - Output file path
 * @returns {Promise<void>}
 */
async function saveToFile(asciiArt, filePath) {
    try {
        await fs.writeFile(filePath, asciiArt, "utf8");
    } catch (error) {
        throw new Error(`Failed to save file ${filePath}: ${error.message}`);
    }
}

/**
 * Get image information without converting
 * @param {string|Buffer} input - Image file path or buffer
 * @returns {Promise<Object>} Image metadata
 */
async function getImageInfo(input) {
    try {
        const metadata = await sharp(input).metadata();

        return {
            format: metadata.format,
            width: metadata.width,
            height: metadata.height,
            channels: metadata.channels,
            density: metadata.density,
            hasAlpha: metadata.hasAlpha,
            size: metadata.size,
        };
    } catch (error) {
        throw new Error(`Failed to read image info: ${error.message}`);
    }
}

/**
 * Preview ASCII conversion (first few lines only)
 * @param {string|Buffer} input - Image file path or buffer
 * @param {Object} options - Conversion options
 * @param {number} [previewLines=10] - Number of lines to preview
 * @returns {Promise<string>} Preview ASCII art
 */
async function previewAscii(input, options = {}, previewLines = 10) {
    const fullAscii = await convertToAscii(input, options);
    const lines = fullAscii.split("\n");

    return (
        lines.slice(0, previewLines).join("\n") +
        (lines.length > previewLines ? "\n... (truncated)" : "")
    );
}

module.exports = {
    convertToAscii,
    convertAndSave,
    saveToFile,
    getImageInfo,
    previewAscii,
};
