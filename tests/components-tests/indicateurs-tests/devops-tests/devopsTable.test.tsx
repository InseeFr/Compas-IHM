/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { DevopsIndicateurTable } from "pages/indicateurs/devops/DevopsIndicateur";
import { FilterProvider } from "store/filterContext";
import * as devopsConfig from "pages/indicateurs/devops/devopsConfig";
import { getApplications2, getModules2 } from "todos-api/client.gen";
import { UseQueryIndicators } from "utils/useQueryIndicators";

vi.mock("todos-api/client.gen", () => ({
    getApplications2: vi.fn(),
    getModules2: vi.fn()
}));

vi.mock("components/ButtonCsvExport", () => ({
    default: ({ onExport }: any) => <button onClick={() => onExport("mockTable")}>Export CSV</button>
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

vi.mock("components/TablePageLayout", () => ({
    default: ({ data, renderTopCustom }: any) => (
        <div>
            {renderTopCustom?.({ table: "mockTable" })}
            {data.map((item: any) => (
                <div key={item.applicationName}>{item.applicationName}</div>
            ))}
        </div>
    )
}));

vi.mock("utils/group-module-by-apps", () => ({
    groupModulesByApp: vi.fn(() => ({}))
}));

vi.mock("pages/indicateurs/devops/devopsConfig", () => ({
    columnsTable: vi.fn(() => []),
    formatIndicateur: vi.fn((x: any) => x),
    onExport: vi.fn(),
    paginationConfig: {}
}));

const mockApps = [{ applicationName: "App1" }, { applicationName: "App2" }];
const mockModules = [{ applicationName: "Module1", isModule: true, parentApplication: "App1" }];

vi.mock("utils/useQueryIndicators", () => ({
    UseQueryIndicators: vi.fn()
}));
describe("DevopsIndicateurTable", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (UseQueryIndicators as any).mockReturnValue({
            data: [...mockApps, ...mockModules],
            filteredData: mockApps,
            modulesByApp: { App1: [mockModules[0]] },
            isLoading: false
        });
    });

    it("should render applications and modules after fetching data", async () => {
        (getApplications2 as any).mockResolvedValue(mockApps);
        (getModules2 as any).mockResolvedValue(mockModules);

        render(
            <FilterProvider>
                <DevopsIndicateurTable />
            </FilterProvider>
        );

        await waitFor(() => {
            expect(screen.getByText("App1")).toBeDefined();
            expect(screen.getByText("App2")).toBeDefined();
        });

        expect(screen.queryByText("Module1")).toBeNull();
    });

    it("should call onExport when clicking Export CSV button", async () => {
        const mockApps = [{ applicationName: "App1" }];
        const mockModules: any[] = [];

        (getApplications2 as any).mockResolvedValue(mockApps);
        (getModules2 as any).mockResolvedValue(mockModules);

        render(
            <FilterProvider>
                <DevopsIndicateurTable />
            </FilterProvider>
        );

        const exportButton = await screen.findByText("Export CSV");
        fireEvent.click(exportButton);

        expect(devopsConfig.onExport).toHaveBeenCalledWith("mockTable");
    });
    it("gère une erreur lors du fetch des indicateurs devops", async () => {
        const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

        (UseQueryIndicators as any).mockReturnValue({
            data: undefined,
            filteredData: [],
            modulesByApp: {},
            isLoading: false
        });

        render(<DevopsIndicateurTable />);

        expect(devopsConfig.formatIndicateur).not.toHaveBeenCalled();

        expect(screen.queryByText("App1")).toBeNull();
        expect(screen.queryByText("Mod1")).toBeNull();

        consoleSpy.mockRestore();
    });
});
