import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@tanstack/react-router", () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Link: ({ to, children, ...rest }: any) => (
        <a href={to} {...rest}>
            {children}
        </a>
    ),
    useRouter: vi.fn(),
    useNavigate: vi.fn(() => vi.fn()),
    useLocation: vi.fn(() => ({ pathname: "/" })),
    useParams: vi.fn(() => ({})),
    useSearch: vi.fn(() => ({}))
}));

vi.mock("store/tendance-context", () => ({
    useTendanceContext: () => ({
        stateTendance: {
            dateDebut: "01/05/2026",
            dateFin: "02/06/2026"
        },
        dispatchTendance: vi.fn()
    })
}));
vi.mock("components/indicators/TendanceForm", () => ({
    TendancePeriodeForm: () => <div data-testid="tendance-form" />
}));

vi.mock("todos-api/client.gen", () => ({
    getApplications1: vi.fn(),
    getIndicateurQualiteByApplicationByDate: vi.fn(),
    getApplications2: vi.fn(),
    listerApplicationsMeteo: vi.fn(),
    getApplications: vi.fn(),
    listerApplicationA11y: vi.fn(),
    getIndicateurSecuriteByApplication: vi.fn(),
    getMaturiteCloud: vi.fn(),
    getCveCriticalMonthly: vi.fn()
}));

vi.mock("pages/indicateurs/main-indicator/formatted-mod-and-app", () => ({
    formattedApps: vi.fn()
}));

vi.mock("hooks/useQueryDashboard", () => ({
    useQueryDashboard: vi.fn()
}));

vi.mock("pages/dashboards/overview/ChartCard", () => ({
    ChartCard: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="chart-card">{children}</div>
    )
}));

vi.mock("pages/dashboards/specialized/SpecializedDashboardLayout", () => ({
    SpecializedDashboardLayout: ({ children, title }: { children: React.ReactNode; title: string }) => (
        <div data-testid="specialized-layout">
            <h1>{title}</h1>
            {children}
        </div>
    )
}));

vi.mock("pages/dashboards/overview/Charts/CveBarChart", () => ({
    CveBarChart: () => <div data-testid="cve-bar-chart" />
}));

vi.mock("pages/dashboards/overview/Charts/CveTreemap", () => ({
    CveTreemap: () => <div data-testid="cve-treemap" />
}));

vi.mock("pages/dashboards/overview/Charts/CveHistoryChart", () => ({
    CveHistoryChart: () => <div data-testid="cve-history-chart" />
}));

vi.mock("pages/dashboards/overview/Charts/Treegraph", () => ({
    default: () => <div data-testid="tree-graph" />
}));

import { useQueryDashboard } from "hooks/useQueryDashboard";
import { formattedApps } from "pages/indicateurs/main-indicator/formatted-mod-and-app";
import * as api from "todos-api/client.gen";
import SecuriteDashboard from "pages/dashboards/specialized/SecuriteDashboard";
import type { GlobalIndicator } from "models/indicateurs";

const mockApps: api.Application[] = [{ idApplication: 1, appName: "Application 1" }];

const mockCveMonthly = [
    { month: "2024-01", critical: 5 },
    { month: "2024-02", critical: 3 }
];

const mockFormattedApps: GlobalIndicator[] = [
    {
        idApplication: 1,
        applicationName: "Application 1",
        nbCveLow: "5",
        nbCveCritical: "2",
        sndi: "",
        domaine: "",
        domaineFonc: "",
        lettreCouvertureTestUnitaire: "",
        lettreGlobaleSecurite: "",
        pourcentageCouvertureTestUniaire: "",
        nbCveHigh: "",
        nbCveMedium: "",
        lettreCve: "",
        consoNormalized: "",
        impactNormalized: "",
        gaspillage: ""
    }
];

const setupApiMocks = () => {
    vi.mocked(api.getApplications1).mockResolvedValue(mockApps);
    vi.mocked(api.getIndicateurQualiteByApplicationByDate).mockResolvedValue([]);
    vi.mocked(api.getApplications2).mockResolvedValue([]);
    vi.mocked(api.listerApplicationsMeteo).mockResolvedValue([]);
    vi.mocked(api.getApplications).mockResolvedValue([]);
    vi.mocked(api.listerApplicationA11y).mockResolvedValue([]);
    vi.mocked(api.getIndicateurSecuriteByApplication).mockResolvedValue([]);
    vi.mocked(api.getMaturiteCloud).mockResolvedValue([]);
    vi.mocked(api.getCveCriticalMonthly).mockResolvedValue(mockCveMonthly);
    vi.mocked(formattedApps).mockReturnValue(mockFormattedApps);
};

describe("SecuriteDashboard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setupApiMocks();
    });

    describe("État de chargement", () => {
        it("affiche un CircularProgress quand isLoading est true", () => {
            vi.mocked(useQueryDashboard).mockReturnValue({
                data: [],
                isLoading: true,
                filteredData: []
            });

            render(<SecuriteDashboard />);

            expect(screen.getByRole("progressbar")).toBeInTheDocument();
        });

        it("n'affiche pas le layout principal pendant le chargement", () => {
            vi.mocked(useQueryDashboard).mockReturnValue({
                data: [],
                isLoading: true,
                filteredData: []
            });

            render(<SecuriteDashboard />);

            expect(screen.queryByTestId("specialized-layout")).not.toBeInTheDocument();
        });
    });

    describe("Rendu principal (données chargées)", () => {
        beforeEach(() => {
            vi.mocked(useQueryDashboard).mockReturnValue({
                data: mockFormattedApps,
                isLoading: false,
                filteredData: mockFormattedApps
            });
        });

        it("affiche le SpecializedDashboardLayout avec le bon titre", () => {
            render(<SecuriteDashboard />);

            expect(screen.getByTestId("specialized-layout")).toBeInTheDocument();
            expect(screen.getByText("Sécurité")).toBeInTheDocument();
        });

        it("affiche les 4 graphiques", () => {
            render(<SecuriteDashboard />);

            expect(screen.getByTestId("cve-bar-chart")).toBeInTheDocument();
            expect(screen.getByTestId("cve-treemap")).toBeInTheDocument();
            expect(screen.getByTestId("cve-history-chart")).toBeInTheDocument();
            expect(screen.getByTestId("tree-graph")).toBeInTheDocument();
        });

        it("affiche 4 ChartCard", () => {
            render(<SecuriteDashboard />);

            expect(screen.getAllByTestId("chart-card")).toHaveLength(4);
        });
    });

    describe("Appels API via fetchData", () => {
        it("appelle useQueryDashboard avec la bonne queryKey", () => {
            vi.mocked(useQueryDashboard).mockReturnValue({
                data: [],
                isLoading: false,
                filteredData: []
            });

            render(<SecuriteDashboard />);

            expect(useQueryDashboard).toHaveBeenCalledWith(
                expect.objectContaining({ queryKey: ["SecuriteDashboard"] })
            );
        });

        it("fetchData appelle les 9 APIs en parallèle", async () => {
            let capturedFetchData: (() => Promise<unknown>) | undefined;

            vi.mocked(useQueryDashboard).mockImplementation(({ fetchData }) => {
                capturedFetchData = fetchData;
                return { data: [], isLoading: false, filteredData: [] };
            });

            render(<SecuriteDashboard />);

            expect(capturedFetchData).toBeDefined();
            await capturedFetchData!();

            expect(api.getApplications1).toHaveBeenCalledTimes(1);
            expect(api.getIndicateurQualiteByApplicationByDate).toHaveBeenCalledTimes(1);
            expect(api.getApplications2).toHaveBeenCalledTimes(1);
            expect(api.listerApplicationsMeteo).toHaveBeenCalledTimes(1);
            expect(api.getApplications).toHaveBeenCalledTimes(1);
            expect(api.listerApplicationA11y).toHaveBeenCalledTimes(1);
            expect(api.getIndicateurSecuriteByApplication).toHaveBeenCalledTimes(1);
            expect(api.getMaturiteCloud).toHaveBeenCalledTimes(1);
            expect(api.getCveCriticalMonthly).toHaveBeenCalledTimes(1);
        });

        it("fetchData retourne les applications formatées", async () => {
            let capturedFetchData: (() => Promise<unknown>) | undefined;

            vi.mocked(useQueryDashboard).mockImplementation(({ fetchData }) => {
                capturedFetchData = fetchData;
                return { data: [], isLoading: false, filteredData: [] };
            });

            render(<SecuriteDashboard />);

            const result = await capturedFetchData!();
            expect(result).toEqual(mockFormattedApps);
        });

        it("fetchData appelle formattedApps avec les bons paramètres", async () => {
            let capturedFetchData: (() => Promise<unknown>) | undefined;

            vi.mocked(useQueryDashboard).mockImplementation(({ fetchData }) => {
                capturedFetchData = fetchData;
                return { data: [], isLoading: false, filteredData: [] };
            });

            render(<SecuriteDashboard />);
            await capturedFetchData!();

            expect(formattedApps).toHaveBeenCalledWith(
                expect.objectContaining({
                    apps: mockApps,
                    securiteApps: []
                })
            );
        });
    });

    describe("Gestion des erreurs API", () => {
        it("fetchData retourne undefined si une API échoue", async () => {
            vi.mocked(api.getCveCriticalMonthly).mockRejectedValue(new Error("API error"));

            let capturedFetchData: (() => Promise<unknown>) | undefined;

            vi.mocked(useQueryDashboard).mockImplementation(({ fetchData }) => {
                capturedFetchData = fetchData;
                return { data: [], isLoading: false, filteredData: [] };
            });

            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

            render(<SecuriteDashboard />);

            const result = await capturedFetchData!();
            expect(result).toBeUndefined();
            expect(consoleSpy).toHaveBeenCalledWith(
                "Erreur chargement données sécurité:",
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });
    });
});
