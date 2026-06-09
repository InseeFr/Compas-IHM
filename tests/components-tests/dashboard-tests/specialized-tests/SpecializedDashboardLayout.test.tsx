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

vi.mock("components/filtersLayout/FiltersForms", () => ({
    Filters: ({ data }: { data: GlobalIndicator[] }) => (
        <div data-testid="filters">Filters ({data.length})</div>
    )
}));

const mockDispatch = vi.fn();

vi.mock("store/filterContext", () => ({
    useFilterContext: vi.fn(() => ({
        state: { serviceDev: "", domaineDev: "", domaineFonc: "" },
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

function renderLayout(props: Partial<typeof defaultProps> = {}) {
    return render(<SpecializedDashboardLayout {...defaultProps} {...props} />);
}

// --- Tests ---

describe("SpecializedDashboardLayout", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Rendu de base", () => {
        it("affiche le titre en h1", () => {
            renderLayout();
            expect(screen.getByRole("heading", { level: 1, name: "Mon Dashboard" })).toBeInTheDocument();
        });

        it("affiche le sous-titre en h2", () => {
            renderLayout();
            expect(
                screen.getByRole("heading", { level: 2, name: "Sous-titre du dashboard" })
            ).toBeInTheDocument();
        });

        it("affiche l'icône", () => {
            renderLayout();
            expect(screen.getByTestId("icon")).toBeInTheDocument();
        });

        it("affiche les enfants", () => {
            renderLayout();
            expect(screen.getByTestId("children-content")).toBeInTheDocument();
        });
    });

    describe("Fil d'Ariane", () => {
        it("affiche le fil d'Ariane", () => {
            renderLayout();
            expect(screen.getByTestId("ariane")).toBeInTheDocument();
        });

        it("contient 'Vue d'ensemble' et le titre", () => {
            renderLayout();
            const ariane = screen.getByTestId("ariane");
            expect(ariane).toHaveTextContent("Vue d'ensemble");
            expect(ariane).toHaveTextContent("Mon Dashboard");
        });

        it("met à jour le titre dynamiquement", () => {
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

    describe("Thème", () => {
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
        it("le titre principal est un h1", () => {
            renderLayout();
            expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Mon Dashboard");
        });

        it("le sous-titre est un h2", () => {
            renderLayout();
            expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
                "Sous-titre du dashboard"
            );
        });
    });

    describe("Intégration filterContext", () => {
        it("appelle useFilterContext une fois", async () => {
            const { useFilterContext } = await import("store/filterContext");
            renderLayout();
            expect(useFilterContext).toHaveBeenCalledTimes(1);
        });

        it("passe le dispatch du context au composant Filters", async () => {
            const { useFilterContext } = await import("store/filterContext");
            renderLayout();
            expect(useFilterContext).toHaveReturnedWith(
                expect.objectContaining({ dispatch: mockDispatch })
            );
        });
    });
});
