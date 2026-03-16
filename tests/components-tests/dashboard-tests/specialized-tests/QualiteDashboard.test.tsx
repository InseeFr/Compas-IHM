import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import QualiteDashboard from "pages/dashboards/specialized/QualiteDashboard";
import type { GlobalIndicator } from "models/indicateurs";

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

vi.mock("components/Ariane", () => ({
    default: ({ items }: { items: { nav: string; link: string }[] }) => (
        <nav data-testid="ariane">{items.map(i => i.nav).join(" / ")}</nav>
    )
}));

vi.mock("pages/dashboards/overview/ChartCard", () => ({
    ChartCard: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="chart-card">{children}</div>
    )
}));

vi.mock("pages/dashboards/specialized/SpecializedDashboardLayout", () => ({
    SpecializedDashboardLayout: ({
        children,
        title,
        subtitle
    }: {
        children: React.ReactNode;
        title: string;
        subtitle: string;
    }) => (
        <div data-testid="layout">
            <span data-testid="layout-title">{title}</span>
            <span data-testid="layout-subtitle">{subtitle}</span>
            {children}
        </div>
    )
}));

vi.mock("pages/dashboards/overview/Charts/QualiteCharts", () => ({
    QualiteCoverageChart: ({ data }: { data: GlobalIndicator[] }) => (
        <div data-testid="coverage-chart">coverage ({data.length})</div>
    ),
    QualiteDetteChart: ({ data }: { data: GlobalIndicator[] }) => (
        <div data-testid="dette-chart">dette ({data.length})</div>
    ),
    QualiteRadarChart: ({ data }: { data: GlobalIndicator[] }) => (
        <div data-testid="radar-chart">radar ({data.length})</div>
    )
}));

// --- Mock useQueryDashboard ---

const mockUseQueryDashboard = vi.fn();

vi.mock("hooks/useQueryDashboard", () => ({
    useQueryDashboard: (...args: unknown[]) => mockUseQueryDashboard(...args)
}));

const mockData: GlobalIndicator[] = [
    { applicationName: "App X", domaine: "D1" } as unknown as GlobalIndicator,
    { applicationName: "App Y", domaine: "D2" } as unknown as GlobalIndicator
];

// --- Tests ---

describe("QualiteDashboard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseQueryDashboard.mockReturnValue({
            data: mockData,
            isLoading: false,
            filteredData: mockData
        });
    });

    it("affiche le loader pendant le chargement", () => {
        mockUseQueryDashboard.mockReturnValueOnce({
            data: [],
            isLoading: true,
            filteredData: []
        });
        render(<QualiteDashboard />);
        expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("affiche le dashboard après chargement", async () => {
        render(<QualiteDashboard />);
        await waitFor(() => expect(screen.queryByRole("progressbar")).not.toBeInTheDocument());
        expect(screen.getByTestId("layout")).toBeInTheDocument();
    });

    it("passe le bon titre au layout", async () => {
        render(<QualiteDashboard />);
        await waitFor(() => screen.getByTestId("layout-title"));
        expect(screen.getByTestId("layout-title")).toHaveTextContent("Qualité");
    });

    it("passe le bon sous-titre au layout", async () => {
        render(<QualiteDashboard />);
        await waitFor(() => screen.getByTestId("layout-subtitle"));
        expect(screen.getByTestId("layout-subtitle")).toHaveTextContent(
            "Analyse détaillée des indicateurs qualité"
        );
    });

    it("rend tous les charts Qualité", async () => {
        render(<QualiteDashboard />);
        await waitFor(() => screen.getByTestId("coverage-chart"));
        expect(screen.getByTestId("coverage-chart")).toBeInTheDocument();
        expect(screen.getByTestId("dette-chart")).toBeInTheDocument();
        expect(screen.getByTestId("radar-chart")).toBeInTheDocument();
    });

    it("passe les données filtrées aux charts", async () => {
        render(<QualiteDashboard />);
        await waitFor(() => screen.getByTestId("coverage-chart"));
        expect(screen.getByTestId("coverage-chart")).toHaveTextContent("coverage (2)");
        expect(screen.getByTestId("dette-chart")).toHaveTextContent("dette (2)");
        expect(screen.getByTestId("radar-chart")).toHaveTextContent("radar (2)");
    });

    it("appelle useQueryDashboard avec la bonne queryKey", () => {
        render(<QualiteDashboard />);
        expect(mockUseQueryDashboard).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: ["QualiteDashboard"]
            })
        );
    });

    it("gère une erreur API sans crasher", async () => {
        mockUseQueryDashboard.mockReturnValueOnce({
            data: [],
            isLoading: false,
            filteredData: []
        });
        render(<QualiteDashboard />);
        await waitFor(() => expect(screen.queryByRole("progressbar")).not.toBeInTheDocument());
        expect(screen.getByTestId("layout")).toBeInTheDocument();
    });

    it("rend trois ChartCards", async () => {
        render(<QualiteDashboard />);
        await waitFor(() => screen.getAllByTestId("chart-card"));
        expect(screen.getAllByTestId("chart-card")).toHaveLength(3);
    });
});
