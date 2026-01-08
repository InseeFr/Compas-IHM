/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { DevopsIndicateurTable } from "components/indicateurs/devops/DevopsIndicateur";
import { FilterProvider } from "store/filterContext";
import * as devopsConfig from "components/indicateurs/devops/devopsConfig";
import { getApplications2, getModules2 } from "todos-api/client.gen";

// Mocks des API
vi.mock("todos-api/client.gen", () => ({
    getApplications2: vi.fn(),
    getModules2: vi.fn()
}));

// Mock du bouton CSV
vi.mock("pages/ButtonCsvExport", () => ({
    default: ({ onExport }: any) => <button onClick={() => onExport("mockTable")}>Export CSV</button>
}));

// Mock du layout/table
vi.mock("pages/TablePageLayout", () => ({
    default: ({ data, renderTopCustom }: any) => (
        <div>
            {renderTopCustom?.({ table: "mockTable" })}
            {data.map((item: any) => (
                <div key={item.applicationName}>{item.applicationName}</div>
            ))}
        </div>
    )
}));

// Mock des utilitaires
vi.mock("utils/group-module-by-apps", () => ({
    groupModulesByApp: vi.fn(() => ({}))
}));

vi.mock("components/indicateurs/devops/devopsConfig", () => ({
    columnsTable: vi.fn(() => []),
    formatIndicateur: vi.fn((x: any) => x),
    onExport: vi.fn(),
    paginationConfig: {}
}));

describe("DevopsIndicateurTable", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render applications and modules after fetching data", async () => {
        const mockApps = [{ applicationName: "App1" }, { applicationName: "App2" }];
        const mockModules = [{ applicationName: "Module1", isModule: true, parentApplication: "App1" }];

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

        expect(getApplications2).toHaveBeenCalledOnce();
        expect(getModules2).toHaveBeenCalledOnce();
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
});
