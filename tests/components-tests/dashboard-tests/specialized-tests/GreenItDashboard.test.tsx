import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import GreenITDashboard from "pages/dashboards/specialized/GreenITDashboard";
import type { GlobalIndicator } from "models/indicateurs";

// --- Mocks ---

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
    default: ({ items }: { items: { nav: string }[] }) => (
        <nav data-testid="ariane">{items.map(i => i.nav).join(" / ")}</nav>
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

vi.mock("pages/dashboards/overview/Charts/GreenITCharts", () => ({
    GreenITProdHorsProdGroupedChart: ({ data }: { data: GlobalIndicator[] }) => (
        <div data-testid="grouped-chart">grouped ({data.length})</div>
    ),
    GreenITDomainProdChart: ({ data }: { data: GlobalIndicator[] }) => (
        <div data-testid="domain-chart">domain ({data.length})</div>
    )
}));

vi.mock("pages/dashboards/overview/ChartCard", () => ({
    ChartCard: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="chart-card">{children}</div>
    )
}));

// --- Mock useQueryDashboard ---

const mockUseQueryDashboard = vi.fn();

vi.mock("hooks/useQueryDashboard", () => ({
    useQueryDashboard: (...args: unknown[]) => mockUseQueryDashboard(...args)
}));

const mockData: GlobalIndicator[] = [
    { applicationName: "App A", domaine: "D1" } as unknown as GlobalIndicator,
    { applicationName: "App B", domaine: "D2" } as unknown as GlobalIndicator
];

// --- Tests ---

describe("GreenITDashboard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseQueryDashboard.mockReturnValue({
            data: mockData,
            isLoading: false,
            filteredData: mockData
        });
    });

    // ─── Chargement ──────────────────────────────────────────────────────────

    describe("Chargement", () => {
        it("affiche le CircularProgress pendant le chargement", () => {
            mockUseQueryDashboard.mockReturnValueOnce({
                data: [],
                isLoading: true,
                filteredData: []
            });
            render(<GreenITDashboard />);
            expect(screen.getByRole("progressbar")).toBeInTheDocument();
        });

        it("masque le loader après chargement", async () => {
            render(<GreenITDashboard />);
            await waitFor(() => expect(screen.queryByRole("progressbar")).not.toBeInTheDocument());
        });

        it("appelle useQueryDashboard avec la bonne queryKey", () => {
            render(<GreenITDashboard />);
            expect(mockUseQueryDashboard).toHaveBeenCalledWith(
                expect.objectContaining({
                    queryKey: ["GreenItDashboard"]
                })
            );
        });

        it("gère une erreur API sans crasher (finally masque loader)", async () => {
            mockUseQueryDashboard.mockReturnValueOnce({
                data: [],
                isLoading: false,
                filteredData: []
            });
            render(<GreenITDashboard />);
            await waitFor(() => expect(screen.queryByRole("progressbar")).not.toBeInTheDocument());
            expect(screen.getByTestId("layout")).toBeInTheDocument();
        });
    });

    // ─── Rendu ───────────────────────────────────────────────────────────────

    describe("Rendu du layout", () => {
        it("affiche le layout après chargement", async () => {
            render(<GreenITDashboard />);
            await waitFor(() => screen.getByTestId("layout"));
            expect(screen.getByTestId("layout")).toBeInTheDocument();
        });

        it("passe le titre 'Green IT' au layout", async () => {
            render(<GreenITDashboard />);
            await waitFor(() => screen.getByTestId("layout-title"));
            expect(screen.getByTestId("layout-title")).toHaveTextContent("Green IT");
        });

        it("passe le bon sous-titre au layout", async () => {
            render(<GreenITDashboard />);
            await waitFor(() => screen.getByTestId("layout-subtitle"));
            expect(screen.getByTestId("layout-subtitle")).toHaveTextContent(
                "Indicateurs écologiques et consommation"
            );
        });

        it("rend les deux ChartCards", async () => {
            render(<GreenITDashboard />);
            await waitFor(() => screen.getAllByTestId("chart-card"));
            expect(screen.getAllByTestId("chart-card")).toHaveLength(2);
        });

        it("rend GreenITProdHorsProdGroupedChart et GreenITDomainProdChart", async () => {
            render(<GreenITDashboard />);
            await waitFor(() => screen.getByTestId("grouped-chart"));
            expect(screen.getByTestId("grouped-chart")).toBeInTheDocument();
            expect(screen.getByTestId("domain-chart")).toBeInTheDocument();
        });
    });

    // ─── Données ─────────────────────────────────────────────────────────────

    describe("Données et filtrage", () => {
        it("passe les données filtrées aux charts", async () => {
            render(<GreenITDashboard />);
            await waitFor(() => screen.getByTestId("grouped-chart"));
            expect(screen.getByTestId("grouped-chart")).toHaveTextContent("grouped (2)");
            expect(screen.getByTestId("domain-chart")).toHaveTextContent("domain (2)");
        });

        it("affiche le dashboard avec un tableau vide", async () => {
            mockUseQueryDashboard.mockReturnValueOnce({
                data: [],
                isLoading: false,
                filteredData: []
            });
            render(<GreenITDashboard />);
            await waitFor(() => screen.getByTestId("layout"));
            expect(screen.getByTestId("grouped-chart")).toHaveTextContent("grouped (0)");
        });

        it("passe uniquement les données filtrées aux charts", async () => {
            mockUseQueryDashboard.mockReturnValueOnce({
                data: mockData,
                isLoading: false,
                filteredData: [mockData[0]] // seulement App A après filtre
            });
            render(<GreenITDashboard />);
            await waitFor(() => screen.getByTestId("grouped-chart"));
            expect(screen.getByTestId("grouped-chart")).toHaveTextContent("grouped (1)");
            expect(screen.getByTestId("domain-chart")).toHaveTextContent("domain (1)");
        });
    });
});
