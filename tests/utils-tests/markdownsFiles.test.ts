import { describe, it, expect, vi } from "vitest";
import { markdownFiles } from "components/accueilLayout/custom/markdownFile";

vi.mock("components/accueilLayout/custom/markdownFile", () => ({
    markdownFiles: {
        "../../../assets/content/intro.md": "# Introduction\nSome content",
        "../../../assets/content/guide/setup.md": "# Setup\nSetup content"
    }
}));

describe("markdownFiles", () => {
    it("is a record of string keys to string values", () => {
        expect(typeof markdownFiles).toBe("object");
        Object.entries(markdownFiles).forEach(([key, value]) => {
            expect(typeof key).toBe("string");
            expect(typeof value).toBe("string");
        });
    });

    it("keys follow the expected path pattern", () => {
        const pathPattern = /^\.\.\/\.\.\/\.\.\/assets\/content\/.+\.md$/;
        Object.keys(markdownFiles).forEach(key => {
            expect(key).toMatch(pathPattern);
        });
    });

    it("values contain raw markdown string content", () => {
        Object.values(markdownFiles).forEach(value => {
            expect(typeof value).toBe("string");
            expect(value.length).toBeGreaterThan(0);
        });
    });

    it("contains the expected files", () => {
        expect(markdownFiles).toHaveProperty("../../../assets/content/intro.md");
        expect(markdownFiles).toHaveProperty("../../../assets/content/guide/setup.md");
    });
});
