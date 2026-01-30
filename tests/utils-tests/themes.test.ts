import { describe, it, expect } from "vitest";
import { lightTheme, darkTheme } from "../../src/themes/create-themes";

describe("Theme configuration", () => {
    it("should have correct light theme values", () => {
        expect(lightTheme.palette.mode).toBe("light");
        expect(lightTheme.palette.primary.main).toBe("#1976d2");
        expect(lightTheme.palette.background.default).toBe("#F8FAFC");
        expect(lightTheme.palette.background.paper).toBe("#F8FAFC");
    });

    it("should have correct dark theme values", () => {
        expect(darkTheme.palette.mode).toBe("dark");
        expect(darkTheme.palette.primary.main).toBe("#90caf9");
        expect(darkTheme.palette.background.default).toBe("#0f0f23");
        expect(darkTheme.palette.background.paper).toBe("#181833");
    });
});
