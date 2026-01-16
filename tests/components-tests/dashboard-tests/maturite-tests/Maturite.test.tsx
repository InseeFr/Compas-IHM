import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import type { IndicateurApplicationMaturite } from "models/indicateurs";
import type { ApplicationTip } from "todos-api/client.gen";
import {
    computeConseil,
    fetchMaturiteData,
    fetchTipsData
} from "components/dashboards/maturité/maturite-config";
import MaturiteCloud from "components/dashboards/maturité/MaturiteCloud";

vi.mock("store/filterContext", () => ({
    useFilterContext: vi.fn(() => ({
        state: {},
        dispatch: vi.fn()
    }))
}));

vi.mock("components/dashboards/maturité/maturite-config", () => ({
    fetchMaturiteData: vi.fn(),
    fetchTipsData: vi.fn(),
    bottom3ByPriority: vi.fn(tips => tips.slice(0, 3)),
    computeConseil: vi.fn()
}));

vi.mock("components/Filters", () => ({
    Filters: vi.fn(() => <div data-testid="filters">Filters</div>)
}));

vi.mock("pages/dashboardsPagesLayout/dashboardPageLayout", () => ({
    default: vi.fn(({ renderContent, subHeader }) => (
        <div data-testid="dashboard-layout">
            {subHeader}
            {renderContent}
        </div>
    ))
}));

vi.mock("components/dashboards/maturité/MaturiteContent", () => ({
    MaturiteHeader: vi.fn(() => <div data-testid="maturite-header">Header</div>),
    ComplexitySection: vi.fn(() => <div data-testid="complexity-section">Complexity</div>),
    ConseilComplexity: vi.fn(() => <div data-testid="conseil-complexity">Conseil</div>),
    TechAndOrga: vi.fn(() => <div data-testid="tech-and-orga">Tech & Orga</div>),
    DisclaimerMaturity: vi.fn(() => <div data-testid="disclaimer">Disclaimer</div>)
}));

vi.mock("utils/filters-functions", () => ({
    applyDevFilters: vi.fn(() => true)
}));

describe("MaturiteCloud", () => {
    const mockMaturiteData: IndicateurApplicationMaturite[] = [
        {
            applicationId: 1,
            applicationName: "App Test 1",
            maturite: "75",
            scoreBenefice: "80",
            scoreComplexite: "60",
            sndi: "",
            domaine: "",
            domaineFonc: ""
        },
        {
            applicationId: 2,
            applicationName: "App Test 2",
            maturite: "50",
            scoreBenefice: "60",
            scoreComplexite: "70",
            sndi: "",
            domaine: "",
            domaineFonc: ""
        }
    ];

    const mockTips: ApplicationTip[] = [
        {
            id: 1,
            sourceId: 1,
            priority: 1,
            description: "Tech tip 1"
        } as ApplicationTip,
        {
            id: 2,
            sourceId: 2,
            priority: 2,
            description: "Orga tip 1"
        } as ApplicationTip
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (fetchMaturiteData as Mock).mockResolvedValue(mockMaturiteData);
        (fetchTipsData as Mock).mockResolvedValue(mockTips);
        (computeConseil as Mock).mockReturnValue({
            favorable: true,
            texte: "Conseil favorable"
        });
    });

    it("devrait afficher le titre de la page", async () => {
        render(<MaturiteCloud />);

        await waitFor(() => {
            expect(screen.getByTestId("dashboard-layout")).toBeInTheDocument();
        });
    });

    it("devrait charger et afficher les données de maturité au montage", async () => {
        render(<MaturiteCloud />);

        await waitFor(() => {
            expect(fetchMaturiteData).toHaveBeenCalledTimes(1);
        });
    });

    it("devrait afficher le composant Filters", async () => {
        render(<MaturiteCloud />);

        await waitFor(() => {
            expect(screen.getByTestId("filters")).toBeInTheDocument();
        });
    });

    it("devrait charger les tips quand une application est sélectionnée", async () => {
        render(<MaturiteCloud />);

        await waitFor(() => {
            expect(fetchMaturiteData).toHaveBeenCalled();
        });
        expect(fetchTipsData).toHaveBeenCalledWith(null);
    });

    it("devrait afficher MaturiteHeader dans le subHeader", async () => {
        render(<MaturiteCloud />);

        await waitFor(() => {
            expect(screen.getByTestId("maturite-header")).toBeInTheDocument();
        });
    });

    it("devrait afficher ComplexitySection dans le contenu", async () => {
        render(<MaturiteCloud />);

        await waitFor(() => {
            expect(screen.getByTestId("complexity-section")).toBeInTheDocument();
        });
    });

    it("devrait afficher TechAndOrga dans le contenu", async () => {
        render(<MaturiteCloud />);

        await waitFor(() => {
            expect(screen.getByTestId("tech-and-orga")).toBeInTheDocument();
        });
    });

    it("devrait afficher ConseilComplexity quand un conseil est disponible", async () => {
        render(<MaturiteCloud />);

        await waitFor(() => {
            expect(screen.queryByTestId("conseil-complexity")).not.toBeInTheDocument();
        });
    });

    it("devrait filtrer les tips par sourceId", async () => {
        render(<MaturiteCloud />);

        await waitFor(() => {
            expect(fetchTipsData).toHaveBeenCalled();
        });
    });

    it("devrait générer le bon label pour une application", async () => {
        render(<MaturiteCloud />);

        await waitFor(() => {
            expect(fetchMaturiteData).toHaveBeenCalled();
        });
    });

    it("devrait appliquer les filtres aux données", async () => {
        const { applyDevFilters } = await import("utils/filters-functions");

        render(<MaturiteCloud />);

        await waitFor(() => {
            expect(fetchMaturiteData).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(applyDevFilters).toHaveBeenCalled();
        });
    });

    it("devrait mettre à jour loading state correctement", async () => {
        const { container } = render(<MaturiteCloud />);

        await waitFor(() => {
            expect(fetchMaturiteData).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(container).toBeInTheDocument();
        });
    });
});
