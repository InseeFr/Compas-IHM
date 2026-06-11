import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { SpecializedDashboardLinks } from "pages/dashboards/overview/SpecializedDashboardLinks";

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

vi.mock("@mui/material", async importOriginal => {
    const actual = await importOriginal<typeof import("@mui/material")>();
    return {
        ...actual,
        useTheme: vi.fn(() => ({
            palette: {
                mode: "light",
                primary: { main: "#1976d2", dark: "#115293" },
                success: { main: "#2e7d32", dark: "#1b5e20" },
                error: { main: "#d32f2f" },
                info: { main: "#0288d1", dark: "#01579b" },
                background: { paper: "#fff", default: "#f5f5f5" },
                divider: "#e0e0e0",
                text: { secondary: "#666" }
            },
            shadows: Array(25).fill("none")
        }))
    };
});

vi.mock("pages/dashboards/overview/ChartCard", () => ({
    ChartCard: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="chart-card">{children}</div>
    )
}));

// --- Tests ---

describe("SpecializedDashboardLinks", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Rendu général", () => {
        it("affiche le titre 'Explorer par thème'", () => {
            render(<SpecializedDashboardLinks />);
            expect(screen.getByText("Explorer par thème")).toBeInTheDocument();
        });

        it("affiche 5 cartes de liens", () => {
            render(<SpecializedDashboardLinks />);
            expect(screen.getAllByText("Explorer les détails")).toHaveLength(5);
        });

        it("est enveloppé dans un ChartCard", () => {
            render(<SpecializedDashboardLinks />);
            expect(screen.getByTestId("chart-card")).toBeInTheDocument();
        });
    });

    describe("Contenu des cartes", () => {
        it("affiche la carte Qualité avec le bon titre et la bonne description", () => {
            render(<SpecializedDashboardLinks />);
            expect(screen.getByText("Qualité")).toBeInTheDocument();
            expect(screen.getByText("Analyse détaillée des indicateurs qualité")).toBeInTheDocument();
        });

        it("affiche la carte Sécurité avec le bon titre et la bonne description", () => {
            render(<SpecializedDashboardLinks />);
            expect(screen.getByText("Sécurité")).toBeInTheDocument();
            expect(
                screen.getByText("Suivi des vulnérabilités CVE, analyses et tendances")
            ).toBeInTheDocument();
        });

        it("affiche la carte Météo avec le bon titre et la bonne description", () => {
            render(<SpecializedDashboardLinks />);
            expect(screen.getByText("Météo")).toBeInTheDocument();
            expect(
                screen.getByText("Indicateurs météo et ressentis des applications")
            ).toBeInTheDocument();
        });

        it("affiche la carte Green IT avec le bon titre et la bonne description", () => {
            render(<SpecializedDashboardLinks />);
            expect(screen.getByText("Green IT")).toBeInTheDocument();
            expect(
                screen.getByText("Indicateurs écologiques et consommation énergétique")
            ).toBeInTheDocument();
        });

        it("affiche la carte Accessibilité avec le bon titre et la bonne description", () => {
            render(<SpecializedDashboardLinks />);
            expect(screen.getByText("Accessibilité")).toBeInTheDocument();
            expect(screen.getByText("Conformité et indicateurs d'accessibilité")).toBeInTheDocument();
        });
    });

    describe("Liens de navigation", () => {
        it("la carte Qualité pointe vers /dashboard/qualite", () => {
            render(<SpecializedDashboardLinks />);
            expect(screen.getByRole("link", { name: /qualité/i })).toHaveAttribute(
                "href",
                "/dashboard/qualite"
            );
        });

        it("la carte Sécurité pointe vers /dashboard/securite", () => {
            render(<SpecializedDashboardLinks />);
            expect(screen.getByRole("link", { name: /sécurité/i })).toHaveAttribute(
                "href",
                "/dashboard/securite"
            );
        });

        it("la carte Météo pointe vers /dashboard/meteo", () => {
            render(<SpecializedDashboardLinks />);
            expect(screen.getByRole("link", { name: /météo/i })).toHaveAttribute(
                "href",
                "/dashboard/meteo"
            );
        });

        it("la carte Green IT pointe vers /dashboard/greenit", () => {
            render(<SpecializedDashboardLinks />);
            expect(screen.getByRole("link", { name: /green it/i })).toHaveAttribute(
                "href",
                "/dashboard/greenit"
            );
        });

        it("la carte Accessibilité pointe vers /dashboard/accessibilite", () => {
            render(<SpecializedDashboardLinks />);
            expect(screen.getByRole("link", { name: /accessibilité/i })).toHaveAttribute(
                "href",
                "/dashboard/accessibilite"
            );
        });
    });

    describe("Thème sombre", () => {
        it("s'affiche correctement en mode dark", async () => {
            const { useTheme } = await import("@mui/material");
            vi.mocked(useTheme).mockReturnValue({
                palette: {
                    mode: "dark",
                    primary: { main: "#90caf9", dark: "#42a5f5" },
                    success: { main: "#66bb6a", dark: "#388e3c" },
                    error: { main: "#f44336" },
                    info: { main: "#29b6f6", dark: "#0288d1" },
                    background: { paper: "#1d1d1d", default: "#121212" },
                    divider: "#333",
                    text: { secondary: "#aaa" }
                },
                shadows: Array(25).fill("none")
            } as ReturnType<typeof useTheme>);

            render(<SpecializedDashboardLinks />);
            expect(screen.getByText("Explorer par thème")).toBeInTheDocument();
            expect(screen.getAllByText("Explorer les détails")).toHaveLength(5);
        });
    });
});
