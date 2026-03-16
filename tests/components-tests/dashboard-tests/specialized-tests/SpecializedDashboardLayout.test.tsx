import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { SpecializedDashboardLayout } from "pages/dashboards/specialized/SpecializedDashboardLayout";
import type { GlobalIndicator } from "models/indicateurs";

// --- Mocks ---

vi.mock("@mui/material", async importOriginal => {
    const actual = await importOriginal<typeof import("@mui/material")>();
    return {
        ...actual,
        useTheme: vi.fn(() => ({
            palette: { mode: "light" }
        }))
    };
});

vi.mock("components/Ariane", () => ({
    default: ({ items }: { items: { nav: string; link: string }[] }) => (
        <nav data-testid="ariane">
            {items.map(item => (
                <span key={item.nav}>{item.nav}</span>
            ))}
        </nav>
    )
}));

vi.mock("pages/Filters", () => ({
    Filters: ({ data }: { data: GlobalIndicator[] }) => (
        <div data-testid="filters">Filters ({data.length})</div>
    )
}));

const mockDispatch = vi.fn();

vi.mock("store/filterContext", () => ({
    useFilterContext: vi.fn(() => ({
        state: { search: "", filters: [] },
        dispatch: mockDispatch
    }))
}));

// --- Helpers ---

const mockData: GlobalIndicator[] = [
    { id: "1", name: "App A" } as unknown as GlobalIndicator,
    { id: "2", name: "App B" } as unknown as GlobalIndicator
];

const defaultProps = {
    title: "Mon Dashboard",
    subtitle: "Sous-titre du dashboard",
    icon: <svg data-testid="icon" />,
    children: <div data-testid="children-content">Contenu enfant</div>,
    data: mockData
};

function renderLayout(props = {}) {
    return render(<SpecializedDashboardLayout {...defaultProps} {...props} />);
}

// --- Tests ---

describe("SpecializedDashboardLayout", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Rendu de base", () => {
        it("affiche le titre", () => {
            renderLayout();
            expect(screen.getByRole("heading", { level: 1, name: "Mon Dashboard" })).toBeInTheDocument();
        });

        it("affiche le sous-titre", () => {
            renderLayout();
            expect(
                screen.getByRole("heading", { level: 2, name: "Sous-titre du dashboard" })
            ).toBeInTheDocument();
        });

        it("affiche l'icône", () => {
            renderLayout();
            expect(screen.getByTestId("icon")).toBeInTheDocument();
        });

        it("affiche les enfants (children)", () => {
            renderLayout();
            expect(screen.getByTestId("children-content")).toBeInTheDocument();
        });
    });

    describe("Composant Ariane", () => {
        it("affiche le fil d'Ariane avec 'Dashboard' et le titre", () => {
            renderLayout();
            const ariane = screen.getByTestId("ariane");
            expect(ariane).toBeInTheDocument();
            expect(ariane).toHaveTextContent("Dashboard");
            expect(ariane).toHaveTextContent("Mon Dashboard");
        });

        it("passe le bon titre dynamique au fil d'Ariane", () => {
            renderLayout({ title: "Qualité" });
            expect(screen.getByTestId("ariane")).toHaveTextContent("Qualité");
        });
    });

    describe("Composant Filters", () => {
        it("affiche le composant Filters", () => {
            renderLayout();
            expect(screen.getByTestId("filters")).toBeInTheDocument();
        });

        it("passe les données au composant Filters", () => {
            renderLayout();
            expect(screen.getByTestId("filters")).toHaveTextContent("Filters (2)");
        });

        it("passe un tableau vide si data est vide", () => {
            renderLayout({ data: [] });
            expect(screen.getByTestId("filters")).toHaveTextContent("Filters (0)");
        });
    });

    describe("Thème clair / sombre", () => {
        it("applique le dégradé light en mode clair", () => {
            const { container } = renderLayout();
            const rootBox = container.firstChild as HTMLElement;
            expect(rootBox).toHaveStyle({
                background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
            });
        });

        it("applique le dégradé dark en mode sombre", async () => {
            const { useTheme } = await import("@mui/material");
            vi.mocked(useTheme).mockReturnValueOnce({
                palette: { mode: "dark" }
            } as ReturnType<typeof useTheme>);

            const { container } = renderLayout();
            const rootBox = container.firstChild as HTMLElement;
            expect(rootBox).toHaveStyle({
                background: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)"
            });
        });
    });

    describe("Accessibilité", () => {
        it("le titre est un h1", () => {
            renderLayout();
            const h1 = screen.getByRole("heading", { level: 1 });
            expect(h1).toHaveTextContent("Mon Dashboard");
        });

        it("le sous-titre est un h2", () => {
            renderLayout();
            const h2 = screen.getByRole("heading", { level: 2 });
            expect(h2).toHaveTextContent("Sous-titre du dashboard");
        });
    });

    describe("Intégration filterContext", () => {
        it("utilise useFilterContext pour obtenir state et dispatch", async () => {
            const { useFilterContext } = await import("store/filterContext");
            renderLayout();
            expect(useFilterContext).toHaveBeenCalledTimes(1);
        });
    });
});
