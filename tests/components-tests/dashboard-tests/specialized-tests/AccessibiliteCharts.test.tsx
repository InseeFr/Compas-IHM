import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
    AccessibiliteGaugeChart,
    AccessibiliteAuditedAppsChart
} from "pages/dashboards/overview/Charts/AccessibiliteCharts";
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

// --- Fixtures ---

function makeApp(overrides: Partial<GlobalIndicator> = {}): GlobalIndicator {
    return {
        applicationName: "App Test",
        sndi: "SNDI-001",
        scoreAuditA11y: 75,
        lettreA11y: "C",
        declarationA11y: false,
        domaine: "Domaine A",
        typeAuditA11yId: 511,
        ...overrides
    } as unknown as GlobalIndicator;
}

const auditedApp = makeApp({ scoreAuditA11y: 85, lettreA11y: "A", declarationA11y: true });
const nonAuditedApp = makeApp({ scoreAuditA11y: 0, applicationName: "App Non Auditée" });
const nullScoreApp = makeApp({ scoreAuditA11y: null as unknown as number, applicationName: "App Null" });

// ─────────────────────────────────────────────────────────────────────────────
// AccessibiliteGaugeChart
// ─────────────────────────────────────────────────────────────────────────────

describe("AccessibiliteGaugeChart", () => {
    describe("avec des données auditées", () => {
        it("affiche le titre", () => {
            render(<AccessibiliteGaugeChart data={[auditedApp]} />);
            expect(screen.getByText("Couverture des audits accessibilité")).toBeInTheDocument();
        });

        it("affiche le sous-titre avec le bon comptage", () => {
            render(<AccessibiliteGaugeChart data={[auditedApp, nonAuditedApp]} />);
            expect(screen.getByText(/1 application auditée sur 2/)).toBeInTheDocument();
        });

        it("affiche 'applications' au pluriel pour plusieurs auditées", () => {
            const app2 = makeApp({ scoreAuditA11y: 60, applicationName: "App 2" });
            render(<AccessibiliteGaugeChart data={[auditedApp, app2]} />);
            expect(screen.getByText(/2 applications auditées sur 2/)).toBeInTheDocument();
        });

        it("rend le composant ECharts", () => {
            render(<AccessibiliteGaugeChart data={[auditedApp]} />);
            expect(screen.getByTestId("echarts")).toBeInTheDocument();
        });

        it("calcule coverageRate = 100% quand toutes les apps sont auditées", () => {
            render(<AccessibiliteGaugeChart data={[auditedApp]} />);
            const chart = screen.getByTestId("echarts");
            const option = JSON.parse(chart.dataset.option!);
            const mainGauge = option.series[0];
            expect(mainGauge.data[0].value).toBe(100);
        });

        it("calcule coverageRate = 50% pour 1 auditée sur 2", () => {
            render(<AccessibiliteGaugeChart data={[auditedApp, nonAuditedApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.series[0].data[0].value).toBe(50);
        });

        it("passe le score moyen au mini gauge", () => {
            const app2 = makeApp({ scoreAuditA11y: 75, applicationName: "App 2" });
            render(<AccessibiliteGaugeChart data={[auditedApp, app2]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            const avgGauge = option.series[1];
            expect(avgGauge.data[0].value).toBe(80); // (85+75)/2
        });
    });

    describe("sans données", () => {
        it("gère un tableau vide (coverage 0%)", () => {
            render(<AccessibiliteGaugeChart data={[]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.series[0].data[0].value).toBe(0);
        });

        it("affiche '0 application auditée sur 0'", () => {
            render(<AccessibiliteGaugeChart data={[]} />);
            expect(screen.getByText(/0 application auditée sur 0/)).toBeInTheDocument();
        });

        it("gère les apps avec scoreAuditA11y null", () => {
            render(<AccessibiliteGaugeChart data={[nullScoreApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.series[0].data[0].value).toBe(0);
        });
    });

    describe("thème sombre", () => {
        it("adapte les couleurs en mode dark", async () => {
            const { useTheme } = await import("@mui/material");
            vi.mocked(useTheme).mockReturnValueOnce({
                palette: { mode: "dark" }
            } as ReturnType<typeof useTheme>);
            render(<AccessibiliteGaugeChart data={[auditedApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            const mainAxisLine = option.series[0].axisLine.lineStyle.color;
            // En dark, la partie vide doit être #2a2a3a
            const emptyColor = mainAxisLine[mainAxisLine.length - 1][1];
            expect(emptyColor).toBe("#2a2a3a");
        });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// AccessibiliteAuditedAppsChart
// ─────────────────────────────────────────────────────────────────────────────

describe("AccessibiliteAuditedAppsChart", () => {
    describe("sans apps auditées", () => {
        it("affiche le message 'Aucune application'", () => {
            render(<AccessibiliteAuditedAppsChart data={[nonAuditedApp]} />);
            expect(screen.getByText(/Aucune application n a encore passé d audit/)).toBeInTheDocument();
        });

        it("affiche le texte secondaire d'attente", () => {
            render(<AccessibiliteAuditedAppsChart data={[]} />);
            expect(
                screen.getByText(/Les résultats apparaîtront ici une fois les audits réalisés/)
            ).toBeInTheDocument();
        });

        it("ne rend pas ECharts si aucune app auditée", () => {
            render(<AccessibiliteAuditedAppsChart data={[nonAuditedApp]} />);
            expect(screen.queryByTestId("echarts")).not.toBeInTheDocument();
        });
    });

    describe("avec apps auditées", () => {
        const appA = makeApp({ scoreAuditA11y: 90, applicationName: "App A", lettreA11y: "A" });
        const appB = makeApp({ scoreAuditA11y: 50, applicationName: "App B", lettreA11y: "D" });

        it("affiche le titre", () => {
            render(<AccessibiliteAuditedAppsChart data={[appA]} />);
            expect(screen.getByText("Résultats des audits par application")).toBeInTheDocument();
        });

        it("affiche le bon comptage dans le sous-titre", () => {
            render(<AccessibiliteAuditedAppsChart data={[appA, appB]} />);
            expect(screen.getByText(/2 applications auditées/)).toBeInTheDocument();
        });

        it("affiche le singulier pour une seule app", () => {
            render(<AccessibiliteAuditedAppsChart data={[appA]} />);
            expect(screen.getByText(/1 application auditée/)).toBeInTheDocument();
        });

        it("rend le composant ECharts", () => {
            render(<AccessibiliteAuditedAppsChart data={[appA]} />);
            expect(screen.getByTestId("echarts")).toBeInTheDocument();
        });

        it("trie les apps par score croissant", () => {
            render(<AccessibiliteAuditedAppsChart data={[appA, appB]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            const yAxisData: string[] = option.yAxis.data;
            expect(yAxisData[0]).toBe("App B"); // score 50, le plus bas en premier
            expect(yAxisData[1]).toBe("App A"); // score 90
        });

        it("exclut les apps avec score 0 ou null", () => {
            render(<AccessibiliteAuditedAppsChart data={[appA, nonAuditedApp, nullScoreApp]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.yAxis.data).not.toContain("App Non Auditée");
            expect(option.yAxis.data).not.toContain("App Null");
        });

        it("la hauteur du chart s'adapte au nombre d'apps", () => {
            const apps = Array.from({ length: 5 }, (_, i) =>
                makeApp({ scoreAuditA11y: 60 + i, applicationName: `App ${i}` })
            );
            render(<AccessibiliteAuditedAppsChart data={apps} />);
            const chart = screen.getByTestId("echarts");
            // 5 * 38 + 40 = 230px
            expect(chart.style.height).toBe("230px");
        });

        it("utilise la couleur de grade pour les barres", () => {
            render(<AccessibiliteAuditedAppsChart data={[appA]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            const barData = option.series[0].data;
            expect(barData[0].itemStyle.color).toBe("#1b5e20"); // Grade A
        });

        it("utilise sndi comme fallback si applicationName est absent", () => {
            const appSndi = makeApp({
                scoreAuditA11y: 70,
                applicationName: undefined as unknown as string,
                sndi: "SNDI-XYZ"
            });
            render(<AccessibiliteAuditedAppsChart data={[appSndi]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.yAxis.data).toContain("SNDI-XYZ");
        });

        it("utilise '—' si ni applicationName ni sndi", () => {
            const appNoName = makeApp({
                scoreAuditA11y: 70,
                applicationName: undefined as unknown as string,
                sndi: undefined as unknown as string
            });
            render(<AccessibiliteAuditedAppsChart data={[appNoName]} />);
            const option = JSON.parse(screen.getByTestId("echarts").dataset.option!);
            expect(option.yAxis.data).toContain("—");
        });
    });
});
