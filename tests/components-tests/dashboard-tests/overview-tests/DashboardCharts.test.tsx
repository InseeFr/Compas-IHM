import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Mock des modules API et utilitaires
vi.mock("todos-api/client.gen", () => ({
    getApplications1: vi.fn(),
    getIndicateurQualiteByApplication: vi.fn(),
    getApplications2: vi.fn(),
    listerApplicationsMeteo: vi.fn(),
    getApplications: vi.fn(),
    listerApplicationA11y: vi.fn(),
    getIndicateurSecuriteByApplication: vi.fn(),
    getMaturiteCloud: vi.fn()
}));

vi.mock("utils/graphs/calculations", () => ({
    calculateMaturiteStrongPct: vi.fn(),
    calculateDetteCumulee: vi.fn(),
    calculateTotalCriticalCve: vi.fn(),
    countAppsSinceLastMep: vi.fn()
}));

vi.mock("utils/graphs/donutTransformers", () => ({
    transformQualiteData: vi.fn(),
    transformMeteoData: vi.fn(),
    transformMepData: vi.fn(),
    transformDetteData: vi.fn()
}));

vi.mock("pages/indicateurs/main-indicator/formatted-mod-and-app", () => ({
    formattedApps: vi.fn()
}));

vi.mock("@tanstack/react-router", async () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Link: ({ to, children, ...rest }: any) => (
        <a href={to} {...rest}>
            {children}
        </a>
    )
}));

vi.mock("utils/filters-functions", () => ({
    applyDevFilters: vi.fn(() => true)
}));

vi.mock("components/Ariane", () => ({
    default: ({ items }: { items: { nav: string }[] }) => (
        <nav data-testid="ariane">{items.map(i => i.nav).join(" / ")}</nav>
    )
}));

vi.mock("pages/Filters", () => ({
    Filters: () => <div data-testid="filters">Filters</div>
}));

vi.mock("pages/dashboards/overview/KpiTile", () => ({
    KpiTile: ({ label, value }: { label: string; value: number }) => (
        <div data-testid={`kpi-${label}`}>{value}</div>
    )
}));

vi.mock("pages/dashboards/overview/ChartCard", () => ({
    ChartCard: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="chart-card">{children}</div>
    )
}));

vi.mock("pages/dashboards/overview/Charts/GenericDonut", () => ({
    GenericDonut: ({ title }: { title: string }) => <div data-testid={`donut-${title}`}>{title}</div>
}));

vi.mock("pages/dashboards/overview/SectionHeader", () => ({
    SectionHeader: ({ title }: { title: string }) => <div data-testid={`section-${title}`}>{title}</div>
}));

vi.mock("pages/dashboards/overview/SpecializedDashboardLinks", () => ({
    SpecializedDashboardLinks: () => (
        <div data-testid="specialized-dashboard-links">SpecializedDashboardLinks</div>
    )
}));

// ============= IMPORTS APRÈS TOUS LES MOCKS =============
import DashboardCharts from "pages/dashboards/overview/DashboardCharts";
import { FilterProvider } from "store/filterContext";
import * as clientGen from "todos-api/client.gen";
import * as calculations from "utils/graphs/calculations";
import * as formattedMod from "pages/indicateurs/main-indicator/formatted-mod-and-app";
import type { GlobalIndicator } from "models/indicateurs";

// Helper pour créer des GlobalIndicator mockés
const createMockGlobalIndicator = (overrides: Partial<GlobalIndicator> = {}): GlobalIndicator =>
    ({
        applicationName: "MockApp",
        sndi: "MOCK",
        domaine: "MockDomaine",
        domaineFonc: "MockFonc",
        lettreCouvertureTestUnitaire: "A",
        lettreGlobaleSecurite: "A",
        pourcentageCouvertureTestUnitaire: "80",
        nbCveCritical: "0",
        nbCveHigh: "0",
        nbCveLow: "0",
        nbCveMedium: "0",
        lettreCve: "A",
        consoNormalized: "0",
        impactNormalized: "0",
        gaspillage: "0",
        idApplication: 0,
        lettreFiabilite: "A",
        lettreDetteTechnique: "A",
        delaiVmNonMiseAjour: "0",
        nbVmNonMaj: "0",
        grade: "A",
        isModule: false,
        parentApplication: undefined,
        lettreContributorCount: "A",
        lettreDeploymentCount: "A",
        lettreDistanceCount: "A",
        distanceCount: "0",
        nbDeploymentCount: "0",
        nbContributorCount: "0",
        meteo: 1,
        meteoCommentaire: "",
        dateMeteoCommentaire: "",
        declarationA11y: false,
        dateDeclarationA11y: "",
        conso: "0",
        lettreGreen: "A",
        ramAllocated: "0",
        ramMaxi: "0",
        diskAllocated: "0",
        diskUsed: "0",
        cpuAllocated: "0",
        cpuMaxi: "0",
        nbVm: "0",
        ramAllocatedProd: "0",
        ramMaxiProd: "0",
        diskAllocatedProd: "0",
        diskUsedProd: "0",
        cpuAllocatedProd: "0",
        cpuMaxiProd: "0",
        nbVmProd: "0",
        consoProd: "0",
        lettreA11y: "A",
        scoreAuditA11y: 100,
        lettreQualiteGenerale: "A",
        lettreDevopsGenerale: "A",
        detteTechnique: "0",
        maturite: "A",
        robustesse: "A",
        scoreBenefice: "0",
        scoreComplexite: "0",
        scoreOrga: "0",
        scoreTechnique: "0",
        progressionDeploy: "0",
        progressionArchi: "0",
        progressionTechnos: "0",
        progressionCloud: "0",
        progressionDevops: "0",
        progressionMateqip: "0",
        ...overrides
    }) as unknown as GlobalIndicator;

describe("DashboardCharts", () => {
    const mockApplications: GlobalIndicator[] = [
        createMockGlobalIndicator({ idApplication: 1, applicationName: "App1", sndi: "SNDI1" }),
        createMockGlobalIndicator({ idApplication: 2, applicationName: "App2", sndi: "SNDI2" })
    ];

    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(clientGen.getApplications1).mockResolvedValue([]);
        vi.mocked(clientGen.getIndicateurQualiteByApplication).mockResolvedValue([]);
        vi.mocked(clientGen.getApplications2).mockResolvedValue([]);
        vi.mocked(clientGen.listerApplicationsMeteo).mockResolvedValue([]);
        vi.mocked(clientGen.getApplications).mockResolvedValue([]);
        vi.mocked(clientGen.listerApplicationA11y).mockResolvedValue([]);
        vi.mocked(clientGen.getIndicateurSecuriteByApplication).mockResolvedValue([]);
        vi.mocked(clientGen.getMaturiteCloud).mockResolvedValue([]);

        vi.mocked(formattedMod.formattedApps).mockReturnValue(mockApplications);

        vi.mocked(calculations.calculateMaturiteStrongPct).mockReturnValue("75");
        vi.mocked(calculations.calculateDetteCumulee).mockReturnValue("300");
        vi.mocked(calculations.calculateTotalCriticalCve).mockReturnValue(8);
        vi.mocked(calculations.countAppsSinceLastMep).mockReturnValue(1);
    });

    const renderWithProviders = (component: React.ReactElement) => {
        const theme = createTheme();
        return render(
            <ThemeProvider theme={theme}>
                <FilterProvider>{component}</FilterProvider>
            </ThemeProvider>
        );
    };

    // ─── Chargement ──────────────────────────────────────────────────────────

    describe("Chargement initial", () => {
        it("affiche le CircularProgress pendant le chargement", () => {
            renderWithProviders(<DashboardCharts />);
            expect(screen.getByRole("progressbar")).toBeInTheDocument();
        });

        it("charge les données via les 8 appels API", async () => {
            renderWithProviders(<DashboardCharts />);
            await waitFor(() => {
                expect(clientGen.getApplications1).toHaveBeenCalledTimes(1);
                expect(clientGen.getIndicateurQualiteByApplication).toHaveBeenCalledTimes(1);
                expect(clientGen.getApplications2).toHaveBeenCalledTimes(1);
                expect(clientGen.listerApplicationsMeteo).toHaveBeenCalledTimes(1);
                expect(clientGen.getApplications).toHaveBeenCalledTimes(1);
                expect(clientGen.listerApplicationA11y).toHaveBeenCalledTimes(1);
                expect(clientGen.getIndicateurSecuriteByApplication).toHaveBeenCalledTimes(1);
                expect(clientGen.getMaturiteCloud).toHaveBeenCalledTimes(1);
            });
        });

        it("appelle formattedApps avec les données chargées", async () => {
            renderWithProviders(<DashboardCharts />);
            await waitFor(() => {
                expect(formattedMod.formattedApps).toHaveBeenCalledWith({
                    apps: [],
                    qualiteAppData: [],
                    devopsAppData: [],
                    meteoData: [],
                    consoAppData: [],
                    a11yDataApps: [],
                    securiteApps: [],
                    maturiteCloudApps: []
                });
            });
        });

        it("gère les erreurs API (finally masque le loader)", async () => {
            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
            vi.mocked(clientGen.getApplications1).mockRejectedValue(new Error("API Error"));

            renderWithProviders(<DashboardCharts />);

            await waitFor(() =>
                expect(consoleSpy).toHaveBeenCalledWith("Erreur chargement données:", expect.any(Error))
            );
            expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
            consoleSpy.mockRestore();
        });
    });

    // ─── Rendu des composants ────────────────────────────────────────────────

    describe("Affichage des composants", () => {
        it("affiche le fil d'Ariane après chargement", async () => {
            renderWithProviders(<DashboardCharts />);
            await waitFor(() => screen.getByTestId("ariane"));
            expect(screen.getByTestId("ariane")).toHaveTextContent("Vue d'ensemble");
        });

        it("affiche les Filters", async () => {
            renderWithProviders(<DashboardCharts />);
            await waitFor(() => expect(screen.queryByRole("progressbar")).not.toBeInTheDocument());
            expect(screen.getByTestId("filters")).toBeInTheDocument();
        });

        it("affiche uniquement la section 'Vue d'ensemble'", async () => {
            renderWithProviders(<DashboardCharts />);
            await waitFor(() => screen.getByTestId("section-Vue d'ensemble"));
            expect(screen.getByTestId("section-Vue d'ensemble")).toBeInTheDocument();
            // Les sections CVE/corrélation ont été supprimées
            expect(screen.queryByTestId("section-Analyse des vulnérabilités")).not.toBeInTheDocument();
            expect(screen.queryByTestId("section-Analyse croisée")).not.toBeInTheDocument();
        });

        it("affiche le composant SpecializedDashboardLinks", async () => {
            renderWithProviders(<DashboardCharts />);
            await waitFor(() => screen.getByTestId("specialized-dashboard-links"));
            expect(screen.getByTestId("specialized-dashboard-links")).toBeInTheDocument();
        });

        it("n'affiche plus les charts CVE (supprimés)", async () => {
            renderWithProviders(<DashboardCharts />);
            await waitFor(() => expect(screen.queryByRole("progressbar")).not.toBeInTheDocument());
            expect(screen.queryByTestId("cve-bar-chart")).not.toBeInTheDocument();
            expect(screen.queryByTestId("cve-treemap")).not.toBeInTheDocument();
            expect(screen.queryByTestId("cve-history-chart")).not.toBeInTheDocument();
            expect(screen.queryByTestId("correlation-chart")).not.toBeInTheDocument();
        });
    });

    // ─── KPIs ────────────────────────────────────────────────────────────────

    describe("KPIs", () => {
        it("affiche les 4 KPIs avec les bonnes valeurs", async () => {
            renderWithProviders(<DashboardCharts />);
            await waitFor(() => screen.getByTestId("kpi-Maturité Cloud (A/B)"));
            expect(screen.getByTestId("kpi-Maturité Cloud (A/B)")).toHaveTextContent("75");
            expect(screen.getByTestId("kpi-Dette technique cumulée")).toHaveTextContent("300");
            expect(screen.getByTestId("kpi-CVE critiques")).toHaveTextContent("8");
            expect(screen.getByTestId("kpi-> 30 jours sans MEP")).toHaveTextContent("1");
        });

        it("calcule les KPIs avec les données filtrées", async () => {
            renderWithProviders(<DashboardCharts />);
            await waitFor(() =>
                expect(calculations.calculateMaturiteStrongPct).toHaveBeenCalledWith(mockApplications)
            );
            expect(calculations.calculateDetteCumulee).toHaveBeenCalledWith(mockApplications);
            expect(calculations.calculateTotalCriticalCve).toHaveBeenCalledWith(mockApplications);
            expect(calculations.countAppsSinceLastMep).toHaveBeenCalledWith(mockApplications, 30);
        });
    });

    // ─── Donuts ──────────────────────────────────────────────────────────────

    describe("Graphiques donut", () => {
        it("affiche les 4 donuts", async () => {
            renderWithProviders(<DashboardCharts />);
            await waitFor(() => screen.getByTestId("donut-Répartition des lettres de qualité"));
            expect(screen.getByTestId("donut-Répartition des lettres de qualité")).toBeInTheDocument();
            expect(screen.getByTestId("donut-Répartition météo ressentie")).toBeInTheDocument();
            expect(screen.getByTestId("donut-Répartition des dernières MEP")).toBeInTheDocument();
            expect(screen.getByTestId("donut-Répartition de la dette technique")).toBeInTheDocument();
        });
    });

    // ─── Thème ───────────────────────────────────────────────────────────────

    describe("Thème", () => {
        it("s'affiche en mode sombre sans erreur", async () => {
            render(
                <ThemeProvider theme={createTheme({ palette: { mode: "dark" } })}>
                    <FilterProvider>
                        <DashboardCharts />
                    </FilterProvider>
                </ThemeProvider>
            );
            await waitFor(() => expect(screen.queryByRole("progressbar")).not.toBeInTheDocument());
            expect(screen.getByTestId("filters")).toBeInTheDocument();
        });

        it("s'affiche en mode clair sans erreur", async () => {
            render(
                <ThemeProvider theme={createTheme({ palette: { mode: "light" } })}>
                    <FilterProvider>
                        <DashboardCharts />
                    </FilterProvider>
                </ThemeProvider>
            );
            await waitFor(() => expect(screen.queryByRole("progressbar")).not.toBeInTheDocument());
            expect(screen.getByTestId("filters")).toBeInTheDocument();
        });
    });

    // ─── Données vides ───────────────────────────────────────────────────────

    describe("Gestion des données vides", () => {
        it("affiche quand même le dashboard avec un tableau vide", async () => {
            vi.mocked(formattedMod.formattedApps).mockReturnValue([]);
            renderWithProviders(<DashboardCharts />);
            await waitFor(() => expect(screen.queryByRole("progressbar")).not.toBeInTheDocument());
            expect(screen.getByTestId("filters")).toBeInTheDocument();
            expect(screen.getByTestId("section-Vue d'ensemble")).toBeInTheDocument();
        });
    });

    // ─── Accessibilité ───────────────────────────────────────────────────────

    describe("Accessibilité", () => {
        it("le loader est accessible via role progressbar", () => {
            renderWithProviders(<DashboardCharts />);
            expect(screen.getByRole("progressbar")).toBeInTheDocument();
        });

        it("le conteneur principal a minHeight 100vh", async () => {
            renderWithProviders(<DashboardCharts />);
            await waitFor(() => expect(screen.queryByRole("progressbar")).not.toBeInTheDocument());
            const container = screen.getByTestId("filters").parentElement;
            expect(container).toHaveStyle({ minHeight: "100vh" });
        });

        it("affiche 4 KPIs en tout", async () => {
            renderWithProviders(<DashboardCharts />);
            await waitFor(() => screen.getAllByTestId(/^kpi-/));
            expect(screen.getAllByTestId(/^kpi-/)).toHaveLength(4);
        });
    });
});
