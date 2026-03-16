import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import {
    DevopsMEPChart,
    DevopsDeploymentChart,
    DevopsContributorChart,
    DevopsRadarChart
} from "pages/dashboards/overview/Charts/DevopsCharts";
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

vi.mock("echarts-for-react", () => ({
    default: ({ option, style }: { option: unknown; style?: React.CSSProperties }) => (
        <div data-testid="echarts" style={style} data-option={JSON.stringify(option)} />
    )
}));

vi.mock("constantes/couleurs", () => ({
    QUALITE_COLORS: {
        A: "#1b5e20",
        B: "#388e3c",
        C: "#8bc34a",
        D: "#fbc02d",
        E: "#f57c00",
        F: "#d32f2f",
        NR: "#9e9e9e"
    },
    ORDERED_QUALITE: ["A", "B", "C", "D", "E", "F", "NR"]
}));

vi.mock("constantes/constantes-headers", () => ({
    DEVOPS_HEADERS: {
        NIVEAU_FRAICHEUR_MEP: "Niveau fraîcheur MEP",
        CONTRIBUTEUR: "Contributeur"
    }
}));

// --- Fixtures ---

function makeApp(overrides: Partial<GlobalIndicator> = {}): GlobalIndicator {
    return {
        applicationName: "App Test",
        sndi: "SNDI-001",
        distanceCount: "45",
        nbDeploymentCount: "10",
        lettreContributorCount: "B",
        lettreDeploymentCount: "A",
        lettreDistanceCount: "C",
        lettreDevopsGenerale: "B",
        ...overrides
    } as unknown as GlobalIndicator;
}

const validApp = makeApp();
const appNoDistance = makeApp({ distanceCount: "NR" });
const appNoDeployment = makeApp({ nbDeploymentCount: "NR", distanceCount: "NR" });

// ─────────────────────────────────────────────────────────────────────────────
// DevopsMEPChart
// ─────────────────────────────────────────────────────────────────────────────

describe("DevopsMEPChart", () => {
    beforeEach(() => vi.clearAllMocks());

    describe("avec données valides", () => {
        it("affiche le titre", () => {
            render(<DevopsMEPChart data={[validApp]} />);
            expect(screen.getByText("Niveau fraîcheur MEP")).toBeInTheDocument();
        });

        it("rend le composant ECharts", () => {
            render(<DevopsMEPChart data={[validApp]} />);
            expect(screen.getByTestId("echarts")).toBeInTheDocument();
        });

        it("le chart a une hauteur de 350px", () => {
            render(<DevopsMEPChart data={[validApp]} />);
            expect(screen.getByTestId("echarts")).toHaveStyle({ height: "350px" });
        });

        it("affiche le texte d'information en bas", () => {
            render(<DevopsMEPChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.graphic.style.text).toContain("Total:");
        });

        it("génère 5 niveaux MEP en abscisse", () => {
            render(<DevopsMEPChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.xAxis.data).toHaveLength(5);
            expect(option.xAxis.data[0]).toBe("0-30 jours");
            expect(option.xAxis.data[4]).toBe(">180 jours");
        });

        it("place 45 jours dans le niveau 31-60 jours (index 1)", () => {
            render(<DevopsMEPChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            const barData: { value: number }[] = option.series[0].data;
            expect(barData[1].value).toBe(1); // 31-60 jours
        });

        it("utilise les bonnes couleurs par niveau", () => {
            render(<DevopsMEPChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            const barData: { value: number; itemStyle: { color: string } }[] = option.series[0].data;
            expect(barData[0].itemStyle.color).toBe("#388e3c"); // 0-30 jours = vert
            expect(barData[4].itemStyle.color).toBe("#e53935"); // >180 jours = rouge
        });

        it("ignore les apps avec distanceCount SO", () => {
            const soApp = makeApp({ distanceCount: "SO" });
            render(<DevopsMEPChart data={[soApp]} />);
            expect(screen.getByText("Aucune donnée de fraîcheur MEP disponible")).toBeInTheDocument();
        });

        it("calcule correctement le pourcentage dans le graphic text", () => {
            render(<DevopsMEPChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            // 1 app avec données sur 1 total = 100%
            expect(option.graphic.style.text).toContain("Avec données: 1 (100.0%)");
        });
    });

    describe("sans données", () => {
        it("affiche un message si aucune app avec distance valide", () => {
            render(<DevopsMEPChart data={[appNoDistance]} />);
            expect(screen.getByText("Aucune donnée de fraîcheur MEP disponible")).toBeInTheDocument();
            expect(screen.queryByTestId("echarts")).not.toBeInTheDocument();
        });

        it("affiche un message pour tableau vide", () => {
            render(<DevopsMEPChart data={[]} />);
            expect(screen.getByText("Aucune donnée de fraîcheur MEP disponible")).toBeInTheDocument();
        });
    });

    describe("thème sombre", () => {
        it("adapte les couleurs du tooltip en mode dark", async () => {
            const { useTheme } = await import("@mui/material");
            vi.mocked(useTheme).mockReturnValueOnce({
                palette: { mode: "dark", primary: { main: "#90caf9", light: "#e3f2fd" } }
            } as ReturnType<typeof useTheme>);
            render(<DevopsMEPChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.tooltip.backgroundColor).toBe("#1d1d1d");
        });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// DevopsDeploymentChart
// ─────────────────────────────────────────────────────────────────────────────

describe("DevopsDeploymentChart", () => {
    beforeEach(() => vi.clearAllMocks());

    describe("avec données valides", () => {
        it("affiche le titre", () => {
            render(<DevopsDeploymentChart data={[validApp]} />);
            expect(screen.getByText("Nombre de déploiements vs Fraîcheur MEP")).toBeInTheDocument();
        });

        it("rend le composant ECharts", () => {
            render(<DevopsDeploymentChart data={[validApp]} />);
            expect(screen.getByTestId("echarts")).toBeInTheDocument();
        });

        it("le chart a une hauteur de 400px", () => {
            render(<DevopsDeploymentChart data={[validApp]} />);
            expect(screen.getByTestId("echarts")).toHaveStyle({ height: "400px" });
        });

        it("utilise un scatter chart", () => {
            render(<DevopsDeploymentChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.series[0].type).toBe("scatter");
        });

        it("l'axe X représente la distance (jours)", () => {
            render(<DevopsDeploymentChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.xAxis.name).toContain("Distance");
            expect(option.xAxis.min).toBe(0);
        });

        it("l'axe Y représente le nombre de déploiements", () => {
            render(<DevopsDeploymentChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.yAxis.name).toContain("déploiements");
        });

        it("place correctement les points [distance, deployments]", () => {
            render(<DevopsDeploymentChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            // validApp: distanceCount=45, nbDeploymentCount=10
            expect(option.series[0].data[0]).toEqual([45, 10]);
        });

        it("filtre les apps avec nbDeploymentCount NR", () => {
            render(<DevopsDeploymentChart data={[validApp, makeApp({ nbDeploymentCount: "NR" })]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.series[0].data).toHaveLength(1);
        });

        it("filtre les apps sans applicationName (condition du source)", () => {
            // Le source exige app.applicationName !== undefined → app exclue → EmptyState
            const appNoName = makeApp({ applicationName: undefined as unknown as string });
            render(<DevopsDeploymentChart data={[appNoName]} />);
            expect(screen.getByText("Aucune donnée de déploiement disponible")).toBeInTheDocument();
            expect(screen.queryByTestId("echarts")).not.toBeInTheDocument();
        });
    });

    describe("sans données", () => {
        it("affiche un message si aucune donnée valide", () => {
            render(<DevopsDeploymentChart data={[appNoDeployment]} />);
            expect(screen.getByText("Aucune donnée de déploiement disponible")).toBeInTheDocument();
            expect(screen.queryByTestId("echarts")).not.toBeInTheDocument();
        });

        it("affiche un message pour tableau vide", () => {
            render(<DevopsDeploymentChart data={[]} />);
            expect(screen.getByText("Aucune donnée de déploiement disponible")).toBeInTheDocument();
        });

        it("affiche un message si distanceCount est SO", () => {
            const soApp = makeApp({ distanceCount: "SO" });
            render(<DevopsDeploymentChart data={[soApp]} />);
            expect(screen.getByText("Aucune donnée de déploiement disponible")).toBeInTheDocument();
        });
    });

    describe("thème sombre", () => {
        it("adapte les couleurs en mode dark", async () => {
            const { useTheme } = await import("@mui/material");
            vi.mocked(useTheme).mockReturnValueOnce({
                palette: { mode: "dark", primary: { main: "#90caf9", light: "#e3f2fd" } }
            } as ReturnType<typeof useTheme>);
            render(<DevopsDeploymentChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.tooltip.backgroundColor).toBe("#1d1d1d");
        });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// DevopsContributorChart
// ─────────────────────────────────────────────────────────────────────────────

describe("DevopsContributorChart", () => {
    beforeEach(() => vi.clearAllMocks());

    describe("avec données valides", () => {
        it("affiche le titre", () => {
            render(<DevopsContributorChart data={[validApp]} />);
            expect(screen.getByText("Contributeur")).toBeInTheDocument();
        });

        it("rend le composant ECharts", () => {
            render(<DevopsContributorChart data={[validApp]} />);
            expect(screen.getByTestId("echarts")).toBeInTheDocument();
        });

        it("le chart a une hauteur de 300px", () => {
            render(<DevopsContributorChart data={[validApp]} />);
            expect(screen.getByTestId("echarts")).toHaveStyle({ height: "300px" });
        });

        it("utilise un pie chart avec donut style", () => {
            render(<DevopsContributorChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.series[0].type).toBe("pie");
            expect(option.series[0].radius).toEqual(["40%", "70%"]);
        });

        it("compte correctement les lettres", () => {
            const appA = makeApp({ lettreContributorCount: "A" });
            const appB1 = makeApp({ lettreContributorCount: "B" });
            const appB2 = makeApp({ lettreContributorCount: "B" });
            render(<DevopsContributorChart data={[appA, appB1, appB2]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            const pieData: { name: string; value: number }[] = option.series[0].data;
            const noteA = pieData.find(d => d.name === "Note A");
            const noteB = pieData.find(d => d.name === "Note B");
            expect(noteA?.value).toBe(1);
            expect(noteB?.value).toBe(2);
        });

        it("utilise 'Non renseigné' pour la lettre NR", () => {
            const appNR = makeApp({ lettreContributorCount: "NR" });
            render(<DevopsContributorChart data={[appNR]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            const pieData: { name: string }[] = option.series[0].data;
            expect(pieData.some(d => d.name === "Non renseigné")).toBe(true);
        });

        it("utilise NR comme fallback si lettreContributorCount absent", () => {
            const appNoLettre = makeApp({ lettreContributorCount: undefined as unknown as string });
            render(<DevopsContributorChart data={[appNoLettre]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            const pieData: { name: string; value: number }[] = option.series[0].data;
            const nr = pieData.find(d => d.name === "Non renseigné");
            expect(nr?.value).toBe(1);
        });
    });

    describe("sans données", () => {
        it("affiche un message pour tableau vide", () => {
            render(<DevopsContributorChart data={[]} />);
            expect(screen.getByText("Aucune donnée de contributeurs disponible")).toBeInTheDocument();
            expect(screen.queryByTestId("echarts")).not.toBeInTheDocument();
        });
    });

    describe("thème sombre", () => {
        it("adapte les couleurs en mode dark", async () => {
            const { useTheme } = await import("@mui/material");
            vi.mocked(useTheme).mockReturnValueOnce({
                palette: { mode: "dark", primary: { main: "#90caf9", light: "#e3f2fd" } }
            } as ReturnType<typeof useTheme>);
            render(<DevopsContributorChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.tooltip.backgroundColor).toBe("#1d1d1d");
        });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// DevopsRadarChart
// ─────────────────────────────────────────────────────────────────────────────

describe("DevopsRadarChart", () => {
    beforeEach(() => vi.clearAllMocks());

    describe("avec données valides", () => {
        it("affiche le titre", () => {
            render(<DevopsRadarChart data={[validApp]} />);
            expect(screen.getByText("Indicateurs DevOps")).toBeInTheDocument();
        });

        it("rend le composant ECharts", () => {
            render(<DevopsRadarChart data={[validApp]} />);
            expect(screen.getByTestId("echarts")).toBeInTheDocument();
        });

        it("le chart a une hauteur de 350px", () => {
            render(<DevopsRadarChart data={[validApp]} />);
            expect(screen.getByTestId("echarts")).toHaveStyle({ height: "350px" });
        });

        it("utilise un radar chart", () => {
            render(<DevopsRadarChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.series[0].type).toBe("radar");
        });

        it("génère 4 indicateurs radar (Contributeurs, Déploiements, Distance, DevOps global)", () => {
            render(<DevopsRadarChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            const indicators: { name: string; max: number }[] = option.radar.indicator;
            expect(indicators).toHaveLength(4);
            expect(indicators.map(i => i.name)).toEqual([
                "Contributeurs",
                "Déploiements",
                "Distance",
                "DevOps global"
            ]);
            indicators.forEach(ind => expect(ind.max).toBe(100));
        });

        it("convertit les lettres en score (A=100, B=80, C=60, D=40, E=20)", () => {
            // validApp: B, A, C, B → scores moyens : B=80, A=100, C=60, B=80
            render(<DevopsRadarChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            const values: number[] = option.series[0].data[0].value;
            expect(values[0]).toBeCloseTo(80, 1); // lettreContributorCount = B
            expect(values[1]).toBeCloseTo(100, 1); // lettreDeploymentCount = A
            expect(values[2]).toBeCloseTo(60, 1); // lettreDistanceCount = C
            expect(values[3]).toBeCloseTo(80, 1); // lettreDevopsGenerale = B
        });

        it("les valeurs radar sont toutes entre 0 et 100", () => {
            render(<DevopsRadarChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            const values: number[] = option.series[0].data[0].value;
            values.forEach(v => {
                expect(v).toBeGreaterThanOrEqual(0);
                expect(v).toBeLessThanOrEqual(100);
            });
        });

        it("la légende de la série est 'DevOps moyen'", () => {
            render(<DevopsRadarChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.series[0].data[0].name).toBe("DevOps moyen");
        });
    });

    describe("sans données", () => {
        it("affiche un message si aucune donnée valide (toutes NR)", () => {
            const appAllNR = makeApp({
                lettreContributorCount: "NR",
                lettreDeploymentCount: "NR",
                lettreDistanceCount: "NR",
                lettreDevopsGenerale: "NR"
            });
            render(<DevopsRadarChart data={[appAllNR]} />);
            expect(screen.getByText("Aucune donnée DevOps disponible")).toBeInTheDocument();
            expect(screen.queryByTestId("echarts")).not.toBeInTheDocument();
        });

        it("affiche un message pour tableau vide", () => {
            render(<DevopsRadarChart data={[]} />);
            expect(screen.getByText("Aucune donnée DevOps disponible")).toBeInTheDocument();
        });
    });

    describe("thème sombre", () => {
        it("adapte les couleurs en mode dark", async () => {
            const { useTheme } = await import("@mui/material");
            vi.mocked(useTheme).mockReturnValueOnce({
                palette: { mode: "dark", primary: { main: "#90caf9", light: "#e3f2fd" } }
            } as ReturnType<typeof useTheme>);
            render(<DevopsRadarChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.tooltip.backgroundColor).toBe("#1d1d1d");
        });
    });
});
