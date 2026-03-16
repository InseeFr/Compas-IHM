import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import {
    GreenITProdHorsProdGroupedChart,
    GreenITDomainProdChart
} from "pages/dashboards/overview/Charts/GreenITCharts";
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

// --- Helpers ---

function makeApp(overrides: Partial<GlobalIndicator> = {}): GlobalIndicator {
    return {
        applicationName: "App Test",
        domaine: "Domaine A",
        conso: "1000",
        consoProd: "600",
        cpuAllocated: "8",
        cpuAllocatedProd: "5",
        ramAllocated: "16",
        ramAllocatedProd: "10",
        diskAllocated: "500",
        diskAllocatedProd: "300",
        nbVm: "4",
        nbVmProd: "2",
        ...overrides
    } as unknown as GlobalIndicator;
}

// ─────────────────────────────────────────────────────────────────────────────
// GreenITProdHorsProdGroupedChart
// ─────────────────────────────────────────────────────────────────────────────

describe("GreenITProdHorsProdGroupedChart", () => {
    beforeEach(() => vi.clearAllMocks());

    describe("avec données valides", () => {
        it("affiche le titre", () => {
            render(<GreenITProdHorsProdGroupedChart data={[makeApp()]} />);
            expect(screen.getByText("Répartition Prod vs Hors-Prod par ressource")).toBeInTheDocument();
        });

        it("affiche le sous-titre", () => {
            render(<GreenITProdHorsProdGroupedChart data={[makeApp()]} />);
            expect(
                screen.getByText(/Part des ressources allouées en environnement de production/)
            ).toBeInTheDocument();
        });

        it("rend le composant ECharts", () => {
            render(<GreenITProdHorsProdGroupedChart data={[makeApp()]} />);
            expect(screen.getByTestId("echarts")).toBeInTheDocument();
        });

        it("affiche les chips de totaux pour chaque ressource", () => {
            render(<GreenITProdHorsProdGroupedChart data={[makeApp()]} />);
            // Au moins une chip avec une ressource connue
            expect(screen.getByText(/Conso \(Wh\)/)).toBeInTheDocument();
        });

        it("le chart a une hauteur de 360px", () => {
            render(<GreenITProdHorsProdGroupedChart data={[makeApp()]} />);
            expect(screen.getByTestId("echarts")).toHaveStyle({ height: "360px" });
        });

        it("génère deux séries (Production et Hors-Production)", () => {
            render(<GreenITProdHorsProdGroupedChart data={[makeApp()]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.series).toHaveLength(2);
            expect(option.series[0].name).toBe("Production");
            expect(option.series[1].name).toBe("Hors-Production");
        });

        it("empile les deux séries sur 'total'", () => {
            render(<GreenITProdHorsProdGroupedChart data={[makeApp()]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.series[0].stack).toBe("total");
            expect(option.series[1].stack).toBe("total");
        });

        it("les valeurs Prod + HorsProd = 100 pour chaque ressource", () => {
            render(<GreenITProdHorsProdGroupedChart data={[makeApp()]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            const prodValues: number[] = option.series[0].data.map((d: { value: number }) => d.value);
            const horsValues: number[] = option.series[1].data.map((d: { value: number }) => d.value);
            prodValues.forEach((pv, i) => {
                expect(pv + horsValues[i]).toBeCloseTo(100, 1);
            });
        });

        it("l'axe Y va de 0 à 100 (pourcentages)", () => {
            render(<GreenITProdHorsProdGroupedChart data={[makeApp()]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.yAxis.min).toBe(0);
            expect(option.yAxis.max).toBe(100);
        });
    });

    describe("cas limites", () => {
        it("affiche EmptyState si toutes les données sont nulles/NR", () => {
            const emptyApp = makeApp({
                conso: "NR",
                cpuAllocated: "NR",
                ramAllocated: "NR",
                diskAllocated: "NR",
                nbVm: "NR"
            });
            render(<GreenITProdHorsProdGroupedChart data={[emptyApp]} />);
            expect(screen.getByText("Aucune donnée Prod/Hors-Prod disponible")).toBeInTheDocument();
            expect(screen.queryByTestId("echarts")).not.toBeInTheDocument();
        });

        it("affiche EmptyState pour un tableau vide", () => {
            render(<GreenITProdHorsProdGroupedChart data={[]} />);
            expect(screen.getByText("Aucune donnée Prod/Hors-Prod disponible")).toBeInTheDocument();
        });

        it("ignore les apps avec valeur SO", () => {
            const soApp = makeApp({
                conso: "SO",
                cpuAllocated: "SO",
                ramAllocated: "SO",
                diskAllocated: "SO",
                nbVm: "SO"
            });
            render(<GreenITProdHorsProdGroupedChart data={[soApp]} />);
            expect(screen.getByText("Aucune donnée Prod/Hors-Prod disponible")).toBeInTheDocument();
        });

        it("calcule consoProd=0 si absent (horsProd = total)", () => {
            const appNoProd = makeApp({ consoProd: undefined as unknown as string });
            render(<GreenITProdHorsProdGroupedChart data={[appNoProd]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            // série Prod pour Conso doit être 0%
            const consoIdx = option.xAxis.data.indexOf("Conso (Wh)");
            expect(option.series[0].data[consoIdx].value).toBeCloseTo(0, 1);
        });
    });

    describe("thème sombre", () => {
        it("adapte les couleurs du tooltip en mode dark", async () => {
            const { useTheme } = await import("@mui/material");
            vi.mocked(useTheme).mockReturnValueOnce({
                palette: { mode: "dark" }
            } as ReturnType<typeof useTheme>);
            render(<GreenITProdHorsProdGroupedChart data={[makeApp()]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.tooltip.backgroundColor).toBe("#1e1e2e");
        });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// GreenITDomainProdChart
// ─────────────────────────────────────────────────────────────────────────────

describe("GreenITDomainProdChart", () => {
    beforeEach(() => vi.clearAllMocks());

    const app1 = makeApp({ domaine: "Finance", conso: "2000", consoProd: "1200" });
    const app2 = makeApp({ domaine: "RH", conso: "1000", consoProd: "400" });
    const app3 = makeApp({ domaine: "Finance", conso: "500", consoProd: "200" });

    describe("avec données valides", () => {
        it("affiche le titre", () => {
            render(<GreenITDomainProdChart data={[app1, app2]} />);
            expect(screen.getByText("Consommation par domaine — Prod vs Hors-Prod")).toBeInTheDocument();
        });

        it("affiche le sous-titre", () => {
            render(<GreenITDomainProdChart data={[app1, app2]} />);
            expect(
                screen.getByText(/Consommation totale \(Wh\) agrégée par domaine/)
            ).toBeInTheDocument();
        });

        it("rend le composant ECharts", () => {
            render(<GreenITDomainProdChart data={[app1, app2]} />);
            expect(screen.getByTestId("echarts")).toBeInTheDocument();
        });

        it("le chart a une hauteur de 400px", () => {
            render(<GreenITDomainProdChart data={[app1, app2]} />);
            expect(screen.getByTestId("echarts")).toHaveStyle({ height: "400px" });
        });

        it("agrège les apps par domaine", () => {
            render(<GreenITDomainProdChart data={[app1, app2, app3]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            const domains: string[] = option.xAxis.data;
            // Finance et RH seulement (agrégés)
            expect(domains).toContain("Finance");
            expect(domains).toContain("RH");
            expect(domains).toHaveLength(2);
        });

        it("trie les domaines par consommation totale décroissante", () => {
            render(<GreenITDomainProdChart data={[app1, app2, app3]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            const domains: string[] = option.xAxis.data;
            // Finance total = 2500, RH total = 1000 → Finance en premier
            expect(domains[0]).toBe("Finance");
            expect(domains[1]).toBe("RH");
        });

        it("génère deux séries (Production et Hors-Production)", () => {
            render(<GreenITDomainProdChart data={[app1]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.series).toHaveLength(2);
            expect(option.series[0].name).toBe("Production");
            expect(option.series[1].name).toBe("Hors-Production");
        });

        it("empile les séries sur 'conso'", () => {
            render(<GreenITDomainProdChart data={[app1]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.series[0].stack).toBe("conso");
            expect(option.series[1].stack).toBe("conso");
        });

        it("prod + horsProd = total pour chaque domaine", () => {
            render(<GreenITDomainProdChart data={[app1, app2, app3]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            const prodData: number[] = option.series[0].data;
            const horsData: number[] = option.series[1].data;
            const domains: string[] = option.xAxis.data;

            const financeIdx = domains.indexOf("Finance");
            expect(prodData[financeIdx] + horsData[financeIdx]).toBeCloseTo(2500, 0); // 2000+500

            const rhIdx = domains.indexOf("RH");
            expect(prodData[rhIdx] + horsData[rhIdx]).toBeCloseTo(1000, 0);
        });

        it("limite à 15 domaines maximum", () => {
            const manyApps = Array.from({ length: 20 }, (_, i) =>
                makeApp({ domaine: `Domaine${i}`, conso: String(1000 + i * 100) })
            );
            render(<GreenITDomainProdChart data={manyApps} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.xAxis.data.length).toBeLessThanOrEqual(15);
        });

        it("utilise 'Inconnu' comme domaine fallback si domaine absent", () => {
            const appNoDomaine = makeApp({ domaine: undefined as unknown as string });
            render(<GreenITDomainProdChart data={[appNoDomaine]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.xAxis.data).toContain("Inconnu");
        });
    });

    describe("cas limites", () => {
        it("affiche EmptyState si toutes les conso sont nulles/NR", () => {
            render(<GreenITDomainProdChart data={[makeApp({ conso: "NR" })]} />);
            expect(screen.getByText("Aucune donnée par domaine disponible")).toBeInTheDocument();
            expect(screen.queryByTestId("echarts")).not.toBeInTheDocument();
        });

        it("affiche EmptyState pour un tableau vide", () => {
            render(<GreenITDomainProdChart data={[]} />);
            expect(screen.getByText("Aucune donnée par domaine disponible")).toBeInTheDocument();
        });

        it("consoProd absent → horsProd = conso entier", () => {
            const appNoProd = makeApp({
                domaine: "IT",
                conso: "800",
                consoProd: undefined as unknown as string
            });
            render(<GreenITDomainProdChart data={[appNoProd]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            const prodData: number[] = option.series[0].data;
            const horsData: number[] = option.series[1].data;
            // prod = 0, horsProd = 800
            expect(prodData[0]).toBe(0);
            expect(horsData[0]).toBeCloseTo(800, 0);
        });
    });

    describe("thème sombre", () => {
        it("adapte les couleurs en mode dark", async () => {
            const { useTheme } = await import("@mui/material");
            vi.mocked(useTheme).mockReturnValueOnce({
                palette: { mode: "dark" }
            } as ReturnType<typeof useTheme>);
            render(<GreenITDomainProdChart data={[app1]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.tooltip.backgroundColor).toBe("#1e1e2e");
        });
    });
});
