/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import {
    computeConseil,
    fetchMaturiteData,
    fetchTipsData
} from "pages/dashboards/maturité/maturite-config";
import MaturiteCloud from "pages/dashboards/maturité/MaturiteCloud";

vi.mock("store/filterContext", () => ({
    useFilterContext: () => ({
        state: {},
        dispatch: vi.fn()
    })
}));

vi.mock("utils/filters-functions", () => ({
    applyDevFilters: vi.fn(item => item)
}));

vi.mock("@tanstack/react-router", async () => {
    return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Link: ({ to, children, ...rest }: any) => (
            <a href={to} {...rest}>
                {children}
            </a>
        )
    };
});

vi.mock("pages/dashboards/maturité/maturite-config", () => ({
    fetchMaturiteData: vi.fn(),
    fetchTipsData: vi.fn(),
    bottom3ByPriority: vi.fn(tips => tips.slice(0, 3)),
    computeConseil: vi.fn()
}));

vi.mock("pages/dashboards/maturité/MaturiteContent", async () => {
    return {
        ComplexitySection: () => <div>ComplexitySection</div>,
        ConseilComplexity: () => <div>ConseilComplexity</div>,
        DisclaimerMaturity: () => <div>DisclaimerMaturity</div>,
        MaturiteHeader: () => <div>MaturiteHeader</div>,
        TechAndOrga: () => <div>TechAndOrga</div>
    };
});

vi.mock("components/dashboardsPagesLayout/dashboardPageLayout", () => {
    return {
        default: ({ setter, dashboardData, renderContent }: any) => {
            if (dashboardData?.length && setter) {
                setter(dashboardData[0]); // sélection automatique
            }
            return <div>{renderContent}</div>;
        }
    };
});

describe("MaturiteCloud", () => {
    const fakeApp = {
        applicationId: 1,
        applicationName: "App Test",
        maturite: 3,
        scoreBenefice: 5,
        scoreComplexite: 2
    };

    beforeEach(() => {
        vi.clearAllMocks();

        (fetchMaturiteData as any).mockResolvedValue([fakeApp]);
        (fetchTipsData as any).mockResolvedValue([
            { id: 1, sourceId: 1, priority: 1 },
            { id: 2, sourceId: 2, priority: 2 }
        ]);

        (computeConseil as any).mockReturnValue({
            favorable: true,
            texte: "Conseil favorable"
        });
    });

    it("charge les données au montage", async () => {
        render(<MaturiteCloud />);

        await waitFor(() => {
            expect(fetchMaturiteData).toHaveBeenCalled();
        });
    });

    it("sélectionne une application et affiche le contenu", async () => {
        render(<MaturiteCloud />);

        await waitFor(() => {
            expect(fetchMaturiteData).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(fetchTipsData).toHaveBeenCalledWith(fakeApp);
        });

        expect(screen.getByText("ComplexitySection")).toBeInTheDocument();
        expect(screen.getByText("TechAndOrga")).toBeInTheDocument();
        expect(screen.getByText("ConseilComplexity")).toBeInTheDocument();
    });

    it("appelle computeConseil avec les bons paramètres", async () => {
        render(<MaturiteCloud />);

        await waitFor(() => {
            expect(fetchMaturiteData).toHaveBeenCalled();
            expect(fetchTipsData).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(computeConseil).toHaveBeenCalledWith(
                fakeApp.maturite,
                fakeApp.scoreBenefice,
                fakeApp.scoreComplexite
            );
        });
    });
});
