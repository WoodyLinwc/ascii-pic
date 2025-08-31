#!/usr/bin/env node

/**
 * ASCII-PIC Node.js Usage Examples
 * Demonstrates different ways to use the ascii-pic package
 */

const path = require("path");
const {
    convertToAscii,
    convertAndSave,
    getImageInfo,
    previewAscii,
    getAvailableCharsets,
    AsciiPic,
} = require("../src/index");

async function runExamples() {
    console.log("🎨 ASCII-PIC Node.js Examples\n");

    // Note: You'll need to add some sample images to examples/sample-images/
    const sampleImage = path.join(
        __dirname,
        "sample-images",
        "my-cat-friday.png"
    );

    try {
        console.log("📸 Example 1: Basic conversion");
        console.log("─".repeat(40));

        // Check if sample image exists
        const fs = require("fs");
        if (!fs.existsSync(sampleImage)) {
            console.log(
                "⚠️  Sample image not found. Please add a demo.jpg to examples/sample-images/"
            );
            console.log("   For now, showing API usage examples...\n");
            showAPIExamples();
            return;
        }

        // Get image info
        const info = await getImageInfo(sampleImage);
        console.log(`Image: ${info.width}x${info.height} ${info.format}`);

        // Basic conversion
        const ascii = await convertToAscii(sampleImage, {
            width: 60,
            charset: "detailed",
        });

        console.log("ASCII Art (first 10 lines):");
        const lines = ascii.split("\n").slice(0, 10);
        lines.forEach((line) => console.log(line));
        console.log("...\n");

        console.log("💾 Example 2: Convert and save to file");
        console.log("─".repeat(40));

        const result = await convertAndSave(
            sampleImage,
            path.join(__dirname, "output", "demo.ascii.txt"),
            {
                width: 80,
                charset: "blocks",
                contrast: 1.5,
            }
        );

        if (result.success) {
            console.log(`✓ Saved to: ${result.outputFile}`);
            console.log(`  Size: ${result.fileSize} bytes`);
            console.log(`  Lines: ${result.lines}`);
            console.log(`  Processing time: ${result.processingTime}ms\n`);
        }

        console.log("👀 Example 3: Quick preview");
        console.log("─".repeat(40));

        const preview = await previewAscii(
            sampleImage,
            {
                width: 40,
                charset: "simple",
            },
            5
        );

        console.log(preview);
        console.log("...\n");

        console.log("🔧 Example 4: Using AsciiPic class");
        console.log("─".repeat(40));

        const converter = new AsciiPic({
            width: 50,
            charset: "classic",
            contrast: 1.3,
        });

        const classResult = await converter.convertToFile(
            sampleImage,
            path.join(__dirname, "output", "class-demo.ascii.txt")
        );

        if (classResult.success) {
            console.log(`✓ Class-based conversion successful!`);
            console.log(`  Output: ${path.basename(classResult.outputFile)}\n`);
        }

        console.log("📚 Example 5: Different character sets");
        console.log("─".repeat(40));

        const charsets = getAvailableCharsets();
        for (const charset of charsets.slice(0, 3)) {
            // Show first 3
            const sample = await convertToAscii(sampleImage, {
                width: 30,
                charset,
            });

            console.log(`${charset.toUpperCase()}:`);
            console.log(sample.split("\n").slice(0, 3).join("\n"));
            console.log("...\n");
        }
    } catch (error) {
        console.error("❌ Error running examples:", error.message);
        console.log("\n📖 Here are the API usage patterns:\n");
        showAPIExamples();
    }
}

function showAPIExamples() {
    console.log("🔧 API Usage Examples:");
    console.log("─".repeat(40));

    console.log(`
// 1. Basic conversion
const ascii = await convertToAscii('image.jpg', { width: 80 });

// 2. Convert and save
const result = await convertAndSave('input.png', 'output.txt', {
  charset: 'blocks',
  contrast: 1.5
});

// 3. Using the class
const converter = new AsciiPic({ width: 100 });
const ascii = await converter.convert('photo.jpg');

// 4. Batch processing
const results = await converter.batchConvert('*.jpg', {
  outputDir: './ascii-art/'
});

// 5. Get image information
const info = await getImageInfo('image.png');
console.log(info.width, info.height, info.format);

// 6. Preview (first few lines)
const preview = await previewAscii('image.jpg', { width: 50 }, 8);
  `);

    console.log("📋 Available Options:");
    console.log("─".repeat(20));
    console.log(`
{
  width: 80,           // ASCII width (10-500)
  charset: 'detailed', // Character set name
  contrast: 1.2,       // Contrast adjustment (0.1-5.0)
  aspectRatio: 0.5,    // Aspect ratio correction
  invert: false        // Invert brightness
}
  `);

    console.log("🎨 Available Character Sets:");
    console.log("─".repeat(28));
    const charsets = getAvailableCharsets();
    charsets.forEach((name) => {
        console.log(`  • ${name}`);
    });
}

// Create output directory
const fs = require("fs");
const outputDir = path.join(__dirname, "output");
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Run examples
runExamples().catch(console.error);
