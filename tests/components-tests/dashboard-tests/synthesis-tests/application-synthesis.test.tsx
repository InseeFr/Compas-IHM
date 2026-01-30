/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApplicationSynthesis } from "pages/dashboards/applications/ApplicationSynthesis";

vi.mock("store/filterContext", () => ({
    useFilterContext: () => ({
        state: {},
        dispatch: vi.fn()
    })
}));

vi.mock("utils/filters-functions", () => ({
    applyDevFilters: (item: any) => item
}));

const mockFetchApplicationSynthesis = vi.fn();

vi.mock("pages/dashboards/applications/application-synthesis-config", () => ({
    fetchApplicationSynthesis: () => mockFetchApplicationSynthesis(),
    handleGenerateReport: vi.fn(),
    normalize: (v: string) => v?.toLowerCase(),
    transformModuleData: (m: any) => m
}));

vi.mock("components/dashboardsPagesLayout/dashboardPageLayout", () => ({
    default: ({ title, dashboardData, setter, label, renderContent }: any) => (
        <div>
            <h1>{title}</h1>
            <div data-testid="filters">Filtres</div>
            {dashboardData.map((app: any) => (
                <button key={app.applicationId} onClick={() => setter(app)}>
                    {label(app)}
                </button>
            ))}

            {/* IMPORTANT */}
            <div data-testid="dashboard-content">{renderContent}</div>
        </div>
    )
}));

vi.mock("pages/dashboards/applications/preview/ApplicationContent", () => ({
    default: ({ appDetails }: any) => (
        <div data-testid="app-preview">Preview {appDetails.applicationName}</div>
    ),
    ButtonGenerateReport: () => <button>Generate report</button>
}));

const mockApps = [
    {
        applicationId: "1",
        applicationName: "My App"
    }
];

const mockModules = [
    {
        parentApplication: "My App",
        moduleName: "Module A"
    }
];

describe("ApplicationSynthesis", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockFetchApplicationSynthesis.mockResolvedValue([mockApps, mockModules]);
    });

    it("renders title and filters", async () => {
        render(<ApplicationSynthesis />);

        expect(screen.getByText("Synthèse d'une application")).toBeInTheDocument();
        expect(screen.getByTestId("filters")).toBeInTheDocument();

        await waitFor(() => expect(mockFetchApplicationSynthesis).toHaveBeenCalled());
    });

    it("displays applications after fetch", async () => {
        render(<ApplicationSynthesis />);

        const appButton = await screen.findByText("My App");
        expect(appButton).toBeInTheDocument();
    });

    it("shows application preview when selected", async () => {
        render(<ApplicationSynthesis />);

        const appButton = await screen.findByText("My App");
        await userEvent.click(appButton);

        expect(await screen.findByTestId("app-preview")).toHaveTextContent("Preview My App");
    });
});
