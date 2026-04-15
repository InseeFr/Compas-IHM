import { getTrend } from "constantes/trend.utils";

describe("getTrend", () => {
    it("retourne 'flat' si value est undefined", () => {
        expect(getTrend(undefined)).toBe("flat");
    });

    it("retourne 'flat' si value est 0", () => {
        expect(getTrend(0)).toBe("flat");
    });

    it("retourne 'up' si value est positive", () => {
        expect(getTrend(1)).toBe("up");
        expect(getTrend(100)).toBe("up");
    });

    it("retourne 'down' si value est négative", () => {
        expect(getTrend(-1)).toBe("down");
        expect(getTrend(-100)).toBe("down");
    });
});