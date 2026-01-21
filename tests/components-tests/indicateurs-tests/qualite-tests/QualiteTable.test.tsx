/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import QualiteIndicateurTable from "components/indicateurs/qualité/QualiteIndicateur";
import { useFilterContext } from "store/filterContext";
import * as clientApi from "todos-api/client.gen";
import * as qualiteConfig from "components/indicateurs/qualité/qualiteConfig";
import * as groupModuleUtils from "utils/group-module-by-apps";

// ----- Mocks -----
vi.mock("store/filterContext", () => ({
    useFilterContext: vi.fn()
}));

vi.mock("todos-api/client.gen", () => ({
    getIndicateurQualiteByApplication: vi.fn(),
    getIndicateurQualiteByModule: vi.fn()
}));

vi.mock("utils/group-module-by-apps", () => ({
    groupModulesByApp: vi.fn(() => ({}))
}));

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

vi.mock("pages/ButtonCsvExport", () => ({
    default: ({ onExport }: any) => <button onClick={() => onExport("mockTable")}>Export CSV</button>
}));

vi.mock("components/indicateurs/qualité/qualiteConfig", () => ({
    columnsTable: vi.fn(() => []),
    formatIndicateur: vi.fn((x: any) => x),
    OnExport: vi.fn(),
    paginationConfig: {}
}));

// ----- Données Mock -----
const mockApps = [{ applicationName: "App1", sndi: "S1", domaineSndi: "D1" }];
const mockModules = [
    {
        applicationName: "App1",
        moduleName: "Mod1",
        sndi: "S1",
        domaineSndi: "D1",
        isModule: true,
        parentApplication: "App1"
    }
];

vi.mock("@tanstack/react-query", () => ({
    useQuery: vi.fn(() => ({
        data: [...mockApps, ...mockModules],
        isLoading: false
    }))
}));

describe("QualiteIndicateurTable", () => {
    const stateMock = {};
    const dispatchMock = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useFilterContext as any).mockReturnValue({ state: stateMock, dispatch: dispatchMock });
        (clientApi.getIndicateurQualiteByApplication as any).mockResolvedValue(mockApps);
        (clientApi.getIndicateurQualiteByModule as any).mockResolvedValue(mockModules);
        vi.spyOn(groupModuleUtils, "groupModulesByApp").mockImplementation(data => ({
            App1: data.filter(d => d.isModule)
        }));
    });

    it("renders applications and modules", async () => {
        render(<QualiteIndicateurTable />);

        await waitFor(() => {
            expect(screen.getByText("App1")).toBeDefined();
        });

        expect(screen.queryByText("Mod1")).toBeNull();
    });

    it("calls OnExport when clicking Export CSV button", async () => {
        render(<QualiteIndicateurTable />);

        const exportButton = await screen.findByText("Export CSV");
        fireEvent.click(exportButton);

        expect(qualiteConfig.OnExport).toHaveBeenCalledWith("mockTable");
    });
});
