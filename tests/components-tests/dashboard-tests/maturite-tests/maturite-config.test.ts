import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import {
    fetchTipsData,
    fetchMaturiteData,
    bottom3ByPriority,
    formatNum,
    clamp01,
    getScoreColor,
    maturiteLevel,
    maturiteLabel,
    computeConseil
} from "pages/dashboards/maturité/maturite-config";
import type { IndicateurApplicationMaturite } from "models/indicateurs";
import type { ApplicationTip } from "todos-api/client.gen";
import { green, orange, red, yellow } from "@mui/material/colors";

//tests
vi.mock("todos-api/client.gen", () => ({
    getMaturiteCloud: vi.fn(),
    getApplications1: vi.fn(),
    getApplicationConseils: vi.fn()
}));

import { getMaturiteCloud, getApplications1, getApplicationConseils } from "todos-api/client.gen";

describe("maturite-config", () => {
    beforeEach(() => vi.clearAllMocks());

    describe("fetchTipsData", () => {
        it("devrait retourner un tableau vide si pas d'app", async () => {
            expect(await fetchTipsData(null)).toEqual([]);
            expect(getApplicationConseils).not.toHaveBeenCalled();
        });

        it("devrait récupérer et trier les tips", async () => {
            const mockTips = [
                { id: 1, date: "2024-01-15" },
                { id: 3, date: "2024-01-20" },
                { id: 2, date: "2024-01-20" }
            ] as ApplicationTip[];

            (getApplicationConseils as Mock).mockResolvedValue(mockTips);
            const result = await fetchTipsData({
                applicationName: "Test"
            } as IndicateurApplicationMaturite);

            expect(result[0].id).toBe(3);
            expect(result[2].date).toBe("2024-01-15");
        });
    });

    describe("fetchMaturiteData", () => {
        it("devrait combiner et trier les données", async () => {
            (getMaturiteCloud as Mock).mockResolvedValue([{ applicationId: 2 }, { applicationId: 1 }]);
            (getApplications1 as Mock).mockResolvedValue([
                { idApplication: 1, appName: "App A" },
                { idApplication: 2, appName: "App B" }
            ]);

            const result = await fetchMaturiteData();

            expect(result[0].applicationName).toBe("App A");
            expect(result[1].applicationName).toBe("App B");
        });
    });

    describe("bottom3ByPriority", () => {
        it("devrait retourner les 3 priorités les plus basses", () => {
            const items = [
                { id: 1, conseil: "A", priorite: "3" },
                { id: 2, conseil: "B", priorite: "1" },
                { id: 3, conseil: "C", priorite: "2" }
            ] as ApplicationTip[];

            const result = bottom3ByPriority(items);

            expect(result).toHaveLength(3);
            expect(result[0].priorite).toBe("1");
        });

        it("devrait dédupliquer et ignorer les conseils vides", () => {
            const items = [
                { id: 1, conseil: "Conseil A", priorite: "1" },
                { id: 2, conseil: "Conseil A", priorite: "2" },
                { id: 3, conseil: "", priorite: "1" }
            ] as ApplicationTip[];

            expect(bottom3ByPriority(items)).toHaveLength(1);
        });
    });

    describe("formatNum", () => {
        it("devrait parser les nombres", () => {
            expect(formatNum("42.5")).toBe(42.5);
            expect(formatNum("invalid", 10)).toBe(10);
            expect(formatNum(undefined, 5)).toBe(5);
        });
    });

    describe("clamp01", () => {
        it("devrait limiter entre 0 et 1", () => {
            expect(clamp01(-0.5)).toBe(0);
            expect(clamp01(0.5)).toBe(0.5);
            expect(clamp01(1.5)).toBe(1);
        });
    });

    describe("getScoreColor", () => {
        it("devrait retourner les bonnes couleurs par défaut", () => {
            expect(getScoreColor(0.1)).toBe(red[500]);
            expect(getScoreColor(0.3)).toBe(orange[500]);
            expect(getScoreColor(0.5)).toBe(yellow[300]);
            expect(getScoreColor(0.8)).toBe(green[600]);
        });

        it("devrait gérer le type complexite", () => {
            expect(getScoreColor(-0.5, "complexite")).toBe(orange[500]);
            expect(getScoreColor(-0.3, "complexite")).toBe(yellow[300]);
            expect(getScoreColor(0, "complexite")).toBe(green[600]);
        });
    });

    describe("maturiteLevel", () => {
        it("devrait classifier A et B comme forte", () => {
            expect(maturiteLevel("A")).toBe("forte");
            expect(maturiteLevel("B")).toBe("forte");
            expect(maturiteLevel("C")).toBe("faible");
        });
    });

    describe("maturiteLabel", () => {
        it("devrait retourner les bons labels", () => {
            expect(maturiteLabel("A")).toBe("très forte");
            expect(maturiteLabel("B")).toBe("assez forte");
            expect(maturiteLabel("C")).toBe("moyenne");
            expect(maturiteLabel("D")).toBe("faible");
            expect(maturiteLabel("X")).toBe("inconnue");
        });
    });

    describe("computeConseil", () => {
        it("devrait retourner un conseil favorable pour maturité forte et balance positive", () => {
            const result = computeConseil("A", "0.5", "-0.3");

            expect(result.favorable).toBe(true);
            expect(result.texte).toContain("favorables");
        });

        it("devrait suggérer lift & shift pour risque faible", () => {
            const result = computeConseil("C", "0.2", "-0.1");

            expect(result.texte).toContain("lift & shift");
        });

        it("devrait être défavorable pour balance négative", () => {
            const result = computeConseil("C", "0.2", "-0.5");

            expect(result.favorable).toBe(false);
        });
    });
});
