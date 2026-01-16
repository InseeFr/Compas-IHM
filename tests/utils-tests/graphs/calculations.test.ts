/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import {
    countBy,
    getDetteBucket,
    getMepBucket,
    getCveTotal,
    calculateDetteCumulee,
    calculateMaturiteStrongPct,
    calculateTotalCriticalCve,
    countAppsSinceLastMep
} from "utils/graphs/calculations";
import type { GlobalIndicator } from "models/indicateurs";

describe("calculations", () => {
    describe("countBy", () => {
        it("should count occurrences of a property", () => {
            const data: GlobalIndicator[] = [
                { lettreQualiteGenerale: "A" } as unknown as GlobalIndicator,
                { lettreQualiteGenerale: "B" } as unknown as GlobalIndicator,
                { lettreQualiteGenerale: "A" } as unknown as GlobalIndicator
            ];
            const result = countBy(data, "lettreQualiteGenerale");
            expect(result).toEqual({ A: 2, B: 1 });
        });

        it("should handle null/undefined values as NR", () => {
            const data: GlobalIndicator[] = [
                { lettreQualiteGenerale: null } as any,
                { lettreQualiteGenerale: undefined } as any,
                { lettreQualiteGenerale: "A" } as unknown as GlobalIndicator
            ];
            const result = countBy(data, "lettreQualiteGenerale");
            expect(result).toEqual({ NR: 2, A: 1 });
        });

        it("should handle -1 values as NR", () => {
            const data: GlobalIndicator[] = [
                { meteo: -1 } as unknown as GlobalIndicator,
                { meteo: 1 } as unknown as GlobalIndicator
            ];
            const result = countBy(data, "meteo");
            expect(result).toEqual({ NR: 1, "1": 1 });
        });
    });

    describe("getDetteBucket", () => {
        it("should return NR for invalid values", () => {
            expect(getDetteBucket(undefined)).toBe("NR");
            expect(getDetteBucket("-1")).toBe("NR");
            expect(getDetteBucket("invalid")).toBe("NR");
        });

        it("should categorize 0-5 days (0-2100 minutes)", () => {
            expect(getDetteBucket("420")).toBe("0-5"); // 1 jour
            expect(getDetteBucket("2100")).toBe("0-5"); // 5 jours
        });

        it("should categorize 6-15 days", () => {
            expect(getDetteBucket("2520")).toBe("6-15"); // 6 jours
            expect(getDetteBucket("6300")).toBe("6-15"); // 15 jours
        });

        it("should categorize 16-30 days", () => {
            expect(getDetteBucket("6720")).toBe("16-30"); // 16 jours
            expect(getDetteBucket("12600")).toBe("16-30"); // 30 jours
        });

        it("should categorize 31-90 days", () => {
            expect(getDetteBucket("13020")).toBe("31-90"); // 31 jours
            expect(getDetteBucket("37800")).toBe("31-90"); // 90 jours
        });

        it("should categorize >90 days", () => {
            expect(getDetteBucket("40000")).toBe(">90");
        });
    });

    describe("getMepBucket", () => {
        it("should return NR for invalid values", () => {
            expect(getMepBucket(undefined)).toBe("NR");
            expect(getMepBucket(-1)).toBe("NR");
            expect(getMepBucket(NaN)).toBe("NR");
        });

        it("should categorize 0-30 days", () => {
            expect(getMepBucket(0)).toBe("0-30");
            expect(getMepBucket(15)).toBe("0-30");
            expect(getMepBucket(30)).toBe("0-30");
        });

        it("should categorize 31-60 days", () => {
            expect(getMepBucket(31)).toBe("31-60");
            expect(getMepBucket(60)).toBe("31-60");
        });

        it("should categorize 61-90 days", () => {
            expect(getMepBucket(61)).toBe("61-90");
            expect(getMepBucket(90)).toBe("61-90");
        });

        it("should categorize 91-180 days", () => {
            expect(getMepBucket(91)).toBe("91-180");
            expect(getMepBucket(180)).toBe("91-180");
        });

        it("should categorize >180 days", () => {
            expect(getMepBucket(200)).toBe(">180");
        });

        it("should handle string inputs", () => {
            expect(getMepBucket("45")).toBe("31-60");
        });
    });

    describe("getCveTotal", () => {
        it("should sum all CVE types", () => {
            const app: GlobalIndicator = {
                nbCveCritical: "5",
                nbCveHigh: "10",
                nbCveMedium: "15",
                nbCveLow: "20"
            } as unknown as GlobalIndicator;
            expect(getCveTotal(app)).toBe(50);
        });

        it("should handle missing CVE values", () => {
            const app: GlobalIndicator = {
                nbCveCritical: "5"
            } as unknown as GlobalIndicator;
            expect(getCveTotal(app)).toBe(5);
        });

        it("should handle zero CVEs", () => {
            const app: GlobalIndicator = {} as unknown as GlobalIndicator;
            expect(getCveTotal(app)).toBe(0);
        });
    });

    describe("calculateDetteCumulee", () => {
        it("should calculate total debt in days", () => {
            const data: GlobalIndicator[] = [
                { detteTechnique: "420" } as unknown as GlobalIndicator, // 1 jour
                { detteTechnique: "840" } as unknown as GlobalIndicator // 2 jours
            ];
            expect(calculateDetteCumulee(data)).toBe("3.0 jours");
        });

        it("should ignore invalid values", () => {
            const data: GlobalIndicator[] = [
                { detteTechnique: "420" } as unknown as GlobalIndicator,
                { detteTechnique: "-1" } as unknown as GlobalIndicator,
                { detteTechnique: undefined } as unknown as GlobalIndicator
            ];
            expect(calculateDetteCumulee(data)).toBe("1.0 jours");
        });

        it("should return NR for empty data", () => {
            expect(calculateDetteCumulee([])).toBe("NR");
        });

        it("should return NR when all values are invalid", () => {
            const data: GlobalIndicator[] = [
                { detteTechnique: "-1" } as unknown as GlobalIndicator,
                { detteTechnique: undefined } as unknown as GlobalIndicator
            ];
            expect(calculateDetteCumulee(data)).toBe("NR");
        });
    });

    describe("calculateMaturiteStrongPct", () => {
        it("should calculate percentage of A/B maturity", () => {
            const data: GlobalIndicator[] = [
                { maturite: "A", isModule: false } as unknown as GlobalIndicator,
                { maturite: "B", isModule: false } as unknown as GlobalIndicator,
                { maturite: "C", isModule: false } as unknown as GlobalIndicator,
                { maturite: "D", isModule: false } as unknown as GlobalIndicator
            ];
            expect(calculateMaturiteStrongPct(data)).toBe("50.0% (2/4)");
        });

        it("should exclude modules", () => {
            const data: GlobalIndicator[] = [
                { maturite: "A", isModule: false } as unknown as GlobalIndicator,
                { maturite: "A", isModule: true } as unknown as GlobalIndicator,
                { maturite: "C", isModule: false } as unknown as GlobalIndicator
            ];
            expect(calculateMaturiteStrongPct(data)).toBe("50.0% (1/2)");
        });

        it("should exclude NR and SO values", () => {
            const data: GlobalIndicator[] = [
                { maturite: "A", isModule: false } as unknown as GlobalIndicator,
                { maturite: "NR", isModule: false } as unknown as GlobalIndicator,
                { maturite: "SO", isModule: false } as unknown as GlobalIndicator,
                { maturite: "C", isModule: false } as unknown as GlobalIndicator
            ];
            expect(calculateMaturiteStrongPct(data)).toBe("50.0% (1/2)");
        });

        it("should return NR when no known values", () => {
            const data: GlobalIndicator[] = [
                { maturite: "NR", isModule: false } as unknown as GlobalIndicator
            ];
            expect(calculateMaturiteStrongPct(data)).toBe("NR");
        });

        it("should handle case insensitive maturity levels", () => {
            const data: GlobalIndicator[] = [
                { maturite: "a", isModule: false } as unknown as GlobalIndicator,
                { maturite: "b", isModule: false } as unknown as GlobalIndicator,
                { maturite: "c", isModule: false } as unknown as GlobalIndicator
            ];
            expect(calculateMaturiteStrongPct(data)).toBe("66.7% (2/3)");
        });
    });

    describe("calculateTotalCriticalCve", () => {
        it("should sum all critical CVEs", () => {
            const data: GlobalIndicator[] = [
                { nbCveCritical: "5" } as unknown as GlobalIndicator,
                { nbCveCritical: "10" } as unknown as GlobalIndicator,
                { nbCveCritical: "3" } as unknown as GlobalIndicator
            ];
            expect(calculateTotalCriticalCve(data)).toBe(18);
        });

        it("should handle missing values", () => {
            const data: GlobalIndicator[] = [
                { nbCveCritical: "5" } as unknown as GlobalIndicator,
                { nbCveCritical: undefined } as unknown as GlobalIndicator
            ];
            expect(calculateTotalCriticalCve(data)).toBe(5);
        });

        it("should return 0 for empty data", () => {
            expect(calculateTotalCriticalCve([])).toBe(0);
        });
    });

    describe("countAppsSinceLastMep", () => {
        it("should count apps with MEP older than threshold", () => {
            const data: GlobalIndicator[] = [
                { distanceCount: 20 } as unknown as GlobalIndicator,
                { distanceCount: 40 } as unknown as GlobalIndicator,
                { distanceCount: 50 } as unknown as GlobalIndicator
            ];
            expect(countAppsSinceLastMep(data, 30)).toBe(2);
        });

        it("should handle missing values", () => {
            const data: GlobalIndicator[] = [
                { distanceCount: 40 } as unknown as GlobalIndicator,
                { distanceCount: undefined } as unknown as GlobalIndicator,
                { distanceCount: -1 } as unknown as GlobalIndicator
            ];
            expect(countAppsSinceLastMep(data, 30)).toBe(1);
        });

        it("should return 0 when all below threshold", () => {
            const data: GlobalIndicator[] = [
                { distanceCount: 10 } as unknown as GlobalIndicator,
                { distanceCount: 20 } as unknown as GlobalIndicator
            ];
            expect(countAppsSinceLastMep(data, 30)).toBe(0);
        });
    });
});
