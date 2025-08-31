const {
    convertToAscii,
    getImageInfo,
    validateOptions,
    isValidCharset,
    getAvailableCharsets,
} = require("../src/index");

const sharp = require("sharp");

describe("ASCII-PIC Core Functions", () => {
    // Create a simple test image buffer
    let testImageBuffer;

    beforeAll(async () => {
        // Create a 100x100 white square with black border for testing
        testImageBuffer = await sharp({
            create: {
                width: 100,
                height: 100,
                channels: 3,
                background: { r: 255, g: 255, b: 255 },
            },
        })
            .composite([
                {
                    input: await sharp({
                        create: {
                            width: 90,
                            height: 90,
                            channels: 3,
                            background: { r: 0, g: 0, b: 0 },
                        },
                    })
                        .png()
                        .toBuffer(),
                    top: 5,
                    left: 5,
                },
            ])
            .png()
            .toBuffer();
    });

    describe("convertToAscii", () => {
        test("should convert image buffer to ASCII string", async () => {
            const result = await convertToAscii(testImageBuffer, {
                width: 20,
                charset: "simple",
            });

            expect(typeof result).toBe("string");
            expect(result.length).toBeGreaterThan(0);
            expect(result).toContain("\n"); // Should have newlines
        });

        test("should respect width parameter", async () => {
            const result = await convertToAscii(testImageBuffer, { width: 10 });
            const lines = result.split("\n").filter((line) => line.length > 0);

            expect(lines[0].length).toBe(10);
        });

        test("should work with different character sets", async () => {
            const charsets = ["detailed", "blocks", "simple"];

            for (const charset of charsets) {
                const result = await convertToAscii(testImageBuffer, {
                    width: 20,
                    charset,
                });

                expect(typeof result).toBe("string");
                expect(result.length).toBeGreaterThan(0);
            }
        });

        test("should handle invalid options", async () => {
            await expect(
                convertToAscii(testImageBuffer, {
                    width: 5, // Too small
                })
            ).rejects.toThrow();

            await expect(
                convertToAscii(testImageBuffer, {
                    charset: "nonexistent",
                })
            ).rejects.toThrow();
        });
    });

    describe("getImageInfo", () => {
        test("should return image metadata", async () => {
            const info = await getImageInfo(testImageBuffer);

            expect(info).toHaveProperty("width", 100);
            expect(info).toHaveProperty("height", 100);
            expect(info).toHaveProperty("format", "png");
            expect(info).toHaveProperty("channels");
        });
    });

    describe("validateOptions", () => {
        test("should return default options when no input provided", () => {
            const options = validateOptions();

            expect(options).toHaveProperty("width", 80);
            expect(options).toHaveProperty("charset", "detailed");
            expect(options).toHaveProperty("contrast", 1.2);
            expect(options).toHaveProperty("aspectRatio", 0.5);
            expect(options).toHaveProperty("invert", false);
        });

        test("should merge provided options with defaults", () => {
            const options = validateOptions({ width: 100, charset: "blocks" });

            expect(options.width).toBe(100);
            expect(options.charset).toBe("blocks");
            expect(options.contrast).toBe(1.2); // Default value
        });

        test("should validate option ranges", () => {
            expect(() => validateOptions({ width: 5 })).toThrow();
            expect(() => validateOptions({ width: 600 })).toThrow();
            expect(() => validateOptions({ contrast: 0.05 })).toThrow();
            expect(() => validateOptions({ contrast: 6.0 })).toThrow();
            expect(() => validateOptions({ aspectRatio: 0.05 })).toThrow();
            expect(() => validateOptions({ aspectRatio: 3.0 })).toThrow();
        });
    });

    describe("charset functions", () => {
        test("should return available charsets", () => {
            const charsets = getAvailableCharsets();

            expect(Array.isArray(charsets)).toBe(true);
            expect(charsets.length).toBeGreaterThan(0);
            expect(charsets).toContain("detailed");
            expect(charsets).toContain("blocks");
            expect(charsets).toContain("simple");
        });

        test("should validate charset names", () => {
            expect(isValidCharset("detailed")).toBe(true);
            expect(isValidCharset("blocks")).toBe(true);
            expect(isValidCharset("nonexistent")).toBe(false);
            expect(isValidCharset("")).toBe(false);
        });
    });

    describe("error handling", () => {
        test("should handle invalid image data", async () => {
            const invalidBuffer = Buffer.from("not an image");

            await expect(convertToAscii(invalidBuffer)).rejects.toThrow();
        });

        test("should handle non-existent file", async () => {
            await expect(
                convertToAscii("/path/that/does/not/exist.jpg")
            ).rejects.toThrow();
        });
    });

    describe("performance", () => {
        test("should convert small image quickly", async () => {
            const start = Date.now();

            await convertToAscii(testImageBuffer, { width: 50 });

            const elapsed = Date.now() - start;
            expect(elapsed).toBeLessThan(1000); // Should take less than 1 second
        });
    });
});
