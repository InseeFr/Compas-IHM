/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { fetchMaturiteData } from "pages/dashboards/maturité/maturite-config";
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

vi.mock("pages/dashboards/maturité/maturite-config", async importOriginal => {
    const actual = await importOriginal<typeof import("pages/dashboards/maturité/maturite-config")>();
    return {
        ...actual,
        fetchMaturiteData: vi.fn()
    };
});

vi.mock("components/dashboardsPagesLayout/dashboardPageLayout", () => {
    return {
        default: ({ setter, dashboardData, renderContent, renderInputAutoComplete, title }: any) => {
            if (dashboardData?.length && setter) {
                setter(dashboardData[0]); // sélection automatique
            }
            return (
                <div>
                    <h1>{title}</h1>
                    {renderInputAutoComplete && renderInputAutoComplete({})}
                    {renderContent}
                </div>
            );
        }
    };
});

describe("MaturiteCloud", () => {
    const fakeApp = {
        applicationId: 1,
        applicationName: "App Test",
        scoreOpportunite: "0.8",
        scoreMaturite: "0.7",
        scoreTechnique: "0.8",
        scoreOrga: "0.7",
        scoreBenefice: "0.6",
        scoreComplexite: "-0.3",
        deltaOpportunite: "0.1",
        deltaMaturite: "0.05"
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (fetchMaturiteData as any).mockResolvedValue([fakeApp]);
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

        // Le DashboardPageLayout mock sélectionne automatiquement la première app
        // et rend le contenu
        // On vérifie que le composant a rendu le titre
        expect(screen.getByText("Synthèse Maturité Cloud")).toBeInTheDocument();
    });
});
