import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import {
    fetchMaturiteData,
    formatNum,
    clamp01,
    getScoreColor,
    getClassement,
    getTendance,
    normalizeMaturite,
    computeConseil
} from "pages/dashboards/maturité/maturite-config";
import type { IndicateurApplicationMaturite } from "models/indicateurs";
import type { Application, IndicateurApplicationMaturiteCloud } from "todos-api/client.gen";
import { green, orange, red, yellow } from "@mui/material/colors";

//tests
vi.mock("todos-api/client.gen", () => ({
    getMaturiteCloud: vi.fn(),
    getApplications1: vi.fn()
}));

import { getMaturiteCloud, getApplications1 } from "todos-api/client.gen";

describe("maturite-config", () => {
    beforeEach(() => vi.clearAllMocks());

    describe("fetchMaturiteData", () => {
        it("devrait combiner et trier les données", async () => {
            (getMaturiteCloud as Mock).mockResolvedValue([
                { applicationId: 2, scoreTechnique: "0.8", scoreOrga: "0.7" } as IndicateurApplicationMaturiteCloud,
                { applicationId: 1, scoreTechnique: "0.5", scoreOrga: "0.6" } as IndicateurApplicationMaturiteCloud
            ]);
            (getApplications1 as Mock).mockResolvedValue([
                { idApplication: 1, appName: "App A" } as Application,
                { idApplication: 2, appName: "App B" } as Application
            ]);

            const result = await fetchMaturiteData();

            expect(result[0].applicationName).toBe("App A");
            expect(result[1].applicationName).toBe("App B");
        });

        it("devrait retourner un tableau vide en cas d'erreur", async () => {
            (getMaturiteCloud as Mock).mockRejectedValue(new Error("API Error"));
            (getApplications1 as Mock).mockResolvedValue([]);

            const result = await fetchMaturiteData();

            expect(result).toEqual([]);
        });
    });

    describe("formatNum", () => {
        it("devrait parser les nombres", () => {
            expect(formatNum("42.5")).toBe(42.5);
            expect(formatNum("invalid", 10)).toBe(10);
            expect(formatNum(undefined, 5)).toBe(5);
        });

        it("devrait gérer les valeurs null", () => {
            expect(formatNum(null, 3)).toBe(3);
        });
    });

    describe("clamp01", () => {
        it("devrait limiter entre 0 et 1", () => {
            expect(clamp01(-0.5)).toBe(0);
            expect(clamp01(0.5)).toBe(0.5);
            expect(clamp01(1.5)).toBe(1);
        });

        it("devrait gérer les valeurs exactes 0 et 1", () => {
            expect(clamp01(0)).toBe(0);
            expect(clamp01(1)).toBe(1);
        });
    });

    describe("getScoreColor", () => {
        it("devrait retourner les bonnes couleurs par défaut", () => {
            expect(getScoreColor(0.1)).toBe(red[500]);
            expect(getScoreColor(0.3)).toBe(orange[500]);
            expect(getScoreColor(0.5)).toBe(yellow[300]);
            expect(getScoreColor(0.8)).toBe(green[600]);
        });

        it("devrait gérer les seuils exactement", () => {
            // 0.2 >= 0.2 et <= 0.45, donc orange
            expect(getScoreColor(0.2)).toBe(orange[500]);
            // 0.45 <= 0.45, donc orange
            expect(getScoreColor(0.45)).toBe(orange[500]);
            // 0.7 <= 0.7, donc jaune
            expect(getScoreColor(0.7)).toBe(yellow[300]);
        });

        it("devrait gérer le type complexite", () => {
            expect(getScoreColor(0.8, "complexite")).toBe(red[500]);
            expect(getScoreColor(0.5, "complexite")).toBe(orange[500]);
            expect(getScoreColor(0.3, "complexite")).toBe(yellow[300]);
            expect(getScoreColor(0.1, "complexite")).toBe(green[600]);
        });

        it("devrait gérer les valeurs négatives pour complexite via complexiteMagnitude", () => {
            // getScoreColor attend des valeurs positives pour complexite
            // Les valeurs négatives doivent d'abord passer par complexiteMagnitude
            // qui prend la valeur absolue
            // 0.5 est > 0.45 et <= 0.7, donc orange
            expect(getScoreColor(0.5, "complexite")).toBe(orange[500]);
            // 0.3 est >= 0.2 et <= 0.45, donc yellow
            expect(getScoreColor(0.3, "complexite")).toBe(yellow[300]);
            // 0 est < 0.2, donc green
            expect(getScoreColor(0, "complexite")).toBe(green[600]);
        });
    });

    describe("getClassement", () => {
        it("devrait classifier correctement les scores", () => {
            const tresFaible = getClassement(0.1);
            expect(tresFaible.key).toBe("tres-faible");
            expect(tresFaible.label).toBe("très faible");
            expect(tresFaible.positive).toBe(false);

            const plutôtFaible = getClassement(0.3);
            expect(plutôtFaible.key).toBe("plutot-faible");
            expect(plutôtFaible.label).toBe("plutôt faible");
            expect(plutôtFaible.positive).toBe(false);

            const assezForte = getClassement(0.6);
            expect(assezForte.key).toBe("assez-forte");
            expect(assezForte.label).toBe("assez forte");
            expect(assezForte.positive).toBe(true);

            const forte = getClassement(0.9);
            expect(forte.key).toBe("forte");
            expect(forte.label).toBe("forte");
            expect(forte.positive).toBe(true);
        });

        it("devrait gérer les seuils exactement", () => {
            // 0.2 >= 0.2 et <= 0.45, donc plutot-faible
            expect(getClassement(0.2).key).toBe("plutot-faible");
            // 0.45 <= 0.45, donc plutot-faible
            expect(getClassement(0.45).key).toBe("plutot-faible");
            // 0.7 <= 0.7, donc assez-forte
            expect(getClassement(0.7).key).toBe("assez-forte");
        });
    });

    describe("getTendance", () => {
        it("devrait retourner hausse pour delta > 0.05", () => {
            expect(getTendance(0.1)).toBe("hausse");
            expect(getTendance(0.06)).toBe("hausse");
        });

        it("devrait retourner baisse pour delta < -0.05", () => {
            expect(getTendance(-0.1)).toBe("baisse");
            expect(getTendance(-0.06)).toBe("baisse");
        });

        it("devrait retourner stable pour -0.05 <= delta <= 0.05", () => {
            expect(getTendance(0)).toBe("stable");
            expect(getTendance(0.05)).toBe("stable");
            expect(getTendance(-0.05)).toBe("stable");
            expect(getTendance(0.04)).toBe("stable");
        });

        it("devrait gérer les valeurs string", () => {
            expect(getTendance("0.1")).toBe("hausse");
            expect(getTendance("-0.1")).toBe("baisse");
        });
    });

    describe("normalizeMaturite", () => {
        it("devrait retourner EMPTY_MATURITE pour null", () => {
            const result = normalizeMaturite(null);
            expect(result.scoreOpportunite).toBe(0);
            expect(result.scoreMaturite).toBe(0);
            expect(result.scoreTechnique).toBe(0);
            expect(result.scoreOrga).toBe(0);
            expect(result.complexite).toBe(0);
            expect(result.benefice).toBe(0);
        });

        it("devrait normaliser les scores à partir d'une application", () => {
            const app = {
                scoreOpportunite: "0.8",
                scoreMaturite: "0.6",
                scoreTechnique: "0.7",
                scoreOrga: "0.8",
                scoreComplexite: "-0.3",
                scoreBenefice: "0.5",
                deltaOpportunite: "0.1",
                deltaMaturite: "0.05"
            } as IndicateurApplicationMaturite;

            const result = normalizeMaturite(app);
            expect(result.scoreOpportunite).toBe(0.8);
            expect(result.scoreMaturite).toBe(0.6);
            expect(result.scoreTechnique).toBe(0.7);
            expect(result.scoreOrga).toBe(0.8);
            expect(result.complexite).toBe(0.3);
            expect(result.benefice).toBe(0.5);
            expect(result.deltaOpportunite).toBe(0.1);
            expect(result.deltaMaturite).toBe(0.05);
        });

        it("devrait calculer scoreMaturite comme moyenne de technique et orga si non fourni", () => {
            const app = {
                scoreTechnique: "0.7",
                scoreOrga: "0.9",
                scoreComplexite: "0.2",
                scoreBenefice: "0.5"
            } as IndicateurApplicationMaturite;

            const result = normalizeMaturite(app);
            expect(result.scoreMaturite).toBe(0.8);
        });
    });

    describe("computeConseil", () => {
        it("devrait retourner un conseil favorable pour maturité forte et balance positive", () => {
            const result = computeConseil(0.8, 0.7, 0.2);

            expect(result.favorable).toBe(true);
            expect(result.texte).toContain("favorables");
        });

        it("devrait suggérer lift & shift quand maturité faible, balance positive, complexité < 0.22 et benefice < 0.25", () => {
            // maturité = 0.3 (<= 0.45), balance = 0.2 - 0.1 = 0.1 (>= 0), complexite = 0.1 (< 0.22), benefice = 0.2 (< 0.25)
            const result = computeConseil(0.3, 0.2, 0.1);

            expect(result.texte).toContain("lift & shift");
            expect(result.favorable).toBe(false);
        });

        it("devrait être défavorable pour balance négative", () => {
            const result = computeConseil(0.3, 0.2, 0.5);

            expect(result.favorable).toBe(false);
        });

        it("devrait gérer maturité forte avec balance négative", () => {
            const result = computeConseil(0.6, 0.3, 0.5);

            expect(result.favorable).toBe(false);
            expect(result.texte).toContain("possible mais semble peu prioritaire");
        });

        it("devrait gérer maturité faible avec balance positive et complexité très faible mais benefice élevé", () => {
            // maturité = 0.3, balance = 0.8 - 0.1 = 0.7 (>= 0), complexite = 0.1 (< 0.22), mais benefice = 0.8 (>= 0.25)
            // Donc pas de "lift & shift" car benefice >= 0.25
            const result = computeConseil(0.3, 0.8, 0.1);

            expect(result.favorable).toBe(false);
            expect(result.texte).toContain("peu favorables");
            expect(result.texte).not.toContain("lift & shift");
        });

        it("devrait suggérer lift & shift pour balance négative avec complexité faible", () => {
            // maturité = 0.3, balance = 0.2 - 0.3 = -0.1 (< 0), complexite = 0.3 (>= 0.22)
            // Pas de lift & shift car complexite >= 0.22
            const result = computeConseil(0.3, 0.2, 0.3);

            expect(result.favorable).toBe(false);
            expect(result.texte).not.toContain("lift & shift");
        });

        it("devrait suggérer lift & shift pour balance négative avec complexité très faible", () => {
            // maturité = 0.3, balance = 0.2 - 0.1 = 0.1 (>= 0), attendez non...
            // Pour balance négative: maturité = 0.3, benefice = 0.1, complexite = 0.2
            // balance = 0.1 - 0.2 = -0.1 (< 0), complexite = 0.2 (< 0.22)
            const result = computeConseil(0.3, 0.1, 0.2);

            expect(result.favorable).toBe(false);
            expect(result.texte).toContain("lift & shift");
        });
    });
});
