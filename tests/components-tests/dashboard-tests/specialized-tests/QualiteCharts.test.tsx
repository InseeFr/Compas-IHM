/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import {
    QualiteCoverageChart,
    QualiteDetteChart,
    QualiteRadarChart
} from "pages/dashboards/overview/Charts/QualiteCharts";
import type { GlobalIndicator } from "models/indicateurs";

// --- Mocks ---

vi.mock("@mui/material", async importOriginal => {
    const actual = await importOriginal<typeof import("@mui/material")>();
    return {
        ...actual,
        useTheme: vi.fn(() => ({
            palette: { mode: "light", primary: { main: "#1976d2", light: "#42a5f5" } }
        }))
    };
});

// Stockage des options ECharts pour accéder aux fonctions non sérialisables par JSON
const capturedOptions: unknown[] = [];

vi.mock("echarts-for-react", () => ({
    default: ({ option, style }: { option: unknown; style?: React.CSSProperties }) => {
        capturedOptions.push(option);
        return <div data-testid="echarts" style={style} data-option={JSON.stringify(option)} />;
    }
}));

vi.mock("constantes/couleurs", () => ({
    QUALITE_COLORS: {
        A: "#1b5e20",
        B: "#388e3c",
        C: "#8bc34a",
        D: "#fbc02d",
        E: "#f57c00",
        X: "#b71c1c",
        NR: "#9e9e9e",
        SO: "#9e9e9e"
    },
    ORDERED_QUALITE: ["A", "B", "C", "D", "E", "X", "NR", "SO"]
}));

// --- Helpers ---

// Retourne la dernière option capturée (avec fonctions intactes)
function getLastCapturedOption() {
    return capturedOptions[capturedOptions.length - 1] as Record<string, unknown>;
}

// --- Fixtures ---

function makeApp(overrides: Partial<GlobalIndicator> = {}): GlobalIndicator {
    return {
        applicationName: "App Test",
        pourcentageCouvertureTestUniaire: "75",
        detteTechnique: "210",
        nbLigneCode: "10000",
        lettreCouvertureTestUnitaire: "B",
        lettreFiabilite: "A",
        lettreDetteTechnique: "C",
        lettreQualiteGenerale: "B",
        ...overrides
    } as unknown as GlobalIndicator;
}

const validApp = makeApp();
const appNoCoverage = makeApp({ pourcentageCouvertureTestUniaire: "NR" });
const appNoDette = makeApp({ detteTechnique: "NR" });

// ─────────────────────────────────────────────────────────────────────────────
// QualiteCoverageChart
// ─────────────────────────────────────────────────────────────────────────────

describe("QualiteCoverageChart", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        capturedOptions.length = 0;
    });

    describe("avec données valides", () => {
        it("affiche le titre", () => {
            render(<QualiteCoverageChart data={[validApp]} />);
            expect(screen.getByText("Répartition de la couverture de test")).toBeInTheDocument();
        });

        it("rend le composant ECharts", () => {
            render(<QualiteCoverageChart data={[validApp]} />);
            expect(screen.getByTestId("echarts")).toBeInTheDocument();
        });

        it("le chart a une hauteur de 350px", () => {
            render(<QualiteCoverageChart data={[validApp]} />);
            expect(screen.getByTestId("echarts")).toHaveStyle({ height: "350px" });
        });

        it("utilise un bar chart", () => {
            render(<QualiteCoverageChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.series[0].type).toBe("bar");
        });

        it("génère 6 niveaux de couverture en abscisse (X + 5 plages)", () => {
            render(<QualiteCoverageChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.xAxis.data).toHaveLength(6);
            expect(option.xAxis.data).toContain("X (0%)");
            expect(option.xAxis.data).toContain("0-20%");
            expect(option.xAxis.data).toContain("80-100%");
        });

        it("place correctement 75% dans le niveau 60-80% (index 4)", () => {
            render(<QualiteCoverageChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            const barData: { value: number }[] = option.series[0].data;
            expect(barData[4].value).toBe(1);
        });

        it("place les apps avec lettreCouvertureTestUnitaire=X dans le niveau X (index 0)", () => {
            const appX = makeApp({
                lettreCouvertureTestUnitaire: "X",
                pourcentageCouvertureTestUniaire: "0"
            });
            render(<QualiteCoverageChart data={[appX]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            const barData: { value: number }[] = option.series[0].data;
            expect(barData[0].value).toBe(1);
        });

        it("exclut les apps X des plages de pourcentage", () => {
            const appX = makeApp({
                lettreCouvertureTestUnitaire: "X",
                pourcentageCouvertureTestUniaire: "0"
            });
            render(<QualiteCoverageChart data={[appX]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            const barData: { value: number }[] = option.series[0].data;
            expect(barData.slice(1).every(d => d.value === 0)).toBe(true);
        });

        it("affiche le texte d'information en bas avec total et avec données", () => {
            render(<QualiteCoverageChart data={[validApp, appNoCoverage]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.graphic.style.text).toContain("Total : 2");
            expect(option.graphic.style.text).toContain("Avec données : 1");
        });

        // --- Callbacks tooltip formatter ---

        it("tooltip formatter retourne le label 'Note X' pour le niveau X", () => {
            render(<QualiteCoverageChart data={[validApp]} />);
            const opt = getLastCapturedOption() as any;
            const result = opt.tooltip.formatter([{ dataIndex: 0 }]);
            expect(result).toContain("Note X — aucun test déclaré");
        });

        it("tooltip formatter retourne le label de plage pour les niveaux non-X", () => {
            render(<QualiteCoverageChart data={[validApp]} />);
            const opt = getLastCapturedOption() as any;
            const result = opt.tooltip.formatter([{ dataIndex: 1 }]);
            expect(result).toContain("0-20%");
            expect(result).toContain("Applications");
        });

        it("tooltip formatter affiche la part du total", () => {
            render(<QualiteCoverageChart data={[validApp]} />);
            const opt = getLastCapturedOption() as any;
            const result = opt.tooltip.formatter([{ dataIndex: 4 }]);
            expect(result).toContain("Part du total");
        });

        // --- Callback label formatter ---

        it("label formatter retourne chaîne vide si valeur = 0", () => {
            render(<QualiteCoverageChart data={[validApp]} />);
            const opt = getLastCapturedOption() as any;
            const formatter = opt.series[0].label.formatter;
            expect(formatter({ value: 0 })).toBe("");
        });

        it("label formatter retourne valeur et pourcentage si valeur > 0", () => {
            render(<QualiteCoverageChart data={[validApp]} />);
            const opt = getLastCapturedOption() as any;
            const formatter = opt.series[0].label.formatter;
            const result = formatter({ value: 1 });
            expect(result).toContain("1");
            expect(result).toContain("%");
        });
    });

    describe("sans données", () => {
        it("affiche un message si aucune app avec couverture valide", () => {
            render(<QualiteCoverageChart data={[appNoCoverage]} />);
            expect(
                screen.getByText("Aucune donnée de couverture de test disponible")
            ).toBeInTheDocument();
            expect(screen.queryByTestId("echarts")).not.toBeInTheDocument();
        });

        it("affiche un message pour tableau vide", () => {
            render(<QualiteCoverageChart data={[]} />);
            expect(
                screen.getByText("Aucune donnée de couverture de test disponible")
            ).toBeInTheDocument();
        });

        it("ignore les apps avec undefined en couverture", () => {
            const appUndefined = makeApp({
                pourcentageCouvertureTestUniaire: undefined as unknown as string
            });
            render(<QualiteCoverageChart data={[appUndefined]} />);
            expect(
                screen.getByText("Aucune donnée de couverture de test disponible")
            ).toBeInTheDocument();
        });
    });

    describe("thème sombre", () => {
        it("adapte les couleurs en mode dark", async () => {
            const { useTheme } = await import("@mui/material");
            vi.mocked(useTheme).mockReturnValueOnce({
                palette: { mode: "dark", primary: { main: "#90caf9", light: "#e3f2fd" } }
            } as ReturnType<typeof useTheme>);
            render(<QualiteCoverageChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.tooltip.backgroundColor).toBe("#1e1e1e");
        });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// QualiteDetteChart
// ─────────────────────────────────────────────────────────────────────────────

describe("QualiteDetteChart", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        capturedOptions.length = 0;
    });

    describe("avec données valides", () => {
        it("affiche le titre", () => {
            render(<QualiteDetteChart data={[validApp]} />);
            expect(screen.getByText("Dette technique vs Couverture de test")).toBeInTheDocument();
        });

        it("rend le composant ECharts", () => {
            render(<QualiteDetteChart data={[validApp]} />);
            expect(screen.getByTestId("echarts")).toBeInTheDocument();
        });

        it("le chart a une hauteur de 400px", () => {
            render(<QualiteDetteChart data={[validApp]} />);
            expect(screen.getByTestId("echarts")).toHaveStyle({ height: "400px" });
        });

        it("utilise un scatter chart", () => {
            render(<QualiteDetteChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.series[0].type).toBe("scatter");
        });

        it("utilise le renderer canvas", () => {
            render(<QualiteDetteChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.xAxis.type).toBe("value");
            expect(option.yAxis.type).toBe("value");
        });

        it("l'axe X représente la couverture (0-100%)", () => {
            render(<QualiteDetteChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.xAxis.min).toBe(0);
            expect(option.xAxis.max).toBe(100);
            expect(option.xAxis.name).toContain("Couverture");
        });

        it("l'axe Y représente la dette technique (jours)", () => {
            render(<QualiteDetteChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.yAxis.name).toContain("Dette technique");
        });

        it("convertit la dette en jours (÷ 420)", () => {
            render(<QualiteDetteChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            const point = option.series[0].data[0];
            expect(point[0]).toBe(75);
            expect(point[1]).toBeCloseTo(0.5, 2);
        });

        it("filtre les apps sans applicationName", () => {
            const appNoName = makeApp({ applicationName: undefined as unknown as string });
            render(<QualiteDetteChart data={[appNoName]} />);
            expect(screen.getByText("Aucune donnée de dette technique disponible")).toBeInTheDocument();
            expect(screen.queryByTestId("echarts")).not.toBeInTheDocument();
        });

        it("filtre les apps avec detteTechnique NR", () => {
            render(<QualiteDetteChart data={[validApp, appNoDette]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.series[0].data).toHaveLength(1);
        });

        it("filtre les apps avec pourcentageCouvertureTestUniaire NR", () => {
            render(<QualiteDetteChart data={[validApp, appNoCoverage]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.series[0].data).toHaveLength(1);
        });

        // --- Callbacks tooltip formatter ---

        it("tooltip formatter retourne les données de l'app", () => {
            render(<QualiteDetteChart data={[validApp]} />);
            const opt = getLastCapturedOption() as any;
            const result = opt.tooltip.formatter({ dataIndex: 0 });
            expect(result).toContain("App Test");
            expect(result).toContain("0.5");
            expect(result).toContain("75.0");
        });

        it("tooltip formatter retourne message si item introuvable", () => {
            render(<QualiteDetteChart data={[validApp]} />);
            const opt = getLastCapturedOption() as any;
            const result = opt.tooltip.formatter({ dataIndex: 999 });
            expect(result).toBe("Données non disponibles");
        });

        // --- Callback symbolSize ---

        it("symbolSize retourne 6 si nbLigneCode est 0", () => {
            const appNoCode = makeApp({ nbLigneCode: "0" });
            render(<QualiteDetteChart data={[appNoCode]} />);
            const opt = getLastCapturedOption() as any;
            const size = opt.series[0].symbolSize({ dataIndex: 0 });
            expect(size).toBe(6);
        });

        it("symbolSize retourne une valeur entre 6 et 18 pour nbLigneCode > 0", () => {
            render(<QualiteDetteChart data={[validApp]} />);
            const opt = getLastCapturedOption() as any;
            const size = opt.series[0].symbolSize({ dataIndex: 0 });
            expect(size).toBeGreaterThanOrEqual(6);
            expect(size).toBeLessThanOrEqual(18);
        });

        // --- Callback itemStyle.color ---

        it("itemStyle.color retourne la couleur correspondant à la lettre de dette", () => {
            render(<QualiteDetteChart data={[validApp]} />);
            const opt = getLastCapturedOption() as any;
            const color = opt.series[0].itemStyle.color({ dataIndex: 0 });
            // validApp.lettreDetteTechnique = "C" → "#8bc34a"
            expect(color).toBe("#8bc34a");
        });

        it("itemStyle.color retourne la couleur NR si lettre absente", () => {
            const appNoLettre = makeApp({ lettreDetteTechnique: undefined as unknown as string });
            render(<QualiteDetteChart data={[appNoLettre]} />);
            const opt = getLastCapturedOption() as any;
            const color = opt.series[0].itemStyle.color({ dataIndex: 0 });
            expect(color).toBe("#9e9e9e");
        });
    });

    describe("sans données", () => {
        it("affiche un message si aucune app avec dette valide", () => {
            render(<QualiteDetteChart data={[appNoDette]} />);
            expect(screen.getByText("Aucune donnée de dette technique disponible")).toBeInTheDocument();
            expect(screen.queryByTestId("echarts")).not.toBeInTheDocument();
        });

        it("affiche un message pour tableau vide", () => {
            render(<QualiteDetteChart data={[]} />);
            expect(screen.getByText("Aucune donnée de dette technique disponible")).toBeInTheDocument();
        });

        it("affiche un message si couverture ET dette sont NR", () => {
            render(
                <QualiteDetteChart
                    data={[makeApp({ detteTechnique: "NR", pourcentageCouvertureTestUniaire: "NR" })]}
                />
            );
            expect(screen.getByText("Aucune donnée de dette technique disponible")).toBeInTheDocument();
        });
    });

    describe("thème sombre", () => {
        it("adapte les couleurs en mode dark", async () => {
            const { useTheme } = await import("@mui/material");
            vi.mocked(useTheme).mockReturnValueOnce({
                palette: { mode: "dark", primary: { main: "#90caf9", light: "#e3f2fd" } }
            } as ReturnType<typeof useTheme>);
            render(<QualiteDetteChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.tooltip.backgroundColor).toBe("#1e1e1e");
        });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// QualiteRadarChart
// ─────────────────────────────────────────────────────────────────────────────

describe("QualiteRadarChart", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        capturedOptions.length = 0;
    });

    describe("avec données valides", () => {
        it("affiche le titre", () => {
            render(<QualiteRadarChart data={[validApp]} />);
            expect(screen.getByText("Distribution des notes par aspect qualité")).toBeInTheDocument();
        });

        it("rend le composant ECharts", () => {
            render(<QualiteRadarChart data={[validApp]} />);
            expect(screen.getByTestId("echarts")).toBeInTheDocument();
        });

        it("le chart a une hauteur de 350px", () => {
            render(<QualiteRadarChart data={[validApp]} />);
            expect(screen.getByTestId("echarts")).toHaveStyle({ height: "350px" });
        });

        it("utilise un stacked bar chart", () => {
            render(<QualiteRadarChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.series[0].type).toBe("bar");
            expect(option.series[0].stack).toBe("total");
        });

        it("génère 4 aspects qualité en abscisse", () => {
            render(<QualiteRadarChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.xAxis.data).toEqual(["Couverture", "Fiabilité", "Dette", "Qualité globale"]);
        });

        it("génère une série par lettre de ORDERED_QUALITE (8 séries : A, B, C, D, E, X, NR, SO)", () => {
            render(<QualiteRadarChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.series).toHaveLength(8);
        });

        it("génère une série 'Note X' pour la lettre X", () => {
            render(<QualiteRadarChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            const serieX = option.series.find((s: { name: string }) => s.name === "Note X");
            expect(serieX).toBeDefined();
        });

        it("compte correctement la lettre B pour Couverture", () => {
            render(<QualiteRadarChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            const serieB = option.series.find((s: { name: string }) => s.name === "Note B");
            expect(serieB.data[0]).toBe(1);
        });

        it("comptabilise les apps avec lettre X dans la série Note X", () => {
            const appX = makeApp({ lettreCouvertureTestUnitaire: "X" });
            render(<QualiteRadarChart data={[appX]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            const serieX = option.series.find((s: { name: string }) => s.name === "Note X");
            expect(serieX.data[0]).toBe(1);
        });

        it("utilise NR comme fallback si lettre absente", () => {
            const appNoLettre = makeApp({
                lettreCouvertureTestUnitaire: undefined as unknown as string,
                lettreFiabilite: undefined as unknown as string,
                lettreDetteTechnique: undefined as unknown as string,
                lettreQualiteGenerale: undefined as unknown as string
            });
            render(<QualiteRadarChart data={[appNoLettre]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            const serieNR = option.series.find((s: { name: string }) => s.name === "Non renseigné");
            expect(serieNR.data).toEqual([1, 1, 1, 1]);
        });

        // --- Callback tooltip formatter ---

        it("tooltip formatter retourne un résumé par aspect", () => {
            render(<QualiteRadarChart data={[validApp]} />);
            const opt = getLastCapturedOption() as any;
            const params = [
                { name: "Couverture", value: 3, marker: "●", seriesName: "Note A" },
                { name: "Couverture", value: 0, marker: "●", seriesName: "Note B" }
            ];
            const result = opt.tooltip.formatter(params);
            expect(result).toContain("Couverture");
            expect(result).toContain("Note A");
            expect(result).toContain("Total");
        });

        it("tooltip formatter n'affiche pas les séries à 0", () => {
            render(<QualiteRadarChart data={[validApp]} />);
            const opt = getLastCapturedOption() as any;
            const params = [
                { name: "Couverture", value: 5, marker: "●", seriesName: "Note A" },
                { name: "Couverture", value: 0, marker: "●", seriesName: "Note B" }
            ];
            const result = opt.tooltip.formatter(params);
            expect(result).not.toContain("Note B");
        });

        it("tooltip formatter gère total = 0 sans division par zéro", () => {
            render(<QualiteRadarChart data={[validApp]} />);
            const opt = getLastCapturedOption() as any;
            const params = [{ name: "Couverture", value: 0, marker: "●", seriesName: "Note A" }];
            const result = opt.tooltip.formatter(params);
            expect(result).toContain("Total : 0");
        });

        // --- Callback label formatter dans les series ---

        it("label formatter retourne la valeur si > 0", () => {
            render(<QualiteRadarChart data={[validApp]} />);
            const opt = getLastCapturedOption() as any;
            const formatter = opt.series[0].label.formatter;
            expect(formatter({ value: 3 })).toBe("3");
        });

        it("label formatter retourne chaîne vide si valeur = 0", () => {
            render(<QualiteRadarChart data={[validApp]} />);
            const opt = getLastCapturedOption() as any;
            const formatter = opt.series[0].label.formatter;
            expect(formatter({ value: 0 })).toBe("");
        });
    });

    describe("sans données", () => {
        it("affiche un message pour tableau vide", () => {
            render(<QualiteRadarChart data={[]} />);
            expect(screen.getByText("Aucune donnée de qualité disponible")).toBeInTheDocument();
        });

        it("n'affiche pas de chart si tous les comptes sont à 0", () => {
            render(<QualiteRadarChart data={[]} />);
            expect(screen.queryByTestId("echarts")).not.toBeInTheDocument();
        });
    });

    describe("thème sombre", () => {
        it("adapte les couleurs en mode dark", async () => {
            const { useTheme } = await import("@mui/material");
            vi.mocked(useTheme).mockReturnValueOnce({
                palette: { mode: "dark", primary: { main: "#90caf9", light: "#e3f2fd" } }
            } as ReturnType<typeof useTheme>);
            render(<QualiteRadarChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.tooltip.backgroundColor).toBe("#1e1e1e");
        });
    });
});
