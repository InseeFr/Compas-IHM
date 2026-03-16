import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import {
    MeteoDistributionChart,
    MeteoEvolutionChart
} from "pages/dashboards/overview/Charts/MeteoCharts";
import type { GlobalIndicator } from "models/indicateurs";

// --- Mocks ---

vi.mock("@mui/material", async importOriginal => {
    const actual = await importOriginal<typeof import("@mui/material")>();
    return {
        ...actual,
        useTheme: vi.fn(() => ({ palette: { mode: "light" } }))
    };
});

vi.mock("echarts-for-react", () => ({
    default: ({ option, style }: { option: unknown; style?: React.CSSProperties }) => (
        <div data-testid="echarts" style={style} data-option={JSON.stringify(option)} />
    )
}));

const mockUseQuery = vi.fn();
vi.mock("@tanstack/react-query", () => ({
    useQuery: (...args: unknown[]) => mockUseQuery(...args)
}));

vi.mock("todos-api/client.gen", () => ({
    getHistory: vi.fn(() => Promise.resolve([]))
}));

vi.mock("constantes/couleurs", () => ({
    METEO_COLORS: { "1": "#d32f2f", "2": "#f57c00", "3": "#fbc02d", "4": "#388e3c", NR: "#9e9e9e" },
    METEO_LABELS: { "1": "Orage", "2": "Pluie", "3": "Nuage", "4": "Soleil" },
    ORDERED_METEO: ["1", "2", "3", "4", "NR"],
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

vi.mock("pages/indicateurs/meteo/meteo-config", () => ({
    frMonthLabel: vi.fn((s: string) => `mois-${s}`)
}));

// --- Fixtures ---

function makeApp(overrides: Partial<GlobalIndicator> = {}): GlobalIndicator {
    return {
        applicationName: "App Test",
        meteo: 3,
        ...overrides
    } as unknown as GlobalIndicator;
}

const validApp = makeApp();
const appNoMeteo = makeApp({ meteo: undefined });

// ─────────────────────────────────────────────────────────────────────────────
// MeteoDistributionChart
// ─────────────────────────────────────────────────────────────────────────────

describe("MeteoDistributionChart", () => {
    beforeEach(() => vi.clearAllMocks());

    describe("avec données valides", () => {
        it("affiche le titre", () => {
            render(<MeteoDistributionChart data={[validApp]} />);
            expect(screen.getByText("Météo actuelle")).toBeInTheDocument();
        });

        it("affiche le sous-titre avec la moyenne", () => {
            render(<MeteoDistributionChart data={[validApp]} />);
            expect(screen.getByText(/Météo moyenne: 3.0\/4/)).toBeInTheDocument();
        });

        it("rend le composant ECharts", () => {
            render(<MeteoDistributionChart data={[validApp]} />);
            expect(screen.getByTestId("echarts")).toBeInTheDocument();
        });

        it("affiche le texte d'information en bas", () => {
            render(<MeteoDistributionChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.graphic.style.text).toContain("Total:");
        });

        it("le chart a une hauteur de 400px", () => {
            render(<MeteoDistributionChart data={[validApp]} />);
            expect(screen.getByTestId("echarts")).toHaveStyle({ height: "400px" });
        });

        it("utilise un bar chart", () => {
            render(<MeteoDistributionChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.series[0].type).toBe("bar");
        });

        it("calcule la moyenne correctement sur plusieurs apps", () => {
            const app1 = makeApp({ meteo: 4 });
            const app2 = makeApp({ meteo: 2 });
            render(<MeteoDistributionChart data={[app1, app2]} />);
            // moyenne = (4+2)/2 = 3.0
            expect(screen.getByText(/Météo moyenne: 3.0\/4/)).toBeInTheDocument();
        });

        it("compte les apps par valeur météo dans les données du chart", () => {
            const app1 = makeApp({ meteo: 3 });
            const app2 = makeApp({ meteo: 3 });
            const app3 = makeApp({ meteo: 4 });
            render(<MeteoDistributionChart data={[app1, app2, app3]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            const barData: { value: number }[] = option.series[0].data;
            // ORDERED_METEO = ["1","2","3","4","NR"] → index 2 = "3" = 2 apps, index 3 = "4" = 1 app
            expect(barData[2].value).toBe(2);
            expect(barData[3].value).toBe(1);
        });

        it("compte les apps NR/undefined dans la catégorie NR", () => {
            render(<MeteoDistributionChart data={[validApp, appNoMeteo]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            const barData: { value: number }[] = option.series[0].data;
            // index 4 = "NR"
            expect(barData[4].value).toBe(1);
        });

        it("le graphic text mentionne le total et les apps avec données", () => {
            render(<MeteoDistributionChart data={[validApp, appNoMeteo]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.graphic.style.text).toContain("Total: 2");
            expect(option.graphic.style.text).toContain("Avec données: 1");
        });
    });

    describe("sans données", () => {
        it("affiche un message si aucune app avec météo valide", () => {
            render(<MeteoDistributionChart data={[appNoMeteo]} />);
            expect(screen.getByText("Aucune donnée météo disponible")).toBeInTheDocument();
            expect(screen.queryByTestId("echarts")).not.toBeInTheDocument();
        });

        it("affiche un message pour tableau vide", () => {
            render(<MeteoDistributionChart data={[]} />);
            expect(screen.getByText("Aucune donnée météo disponible")).toBeInTheDocument();
        });
    });

    describe("thème sombre", () => {
        it("adapte les couleurs en mode dark", async () => {
            const { useTheme } = await import("@mui/material");
            vi.mocked(useTheme).mockReturnValueOnce({
                palette: { mode: "dark" }
            } as ReturnType<typeof useTheme>);
            render(<MeteoDistributionChart data={[validApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.tooltip.backgroundColor).toBe("#1d1d1d");
        });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// MeteoEvolutionChart
// ─────────────────────────────────────────────────────────────────────────────

const historyEntry = (id: number, name: string, date: string, valeur: number) => ({
    idApplication: id,
    appName: name,
    date,
    valeurMeteo: valeur
});

describe("MeteoEvolutionChart", () => {
    beforeEach(() => vi.clearAllMocks());

    describe("état de chargement", () => {
        it("affiche le message de chargement", () => {
            mockUseQuery.mockReturnValue({ data: undefined, isLoading: true, isError: false });
            render(<MeteoEvolutionChart />);
            expect(screen.getByText("Chargement des données…")).toBeInTheDocument();
            expect(screen.queryByTestId("echarts")).not.toBeInTheDocument();
        });
    });

    describe("état d'erreur", () => {
        it("affiche le message d'erreur si isError=true", () => {
            mockUseQuery.mockReturnValue({ data: undefined, isLoading: false, isError: true });
            render(<MeteoEvolutionChart />);
            expect(screen.getByText("Erreur lors du chargement des données météo")).toBeInTheDocument();
            expect(screen.queryByTestId("echarts")).not.toBeInTheDocument();
        });

        it("affiche le message d'erreur si data est null", () => {
            mockUseQuery.mockReturnValue({ data: null, isLoading: false, isError: false });
            render(<MeteoEvolutionChart />);
            expect(screen.getByText("Erreur lors du chargement des données météo")).toBeInTheDocument();
        });
    });

    describe("sans historique suffisant", () => {
        it("affiche un message si aucune app n'a au moins 2 mesures", () => {
            // Une seule mesure par app → pas de comparaison possible
            mockUseQuery.mockReturnValue({
                data: [historyEntry(1, "App A", "2024-01-01", 3)],
                isLoading: false,
                isError: false
            });
            render(<MeteoEvolutionChart />);
            expect(
                screen.getByText("Aucune application avec au moins deux mesures disponibles")
            ).toBeInTheDocument();
            expect(screen.queryByTestId("echarts")).not.toBeInTheDocument();
        });

        it("ignore les entrées sans idApplication ou valeurMeteo ou date", () => {
            mockUseQuery.mockReturnValue({
                data: [
                    { idApplication: undefined, appName: "X", date: "2024-01-01", valeurMeteo: 3 },
                    { idApplication: 1, appName: "Y", date: undefined, valeurMeteo: 3 },
                    { idApplication: 2, appName: "Z", date: "2024-01-01", valeurMeteo: undefined }
                ],
                isLoading: false,
                isError: false
            });
            render(<MeteoEvolutionChart />);
            expect(
                screen.getByText("Aucune application avec au moins deux mesures disponibles")
            ).toBeInTheDocument();
        });
    });

    describe("avec données valides", () => {
        const twoMeasuresData = [
            historyEntry(1, "App A", "2024-01-01", 2),
            historyEntry(1, "App A", "2024-02-01", 3), // amélioration
            historyEntry(2, "App B", "2024-01-01", 4),
            historyEntry(2, "App B", "2024-02-01", 2), // dégradation
            historyEntry(3, "App C", "2024-01-01", 3),
            historyEntry(3, "App C", "2024-02-01", 3) // stable
        ];

        beforeEach(() => {
            mockUseQuery.mockReturnValue({
                data: twoMeasuresData,
                isLoading: false,
                isError: false
            });
        });

        it("affiche le titre avec les mois de transition", () => {
            render(<MeteoEvolutionChart />);
            expect(screen.getByText(/Évolution météo:/)).toBeInTheDocument();
        });

        it("affiche le sous-titre avec le nombre d'applications comparées", () => {
            render(<MeteoEvolutionChart />);
            expect(screen.getByText(/3 applications comparées/)).toBeInTheDocument();
        });

        it("rend le composant ECharts", () => {
            render(<MeteoEvolutionChart />);
            expect(screen.getByTestId("echarts")).toBeInTheDocument();
        });

        it("le chart a une hauteur de 380px", () => {
            render(<MeteoEvolutionChart />);
            expect(screen.getByTestId("echarts")).toHaveStyle({ height: "380px" });
        });

        it("génère 3 catégories (Éclaircie, Temps stable, Dégradation)", () => {
            render(<MeteoEvolutionChart />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            const xAxisData: string[] = option.xAxis.data;
            expect(xAxisData).toContain("Éclaircie");
            expect(xAxisData).toContain("Temps stable");
            expect(xAxisData).toContain("Dégradation");
        });

        it("classe correctement les apps : 1 améliorée, 1 stable, 1 dégradée", () => {
            render(<MeteoEvolutionChart />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            const barData: { value: number }[] = option.series[0].data;
            // Éclaircie index 0 = 1, Stable index 1 = 1, Dégradation index 2 = 1
            expect(barData[0].value).toBe(1); // Éclaircie : App A
            expect(barData[1].value).toBe(1); // Stable : App C
            expect(barData[2].value).toBe(1); // Dégradation : App B
        });

        it("utilise les couleurs correctes pour chaque catégorie", () => {
            render(<MeteoEvolutionChart />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            const barData: { value: number; itemStyle: { color: string } }[] = option.series[0].data;
            expect(barData[0].itemStyle.color).toBe("#4caf50"); // Éclaircie
            expect(barData[1].itemStyle.color).toBe("#9e9e9e"); // Stable
            expect(barData[2].itemStyle.color).toBe("#f44336"); // Dégradation
        });

        it("utilise frMonthLabel pour construire les labels de mois", async () => {
            const { frMonthLabel } = await import("pages/indicateurs/meteo/meteo-config");
            render(<MeteoEvolutionChart />);
            expect(frMonthLabel).toHaveBeenCalled();
        });

        it("utilise la queryKey ['meteoHistory']", () => {
            render(<MeteoEvolutionChart />);
            const callArgs = mockUseQuery.mock.calls[0][0];
            expect(callArgs.queryKey).toEqual(["meteoHistory"]);
        });

        it("appelle getHistory comme queryFn", async () => {
            const { getHistory } = await import("todos-api/client.gen");
            render(<MeteoEvolutionChart />);
            const callArgs = mockUseQuery.mock.calls[0][0];
            callArgs.queryFn();
            expect(getHistory).toHaveBeenCalled();
        });
    });

    describe("singulier/pluriel", () => {
        it("affiche le singulier pour une seule app comparée", () => {
            mockUseQuery.mockReturnValue({
                data: [
                    historyEntry(1, "App Solo", "2024-01-01", 2),
                    historyEntry(1, "App Solo", "2024-02-01", 3)
                ],
                isLoading: false,
                isError: false
            });
            render(<MeteoEvolutionChart />);
            expect(screen.getByText(/1 application comparée /)).toBeInTheDocument();
        });
    });

    describe("thème sombre", () => {
        it("adapte les couleurs en mode dark", async () => {
            mockUseQuery.mockReturnValue({
                data: [
                    historyEntry(1, "App A", "2024-01-01", 2),
                    historyEntry(1, "App A", "2024-02-01", 3)
                ],
                isLoading: false,
                isError: false
            });
            const { useTheme } = await import("@mui/material");
            vi.mocked(useTheme).mockReturnValueOnce({
                palette: { mode: "dark" }
            } as ReturnType<typeof useTheme>);
            render(<MeteoEvolutionChart />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.tooltip.backgroundColor).toBe("#1d1d1d");
        });
    });
});
