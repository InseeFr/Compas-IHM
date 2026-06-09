import { describe, it, expect } from "vitest";
import { lightTheme, darkTheme } from "../../src/themes/create-themes";

describe("Theme configuration", () => {
    it("should have correct light theme values", () => {
        expect(lightTheme.palette.mode).toBe("light");
        expect(lightTheme.palette.primary.main).toBe("#1d4ed8");
        expect(lightTheme.palette.background.default).toBe("#f8fafc");
        expect(lightTheme.palette.background.paper).toBe("#ffffff");
    });

    it("should have correct dark theme values", () => {
        expect(darkTheme.palette.mode).toBe("dark");
        expect(darkTheme.palette.primary.main).toBe("#60a5fa");
        expect(darkTheme.palette.background.default).toBe("#121212");
        expect(darkTheme.palette.background.paper).toBe("#1e1e1e");
    });
});
