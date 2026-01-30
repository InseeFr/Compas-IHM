import { avgArrays, pickSixAxisScores } from "pages/dashboards/applications/RadarChart/radar-config";
import type { AppForRadar } from "pages/dashboards/applications/RadarChart/RadarQualiteChar";
import { describe, it, expect } from "vitest";

describe("Radar utils", () => {
    describe("pickSixAxisScores", () => {
        it("returns an array of six numeric scores from a given app", () => {
            const app: AppForRadar = {
                lettreQualiteGenerale: "A",
                lettreNiveauCve: "B",
                distanceNote: "C",
                lettreFiabilite: "D",
                lettreGreen: "E",
                maturite: "NR",
                applicationName: ""
            };
            expect(pickSixAxisScores(app)).toEqual([5, 4, 3, 2, 1, 0]);
        });
    });

    describe("avgArrays", () => {
        it("returns the average of each index across arrays", () => {
            const arrays = [
                [1, 2, 3, 4, 5, 6],
                [6, 5, 4, 3, 2, 1],
                [3, 3, 3, 3, 3, 3]
            ];
            expect(avgArrays(arrays)).toEqual([10 / 3, 10 / 3, 10 / 3, 10 / 3, 10 / 3, 10 / 3]);
        });

        it("returns zeros if given an empty array", () => {
            expect(avgArrays([])).toEqual([0, 0, 0, 0, 0, 0]);
        });

        it("handles arrays with missing values", () => {
            const arrays = [
                [1, 2],
                [3, 4, 5]
            ];
            expect(avgArrays(arrays)).toEqual([2, 3, 2.5, 0, 0, 0]);
        });
    });
});
