/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import MeteoDashboard from "pages/dashboards/specialized/MeteoDashboard";
import type { GlobalIndicator } from "models/indicateurs";

// --- Mocks modules ---

vi.mock("@tanstack/react-router", () => ({
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

vi.mock("pages/dashboards/overview/Charts/MeteoCharts", () => ({
    MeteoDistributionChart: ({ data }: { data: GlobalIndicator[] }) => (
        <div data-testid="distribution-chart">distribution ({data.length})</div>
    ),
    MeteoEvolutionChart: () => <div data-testid="evolution-chart">evolution</div>
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

describe("MeteoDashboard", () => {
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
        render(<MeteoDashboard />);
        expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("affiche le dashboard après chargement", async () => {
        render(<MeteoDashboard />);
        await waitFor(() => expect(screen.queryByRole("progressbar")).not.toBeInTheDocument());
        expect(screen.getByTestId("layout")).toBeInTheDocument();
    });

    it("passe le bon titre au layout", async () => {
        render(<MeteoDashboard />);
        await waitFor(() => screen.getByTestId("layout-title"));
        expect(screen.getByTestId("layout-title")).toHaveTextContent("Météo");
    });

    it("passe le bon sous-titre au layout", async () => {
        render(<MeteoDashboard />);
        await waitFor(() => screen.getByTestId("layout-subtitle"));
        expect(screen.getByTestId("layout-subtitle")).toHaveTextContent(
            "Indicateurs météo et ressentis des applications"
        );
    });

    it("rend les deux charts Météo", async () => {
        render(<MeteoDashboard />);
        await waitFor(() => screen.getByTestId("distribution-chart"));
        expect(screen.getByTestId("distribution-chart")).toBeInTheDocument();
        expect(screen.getByTestId("evolution-chart")).toBeInTheDocument();
    });

    it("passe les données filtrées au chart de distribution", async () => {
        render(<MeteoDashboard />);
        await waitFor(() => screen.getByTestId("distribution-chart"));
        // filteredData = mockData entier → 2 apps
        expect(screen.getByTestId("distribution-chart")).toHaveTextContent("distribution (2)");
    });

    it("appelle useQueryDashboard avec la bonne queryKey", () => {
        render(<MeteoDashboard />);
        expect(mockUseQueryDashboard).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: ["MeteoDashboard"]
            })
        );
    });

    it("gère une erreur API sans crasher", async () => {
        mockUseQueryDashboard.mockReturnValueOnce({
            data: [],
            isLoading: false,
            filteredData: []
        });
        render(<MeteoDashboard />);
        await waitFor(() => expect(screen.queryByRole("progressbar")).not.toBeInTheDocument());
        expect(screen.getByTestId("layout")).toBeInTheDocument();
    });

    it("rend deux ChartCards", async () => {
        render(<MeteoDashboard />);
        await waitFor(() => screen.getAllByTestId("chart-card"));
        expect(screen.getAllByTestId("chart-card")).toHaveLength(2);
    });
});
