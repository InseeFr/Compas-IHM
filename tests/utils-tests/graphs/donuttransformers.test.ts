/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import {
    transformQualiteData,
    transformMeteoData,
    transformDetteData
} from "utils/graphs/donutTransformers";

describe("donutTransformers", () => {
    describe("transformQualiteData", () => {
        it("should transform quality data with correct order", () => {
            const data: any[] = [
                { lettreQualiteGenerale: "A" },
                { lettreQualiteGenerale: "B" },
                { lettreQualiteGenerale: "A" },
                { lettreQualiteGenerale: "C" }
            ];

            const result = transformQualiteData(data);

            // ORDERED_QUALITE = ["A", "B", "C", "D", "E", "X", "NR", "SO"] → 8 entrées
            expect(result).toHaveLength(8);
            expect(result[0]).toMatchObject({ name: "A", value: 2 });
            expect(result[1]).toMatchObject({ name: "B", value: 1 });
            expect(result[2]).toMatchObject({ name: "C", value: 1 });
            expect(result[3]).toMatchObject({ name: "D", value: 0 });
        });

        it("should include color for each category", () => {
            const data: any[] = [{ lettreQualiteGenerale: "A" }];

            const result = transformQualiteData(data);

            result.forEach(item => {
                expect(item).toHaveProperty("color");
                expect(typeof item.color).toBe("string");
            });
        });

        it("should handle empty data", () => {
            const result = transformQualiteData([]);

            // ORDERED_QUALITE = ["A", "B", "C", "D", "E", "X", "NR", "SO"] → 8 entrées
            expect(result).toHaveLength(8);
            result.forEach(item => {
                expect(item.value).toBe(0);
            });
        });

        it("should count NR for null values", () => {
            const data: any[] = [
                { lettreQualiteGenerale: "A" },
                { lettreQualiteGenerale: null },
                { lettreQualiteGenerale: undefined }
            ];

            const result = transformQualiteData(data);
            const nrItem = result.find(item => item.name === "NR");

            expect(nrItem?.value).toBe(2); // null et undefined comptent comme NR
        });

        it("should include X as a valid quality letter", () => {
            const data: any[] = [
                { lettreQualiteGenerale: "X" },
                { lettreQualiteGenerale: "X" },
                { lettreQualiteGenerale: "A" }
            ];

            const result = transformQualiteData(data);
            const xItem = result.find(item => item.name === "X");

            expect(xItem).toBeDefined();
            expect(xItem?.value).toBe(2);
        });
    });

    describe("transformMeteoData", () => {
        it("should transform meteo data with correct labels", () => {
            const data: any[] = [
                { meteo: 1 }, // Orage
                { meteo: 2 }, // Pluie
                { meteo: 1 } // Orage
            ];

            const result = transformMeteoData(data);

            expect(result).toHaveLength(5); // Soleil(4), Nuage(3), Pluie(2), Orage(1), NR
            expect(result.find(r => r.name === "Orage")?.value).toBe(2);
            expect(result.find(r => r.name === "Pluie")?.value).toBe(1);
        });

        it("should use correct color for each meteo", () => {
            const data: any[] = [{ meteo: 1 }];

            const result = transformMeteoData(data);

            result.forEach(item => {
                expect(item).toHaveProperty("color");
                expect(typeof item.color).toBe("string");
            });
        });

        it("should handle missing meteo values", () => {
            const data: any[] = [{ meteo: 1 }, { meteo: null }, { meteo: undefined }];

            const result = transformMeteoData(data);
            const nrItem = result.find(item => item.name === "NR");

            expect(nrItem).toBeDefined();
        });
    });

    describe("transformDetteData", () => {
        it("should categorize debt by buckets", () => {
            const data: any[] = [
                { detteTechnique: "420" }, // 1 jour  → 0-5
                { detteTechnique: "2520" }, // 6 jours → 6-15
                { detteTechnique: "6720" }, // 16 jours → 16-30
                { detteTechnique: "13020" }, // 31 jours → 31-90
                { detteTechnique: "40000" } // 95 jours → >90
            ];

            const result = transformDetteData(data);

            expect(result).toHaveLength(6);
            expect(result.find(r => r.name === "0-5")?.value).toBe(1);
            expect(result.find(r => r.name === "6-15")?.value).toBe(1);
            expect(result.find(r => r.name === "16-30")?.value).toBe(1);
            expect(result.find(r => r.name === "31-90")?.value).toBe(1);
            expect(result.find(r => r.name === ">90")?.value).toBe(1);
        });

        it("should count NR for invalid debt values", () => {
            const data: any[] = [
                { detteTechnique: "420" },
                { detteTechnique: "-1" },
                { detteTechnique: undefined }
            ];

            const result = transformDetteData(data);
            const nrItem = result.find(r => r.name === "NR");

            expect(nrItem?.value).toBe(2);
        });

        it("should include colors for all categories", () => {
            const data: any[] = [{ detteTechnique: "420" }];

            const result = transformDetteData(data);

            result.forEach(item => {
                expect(item).toHaveProperty("color");
                expect(typeof item.color).toBe("string");
            });
        });

        it("should handle empty data", () => {
            const result = transformDetteData([]);

            expect(result).toHaveLength(6);
            result.forEach(item => {
                expect(item.value).toBe(0);
            });
        });
    });
});
