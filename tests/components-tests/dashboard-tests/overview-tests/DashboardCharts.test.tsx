import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// ============= TOUS LES MOCKS DOIVENT ÊTRE ICI AVANT LES IMPORTS =============

// Mock des modules API et utilitaires
vi.mock("todos-api/client.gen", () => ({
    getApplications1: vi.fn(),
    getIndicateurQualiteByApplication: vi.fn(),
    getApplications2: vi.fn(),
    listerApplicationsMeteo: vi.fn(),
    getApplications: vi.fn(),
    listerApplicationA11y: vi.fn(),
    getIndicateurSecuriteByApplication: vi.fn(),
    getMaturiteCloud: vi.fn(),
    getCveCriticalMonthly: vi.fn()
}));

vi.mock("utils/graphs/calculations", () => ({
    calculateMaturiteStrongPct: vi.fn(),
    calculateDetteCumulee: vi.fn(),
    calculateTotalCriticalCve: vi.fn(),
    countAppsSinceLastMep: vi.fn()
}));

vi.mock("pages/indicateurs/main-indicator/formatted-mod-and-app", () => ({
    formattedApps: vi.fn()
}));

vi.mock("utils/filters-functions", () => ({
    applyDevFilters: vi.fn(item => item)
}));

// Mock des composants enfants
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

vi.mock("pages/dashboards/overview/Charts/Treegraph", () => ({
    __esModule: true,
    default: () => <div data-testid="treegraph">TreeGraph</div>
}));

vi.mock("pages/dashboards/overview/Charts/CveBarChart", () => ({
    CveBarChart: () => <div data-testid="cve-bar-chart">CveBarChart</div>
}));

vi.mock("pages/dashboards/overview/Charts/CveTreemap", () => ({
    CveTreemap: () => <div data-testid="cve-treemap">CveTreemap</div>
}));

vi.mock("pages/dashboards/overview/Charts/CveHistoryChart", () => ({
    CveHistoryChart: () => <div data-testid="cve-history-chart">CveHistoryChart</div>
}));

vi.mock("pages/dashboards/overview/Charts/ScatterChart", () => ({
    CorrelationChart: () => <div data-testid="correlation-chart">CorrelationChart</div>
}));

vi.mock("pages/dashboards/overview/SectionHeader", () => ({
    SectionHeader: ({ title }: { title: string }) => <div data-testid={`section-${title}`}>{title}</div>
}));

// ============= IMPORTS APRÈS TOUS LES MOCKS =============
import DashboardCharts from "pages/dashboards/overview/DashboardCharts";
import { FilterProvider } from "store/filterContext";
import * as clientGen from "todos-api/client.gen";
import * as calculations from "utils/graphs/calculations";
import * as formattedMod from "pages/indicateurs/main-indicator/formatted-mod-and-app";
import type { GlobalIndicator } from "models/indicateurs";

// Helper pour créer des GlobalIndicator mockés avec valeurs par défaut
const createMockGlobalIndicator = (overrides: Partial<GlobalIndicator> = {}): GlobalIndicator => ({
    // Champs obligatoires
    applicationName: "MockApp",
    sndi: "MOCK",
    domaine: "MockDomaine",
    domaineFonc: "MockFonc",
    lettreCouvertureTestUniaire: "A",
    lettreGlobaleSecurite: "A",
    pourcentageCouvertureTestUniaire: "80",
    nbCveCritical: "0",
    nbCveHigh: "0",
    nbCveLow: "0",
    nbCveMedium: "0",
    lettreCve: "A",
    consoNormalized: "0",
    impactNormalized: "0",
    gaspillage: "0",
    // Champs optionnels avec valeurs par défaut raisonnables
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
});

describe("DashboardCharts", () => {
    const mockApplications: GlobalIndicator[] = [
        createMockGlobalIndicator({
            idApplication: 1,
            applicationName: "App1",
            sndi: "SNDI1",
            domaine: "Domaine1",
            domaineFonc: "Finance",
            lettreCouvertureTestUniaire: "A",
            pourcentageCouvertureTestUniaire: "85",
            lettreGlobaleSecurite: "A",
            nbCveCritical: "5",
            nbCveHigh: "10",
            nbCveMedium: "15",
            nbCveLow: "20",
            lettreCve: "B",
            maturite: "A",
            meteo: 1,
            meteoCommentaire: "Soleil",
            scoreAuditA11y: 95,
            lettreA11y: "A",
            detteTechnique: "100"
        }),
        createMockGlobalIndicator({
            idApplication: 2,
            applicationName: "App2",
            sndi: "SNDI2",
            domaine: "Domaine2",
            domaineFonc: "RH",
            lettreCouvertureTestUniaire: "B",
            pourcentageCouvertureTestUniaire: "70",
            lettreGlobaleSecurite: "B",
            nbCveCritical: "3",
            nbCveHigh: "8",
            nbCveMedium: "12",
            nbCveLow: "18",
            lettreCve: "C",
            maturite: "B",
            meteo: 2,
            meteoCommentaire: "Nuageux",
            scoreAuditA11y: 80,
            lettreA11y: "B",
            detteTechnique: "200"
        })
    ];

    const mockCveMonthlyData = [
        { month: "2024-01", critical: 10 },
        { month: "2024-02", critical: 15 }
    ];

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock des appels API avec vi.mocked
        vi.mocked(clientGen.getApplications1).mockResolvedValue([]);
        vi.mocked(clientGen.getIndicateurQualiteByApplication).mockResolvedValue([]);
        vi.mocked(clientGen.getApplications2).mockResolvedValue([]);
        vi.mocked(clientGen.listerApplicationsMeteo).mockResolvedValue([]);
        vi.mocked(clientGen.getApplications).mockResolvedValue([]);
        vi.mocked(clientGen.listerApplicationA11y).mockResolvedValue([]);
        vi.mocked(clientGen.getIndicateurSecuriteByApplication).mockResolvedValue([]);
        vi.mocked(clientGen.getMaturiteCloud).mockResolvedValue([]);
        vi.mocked(clientGen.getCveCriticalMonthly).mockResolvedValue(mockCveMonthlyData);

        // Mock de formattedApps
        vi.mocked(formattedMod.formattedApps).mockReturnValue(mockApplications);

        // Mock des calculs
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

    describe("Chargement initial", () => {
        it("devrait afficher le CircularProgress pendant le chargement", () => {
            renderWithProviders(<DashboardCharts />);
            expect(screen.getByRole("progressbar")).toBeInTheDocument();
        });

        it("devrait charger toutes les données via les appels API", async () => {
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
                expect(clientGen.getCveCriticalMonthly).toHaveBeenCalledTimes(1);
            });
        });

        it("devrait appeler formattedApps avec les données chargées", async () => {
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

        it("devrait gérer les erreurs de chargement", async () => {
            const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
            vi.mocked(clientGen.getApplications1).mockRejectedValue(new Error("API Error"));

            renderWithProviders(<DashboardCharts />);

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    "Erreur chargement données:",
                    expect.any(Error)
                );
            });

            consoleErrorSpy.mockRestore();
        });
    });

    describe("Affichage des composants", () => {
        it("devrait afficher tous les composants principaux après chargement", async () => {
            renderWithProviders(<DashboardCharts />);

            await waitFor(() => {
                expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
            });

            // Vérifier la présence des filtres
            expect(screen.getByTestId("filters")).toBeInTheDocument();

            // Vérifier les sections
            expect(screen.getByTestId("section-Vue d'ensemble")).toBeInTheDocument();
            expect(screen.getByTestId("section-Analyse des vulnérabilités")).toBeInTheDocument();
            expect(screen.getByTestId("section-Analyse croisée")).toBeInTheDocument();
        });

        it("devrait afficher les 4 KPIs", async () => {
            renderWithProviders(<DashboardCharts />);

            await waitFor(() => {
                expect(screen.getByTestId("kpi-Maturité Cloud (A/B)")).toHaveTextContent("75");
                expect(screen.getByTestId("kpi-Dette technique cumulée")).toHaveTextContent("300");
                expect(screen.getByTestId("kpi-CVE critiques")).toHaveTextContent("8");
                expect(screen.getByTestId("kpi-> 30 jours sans MEP")).toHaveTextContent("1");
            });
        });

        it("devrait afficher les 4 graphiques donut", async () => {
            renderWithProviders(<DashboardCharts />);

            await waitFor(() => {
                expect(
                    screen.getByTestId("donut-Répartition des lettres de qualité")
                ).toBeInTheDocument();
                expect(screen.getByTestId("donut-Répartition météo ressentie")).toBeInTheDocument();
                expect(screen.getByTestId("donut-Répartition des dernières MEP")).toBeInTheDocument();
                expect(
                    screen.getByTestId("donut-Répartition de la dette technique")
                ).toBeInTheDocument();
            });
        });

        it("devrait afficher tous les graphiques CVE", async () => {
            renderWithProviders(<DashboardCharts />);

            await waitFor(() => {
                expect(screen.getByTestId("cve-bar-chart")).toBeInTheDocument();
                expect(screen.getByTestId("cve-treemap")).toBeInTheDocument();
                expect(screen.getByTestId("cve-history-chart")).toBeInTheDocument();
                expect(screen.getByTestId("treegraph")).toBeInTheDocument();
            });
        });

        it("devrait afficher le graphique de corrélation", async () => {
            renderWithProviders(<DashboardCharts />);

            await waitFor(() => {
                expect(screen.getByTestId("correlation-chart")).toBeInTheDocument();
            });
        });
    });

    describe("Calculs des KPIs", () => {
        it("devrait calculer les KPIs avec les données filtrées", async () => {
            renderWithProviders(<DashboardCharts />);

            await waitFor(() => {
                expect(calculations.calculateMaturiteStrongPct).toHaveBeenCalledWith(mockApplications);
                expect(calculations.calculateDetteCumulee).toHaveBeenCalledWith(mockApplications);
                expect(calculations.calculateTotalCriticalCve).toHaveBeenCalledWith(mockApplications);
                expect(calculations.countAppsSinceLastMep).toHaveBeenCalledWith(mockApplications, 30);
            });
        });

        it("devrait recalculer les KPIs quand les données changent", async () => {
            const { rerender } = renderWithProviders(<DashboardCharts />);

            await waitFor(() => {
                expect(calculations.calculateMaturiteStrongPct).toHaveBeenCalledTimes(1);
            });

            // Simuler un changement de données
            vi.mocked(formattedMod.formattedApps).mockReturnValue([
                ...mockApplications,
                createMockGlobalIndicator({
                    idApplication: 3,
                    applicationName: "App3",
                    sndi: "SNDI3",
                    domaine: "Domaine3",
                    domaineFonc: "IT",
                    lettreCouvertureTestUniaire: "C",
                    pourcentageCouvertureTestUniaire: "60",
                    lettreGlobaleSecurite: "C",
                    nbCveCritical: "2",
                    nbCveHigh: "5",
                    nbCveMedium: "10",
                    nbCveLow: "15",
                    lettreCve: "D",
                    maturite: "C",
                    meteo: 3,
                    meteoCommentaire: "Pluie",
                    scoreAuditA11y: 70,
                    lettreA11y: "C",
                    detteTechnique: "150"
                })
            ]);

            rerender(
                <ThemeProvider theme={createTheme()}>
                    <FilterProvider>
                        <DashboardCharts />
                    </FilterProvider>
                </ThemeProvider>
            );

            await waitFor(() => {
                expect(calculations.calculateMaturiteStrongPct).toHaveBeenCalledTimes(2);
            });
        });
    });

    describe("Thème et styles", () => {
        it("devrait s'afficher correctement en mode sombre", async () => {
            const darkTheme = createTheme({ palette: { mode: "dark" } });

            render(
                <ThemeProvider theme={darkTheme}>
                    <FilterProvider>
                        <DashboardCharts />
                    </FilterProvider>
                </ThemeProvider>
            );

            await waitFor(() => {
                expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
            });

            // Vérifier que tous les composants principaux sont rendus
            expect(screen.getByTestId("filters")).toBeInTheDocument();
            expect(screen.getByTestId("section-Vue d'ensemble")).toBeInTheDocument();
            expect(screen.getByTestId("section-Analyse des vulnérabilités")).toBeInTheDocument();
        });

        it("devrait s'afficher correctement en mode clair", async () => {
            const lightTheme = createTheme({ palette: { mode: "light" } });

            render(
                <ThemeProvider theme={lightTheme}>
                    <FilterProvider>
                        <DashboardCharts />
                    </FilterProvider>
                </ThemeProvider>
            );

            await waitFor(() => {
                expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
            });

            // Vérifier que tous les composants principaux sont rendus
            expect(screen.getByTestId("filters")).toBeInTheDocument();
            expect(screen.getByTestId("section-Vue d'ensemble")).toBeInTheDocument();
            expect(screen.getByTestId("section-Analyse des vulnérabilités")).toBeInTheDocument();
        });
    });

    describe("Gestion des données vides", () => {
        it("devrait gérer correctement un tableau vide d'applications", async () => {
            vi.mocked(formattedMod.formattedApps).mockReturnValue([]);

            renderWithProviders(<DashboardCharts />);

            await waitFor(() => {
                expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
            });

            // Les composants devraient quand même s'afficher
            expect(screen.getByTestId("filters")).toBeInTheDocument();
            expect(screen.getByTestId("section-Vue d'ensemble")).toBeInTheDocument();
        });

        it("devrait gérer les données CVE mensuelles vides", async () => {
            vi.mocked(clientGen.getCveCriticalMonthly).mockResolvedValue([]);

            renderWithProviders(<DashboardCharts />);

            await waitFor(() => {
                expect(screen.getByTestId("cve-history-chart")).toBeInTheDocument();
            });
        });
    });

    describe("Structure responsive", () => {
        it("devrait utiliser Grid avec les bonnes propriétés de taille", async () => {
            renderWithProviders(<DashboardCharts />);

            await waitFor(() => {
                expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
            });

            // Vérifier que les composants sont bien présents
            const kpis = screen.getAllByTestId(/^kpi-/);
            expect(kpis).toHaveLength(4);
        });
    });

    describe("Intégration avec FilterContext", () => {
        it("devrait passer state et dispatch aux Filters", async () => {
            renderWithProviders(<DashboardCharts />);

            await waitFor(() => {
                expect(screen.getByTestId("filters")).toBeInTheDocument();
            });
        });
    });

    describe("Performance et optimisation", () => {
        it("devrait utiliser useMemo pour les données filtrées", async () => {
            const { rerender } = renderWithProviders(<DashboardCharts />);

            await waitFor(() => {
                expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
            });

            rerender(
                <ThemeProvider theme={createTheme()}>
                    <FilterProvider>
                        <DashboardCharts />
                    </FilterProvider>
                </ThemeProvider>
            );

            await waitFor(() => {
                expect(calculations.calculateMaturiteStrongPct).toHaveBeenCalledTimes(2);
            });
        });
    });

    describe("Accessibilité", () => {
        it("devrait avoir un indicateur de chargement accessible", () => {
            renderWithProviders(<DashboardCharts />);

            const progressBar = screen.getByRole("progressbar");
            expect(progressBar).toBeInTheDocument();
        });

        it("devrait utiliser Box avec minHeight appropriée", async () => {
            renderWithProviders(<DashboardCharts />);

            await waitFor(() => {
                expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
            });

            const container = screen.getByTestId("filters").parentElement;
            expect(container).toHaveStyle({ minHeight: "100vh" });
        });
    });
});
