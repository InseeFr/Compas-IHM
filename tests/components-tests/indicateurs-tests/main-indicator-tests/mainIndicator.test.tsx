/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MainIndicator } from "pages/indicateurs/main-indicator/mainIndicator";
import { useFilterContext, type FilterState } from "store/filterContext";
import { useQueryIndicators } from "hooks/useQueryIndicators";
import * as clientGen from "todos-api/client.gen";
import { formattedApps, formattedModules } from "pages/indicateurs/main-indicator/formatted-mod-and-app";

// Mock all dependencies
vi.mock("store/filterContext");
vi.mock("hooks/useQueryIndicators");
vi.mock("todos-api/client.gen");
vi.mock("@tanstack/react-router", async () => {
    return {
        Link: ({ to, children, ...rest }: any) => (
            <a href={to} {...rest}>
                {children}
            </a>
        )
    };
});
vi.mock("pages/indicateurs/main-indicator/formatted-mod-and-app");
vi.mock("components/TablePageLayout", () => ({
    default: ({ titleTable, isLoading, data, rowId, subRow, renderTopCustom }: any) => (
        <div data-testid="table-page-layout">
            <div data-testid="title">{titleTable}</div>
            <div data-testid="filters">
                <span data-testid="filter-data">{data?.length}</span>
            </div>
            <div data-testid="loading">{isLoading.toString()}</div>
            <div data-testid="data-length">{data.length}</div>
            {/* Test rowId function */}
            {data.map((item: any, index: number) => (
                <div key={index} data-testid={`row-id-${index}`}>
                    {rowId(item)}
                </div>
            ))}
            {/* Test subRow function */}
            {data.map((item: any, index: number) => {
                const subRows = subRow(item);
                return subRows ? (
                    <div key={index} data-testid={`subrow-${index}`}>
                        {subRows.length}
                    </div>
                ) : null;
            })}
            {/* Test renderTopCustom */}
            <div data-testid="custom-render">{renderTopCustom({ table: { mockTable: true } })}</div>
        </div>
    )
}));

vi.mock("components/ButtonCsvExport", () => ({
    default: ({ table, onExport }: any) => (
        <button data-testid="csv-export" onClick={() => onExport(table)}>
            Export CSV
        </button>
    )
}));
vi.mock("pages/indicateurs/main-indicator/main-config", () => ({
    columnsGlobal: vi.fn(() => [{ id: "col1" }, { id: "col2" }]),
    paginationConfig: { pageSize: 10 }
}));
vi.mock("pages/indicateurs/main-indicator/csvexport", () => ({
    onExport: vi.fn()
}));

describe("MainIndicator", () => {
    const mockDispatch = vi.fn();
    const mockState: FilterState = {
        serviceDev: "",
        domaineDev: "",
        appName: "",
        domaineFonc: ""
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock useFilterContext
        vi.mocked(useFilterContext).mockReturnValue({
            state: mockState,
            dispatch: mockDispatch
        });

        // Mock all API calls
        vi.mocked(clientGen.getApplications1).mockResolvedValue([]);
        vi.mocked(clientGen.getModules1).mockResolvedValue([]);
        vi.mocked(clientGen.getIndicateurQualiteByApplication).mockResolvedValue([]);
        vi.mocked(clientGen.getIndicateurQualiteByModule).mockResolvedValue([]);
        vi.mocked(clientGen.getApplications2).mockResolvedValue([]);
        vi.mocked(clientGen.getModules2).mockResolvedValue([]);
        vi.mocked(clientGen.listerApplicationsMeteo).mockResolvedValue([]);
        vi.mocked(clientGen.getApplications).mockResolvedValue([]);
        vi.mocked(clientGen.listerModulesA11y).mockResolvedValue([]);
        vi.mocked(clientGen.listerApplicationA11y).mockResolvedValue([]);
        vi.mocked(clientGen.getIndicateurSecuriteByApplication).mockResolvedValue([]);
        vi.mocked(clientGen.getIndicateurSecuriteByModule).mockResolvedValue([]);
        vi.mocked(clientGen.getMaturiteCloud).mockResolvedValue([]);

        // Mock formatting functions
        vi.mocked(formattedApps).mockReturnValue([]);
        vi.mocked(formattedModules).mockReturnValue([]);
    });

    it("renders loading state", () => {
        vi.mocked(useQueryIndicators).mockReturnValue({
            data: [],
            modulesByApp: {},
            isLoading: true,
            filteredData: []
        });

        render(<MainIndicator />);

        expect(screen.getByTestId("loading")).toHaveTextContent("true");
    });

    it("renders with filtered data excluding modules", () => {
        const mockData = [
            { applicationName: "App1", isModule: false },
            { applicationName: "Module1", isModule: true },
            { applicationName: "App2", isModule: false }
        ];

        vi.mocked(useQueryIndicators).mockReturnValue({
            data: mockData,
            modulesByApp: {},
            isLoading: false,
            filteredData: mockData
        });

        render(<MainIndicator />);

        expect(screen.getByTestId("data-length")).toHaveTextContent("2");
    });

    it("generates correct rowId for application", () => {
        const mockData = [{ applicationName: "TestApp", isModule: false }];

        vi.mocked(useQueryIndicators).mockReturnValue({
            data: mockData,
            modulesByApp: {},
            isLoading: false,
            filteredData: mockData
        });

        render(<MainIndicator />);

        expect(screen.getByTestId("row-id-0")).toHaveTextContent("TestApp");
    });

    it("rowId function handles both applications and modules correctly", () => {
        const mockApp = { applicationName: "TestApp", isModule: false };
        const mockModule = {
            applicationName: "TestModule",
            parentApplication: "ParentApp",
            isModule: true
        };

        vi.mocked(useQueryIndicators).mockReturnValue({
            data: [mockApp],
            modulesByApp: {
                TestApp: [mockModule]
            },
            isLoading: false,
            filteredData: [mockApp]
        });

        render(<MainIndicator />);

        expect(screen.getByTestId("row-id-0")).toHaveTextContent("TestApp");
    });

    it("returns subRows for applications with modules", () => {
        const mockData = [{ applicationName: "AppWithModules", isModule: false }];
        const mockModulesByApp = {
            AppWithModules: [
                { applicationName: "Module1", isModule: true },
                { applicationName: "Module2", isModule: true }
            ]
        };

        vi.mocked(useQueryIndicators).mockReturnValue({
            data: mockData,
            modulesByApp: mockModulesByApp,
            isLoading: false,
            filteredData: mockData
        });

        render(<MainIndicator />);

        expect(screen.getByTestId("subrow-0")).toHaveTextContent("2");
    });

    it("returns undefined for modules (no sub-subRows)", () => {
        const mockData = [{ applicationName: "Module1", isModule: true }];

        vi.mocked(useQueryIndicators).mockReturnValue({
            data: [],
            modulesByApp: {},
            isLoading: false,
            filteredData: mockData
        });

        render(<MainIndicator />);

        expect(screen.queryByTestId("subrow-0")).not.toBeInTheDocument();
    });

    it("passes correct props to Filters component", () => {
        const mockData = [{ applicationName: "App1", isModule: false }];

        vi.mocked(useQueryIndicators).mockReturnValue({
            data: mockData,
            modulesByApp: {},
            isLoading: false,
            filteredData: mockData
        });

        render(<MainIndicator />);

        expect(screen.getByTestId("filter-data")).toHaveTextContent("1");
    });

    it("calls useQueryIndicators with correct parameters", () => {
        const mockUseQueryIndicators = vi.mocked(useQueryIndicators);
        mockUseQueryIndicators.mockReturnValue({
            data: [],
            modulesByApp: {},
            isLoading: false,
            filteredData: []
        });

        render(<MainIndicator />);

        expect(mockUseQueryIndicators).toHaveBeenCalledWith({
            queryKey: ["GlobalIndicator"],
            fetchData: expect.any(Function),
            hasModules: true
        });
    });

    it("fetchData calls all API endpoints and formatting functions", async () => {
        let capturedFetchData: (() => Promise<any>) | null = null;

        vi.mocked(useQueryIndicators).mockImplementation(({ fetchData }: any) => {
            capturedFetchData = fetchData;
            return {
                data: [],
                modulesByApp: {},
                isLoading: false,
                filteredData: []
            };
        });

        const mockApps = [{ id: 1 }];
        const mockModules = [{ id: 2 }];

        vi.mocked(clientGen.getApplications1).mockResolvedValue(mockApps as any);
        vi.mocked(clientGen.getModules1).mockResolvedValue(mockModules as any);
        vi.mocked(formattedApps).mockReturnValue([{ applicationName: "FormattedApp" }] as any);
        vi.mocked(formattedModules).mockReturnValue([{ applicationName: "FormattedModule" }] as any);

        render(<MainIndicator />);

        expect(capturedFetchData).not.toBeNull();

        const result = await capturedFetchData!();

        await waitFor(() => {
            expect(clientGen.getApplications1).toHaveBeenCalled();
            expect(clientGen.getModules1).toHaveBeenCalled();
            expect(clientGen.getIndicateurQualiteByApplication).toHaveBeenCalled();
            expect(clientGen.getIndicateurQualiteByModule).toHaveBeenCalled();
            expect(clientGen.getApplications2).toHaveBeenCalled();
            expect(clientGen.getModules2).toHaveBeenCalled();
            expect(clientGen.listerApplicationsMeteo).toHaveBeenCalled();
            expect(clientGen.getApplications).toHaveBeenCalled();
            expect(clientGen.listerModulesA11y).toHaveBeenCalled();
            expect(clientGen.listerApplicationA11y).toHaveBeenCalled();
            expect(clientGen.getIndicateurSecuriteByApplication).toHaveBeenCalled();
            expect(clientGen.getIndicateurSecuriteByModule).toHaveBeenCalled();
            expect(clientGen.getMaturiteCloud).toHaveBeenCalled();
            expect(formattedApps).toHaveBeenCalled();
            expect(formattedModules).toHaveBeenCalled();
        });

        expect(result).toEqual([
            { applicationName: "FormattedApp" },
            { applicationName: "FormattedModule" }
        ]);
    });
});
