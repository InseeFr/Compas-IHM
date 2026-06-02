import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { AllIndicators } from "models/indicateurs";
import type { Pagination } from "models/table-model";
import { GenericIndicatorTable } from "components/indicators/GenericIndicatorTable";

// --- Mocks ---
vi.mock("store/tendance-context", () => ({
    useTendanceContext: () => ({
        stateTendance: {
            dateDebut: "01/05/2026",
            dateFin: "02/06/2026"
        },
        dispatchTendance: vi.fn()
    })
}));
vi.mock("components/indicators/TendanceForm", () => ({
    TendancePeriodeForm: () => <div data-testid="tendance-form" />
}));
vi.mock("@tanstack/react-router", () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Link: ({ to, children, ...rest }: any) => (
        <a href={to} {...rest}>
            {children}
        </a>
    ),
    useRouter: vi.fn(),
    useNavigate: vi.fn(() => vi.fn()),
    useLocation: vi.fn(() => ({ pathname: "/" })),
    useParams: vi.fn(() => ({})),
    useSearch: vi.fn(() => ({}))
}));

const mockUseFilterContext = vi.fn();
vi.mock("store/filterContext", () => ({
    useFilterContext: () => mockUseFilterContext()
}));

const mockUseQueryIndicators = vi.fn();
vi.mock("hooks/useQueryIndicators", () => ({
    useQueryIndicators: (...args: unknown[]) => mockUseQueryIndicators(...args)
}));

vi.mock("pages/Filters", () => ({
    Filters: () => <div data-testid="filters" />
}));

vi.mock("components/TablePageLayout", () => ({
    default: ({
        titleTable,
        filters,
        data,
        isLoading,
        renderTopCustom
    }: {
        titleTable: string;
        filters: React.ReactNode;
        data: unknown[];
        isLoading: boolean;
        renderTopCustom?: (args: { table: unknown }) => React.ReactNode;
    }) => (
        <div data-testid="table-layout">
            <span data-testid="table-title">{titleTable}</span>
            <div data-testid="table-filters">{filters}</div>
            <div data-testid="table-data">{data.length} rows</div>
            {isLoading && <div data-testid="table-loading">loading</div>}
            {renderTopCustom && (
                <div data-testid="table-top-custom">{renderTopCustom({ table: {} })}</div>
            )}
        </div>
    )
}));

vi.mock("components/ButtonCsvExport", () => ({
    default: ({ onExport }: { onExport: () => void }) => (
        <button data-testid="csv-export" onClick={onExport}>
            Export CSV
        </button>
    )
}));

// --- Fixtures ---

const mockData: AllIndicators[] = [
    { applicationName: "App X", isModule: false } as unknown as AllIndicators,
    { applicationName: "App Y", isModule: false } as unknown as AllIndicators
];

const mockModulesByApp: Record<string, AllIndicators[]> = {
    "App X": [{ applicationName: "Module X", isModule: true } as unknown as AllIndicators]
};

const defaultPagination: Pagination = {
    pagination: {
        pageIndex: 0,
        pageSize: 10
    }
};

const defaultProps = {
    title: "Test Table",
    fetchData: vi.fn(),
    columns: [],
    queryKey: ["testKey"],
    paginationConfig: defaultPagination
};

// --- Tests ---

describe("GenericIndicatorTable", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseFilterContext.mockReturnValue({ state: {}, dispatch: vi.fn() });
        mockUseQueryIndicators.mockReturnValue({
            data: mockData,
            isLoading: false,
            filteredData: mockData,
            modulesByApp: mockModulesByApp
        });
    });

    describe("Rendu général", () => {
        it("affiche le titre", () => {
            render(<GenericIndicatorTable {...defaultProps} />);
            expect(screen.getByTestId("table-title")).toHaveTextContent("Test Table");
        });

        it("affiche le composant TablePageLayout", () => {
            render(<GenericIndicatorTable {...defaultProps} />);
            expect(screen.getByTestId("table-layout")).toBeInTheDocument();
        });

        it("affiche les filtres", () => {
            render(<GenericIndicatorTable {...defaultProps} />);
            expect(screen.getByTestId("filters")).toBeInTheDocument();
        });

        it("affiche le nombre de lignes correct", () => {
            render(<GenericIndicatorTable {...defaultProps} />);
            expect(screen.getByTestId("table-data")).toHaveTextContent("2 rows");
        });

        it("n'affiche pas le loader quand isLoading est false", () => {
            render(<GenericIndicatorTable {...defaultProps} />);
            expect(screen.queryByTestId("table-loading")).not.toBeInTheDocument();
        });

        it("affiche le loader quand isLoading est true", () => {
            mockUseQueryIndicators.mockReturnValueOnce({
                data: [],
                isLoading: true,
                filteredData: [],
                modulesByApp: {}
            });
            render(<GenericIndicatorTable {...defaultProps} />);
            expect(screen.getByTestId("table-loading")).toBeInTheDocument();
        });
    });

    describe("Appel à useQueryIndicators", () => {
        it("appelle useQueryIndicators avec la bonne queryKey", () => {
            render(<GenericIndicatorTable {...defaultProps} queryKey={["myKey"]} />);
            expect(mockUseQueryIndicators).toHaveBeenCalledWith(
                expect.objectContaining({ queryKey: ["myKey", "02/06/2026", "01/05/2026"] })
            );
        });

        it("appelle useQueryIndicators avec fetchData", () => {
            const fetchData = vi.fn();
            render(<GenericIndicatorTable {...defaultProps} fetchData={fetchData} />);
            expect(mockUseQueryIndicators).toHaveBeenCalledWith(expect.objectContaining({ fetchData }));
        });

        it("appelle useQueryIndicators avec hasModules=false par défaut", () => {
            render(<GenericIndicatorTable {...defaultProps} />);
            expect(mockUseQueryIndicators).toHaveBeenCalledWith(
                expect.objectContaining({ hasModules: false })
            );
        });

        it("appelle useQueryIndicators avec hasModules=true si fourni", () => {
            render(<GenericIndicatorTable {...defaultProps} hasModules={true} />);
            expect(mockUseQueryIndicators).toHaveBeenCalledWith(
                expect.objectContaining({ hasModules: true })
            );
        });
    });

    describe("Filtrage des données", () => {
        it("filtre les modules de processedData quand hasModules=true", () => {
            const dataWithModules: AllIndicators[] = [
                { applicationName: "App X", isModule: false } as unknown as AllIndicators,
                { applicationName: "Module X", isModule: true } as unknown as AllIndicators
            ];
            mockUseQueryIndicators.mockReturnValueOnce({
                data: dataWithModules,
                isLoading: false,
                filteredData: dataWithModules,
                modulesByApp: {}
            });
            render(<GenericIndicatorTable {...defaultProps} hasModules={true} />);
            // seul App X passe le filtre (isModule=false)
            expect(screen.getByTestId("table-data")).toHaveTextContent("1 rows");
        });

        it("ne filtre pas les modules quand hasModules=false", () => {
            render(<GenericIndicatorTable {...defaultProps} hasModules={false} />);
            expect(screen.getByTestId("table-data")).toHaveTextContent("2 rows");
        });
    });

    describe("Export CSV", () => {
        it("n'affiche pas le bouton CSV si onExport n'est pas fourni", () => {
            render(<GenericIndicatorTable {...defaultProps} />);
            expect(screen.queryByTestId("csv-export")).not.toBeInTheDocument();
        });

        it("affiche le bouton CSV si onExport est fourni", () => {
            render(<GenericIndicatorTable {...defaultProps} onExport={vi.fn()} />);
            expect(screen.getByTestId("csv-export")).toBeInTheDocument();
        });
    });

    describe("Filtres custom", () => {
        it("affiche uniquement Filters si customFilters n'est pas fourni", () => {
            render(<GenericIndicatorTable {...defaultProps} />);
            expect(screen.getByTestId("filters")).toBeInTheDocument();
            expect(screen.queryByTestId("custom-filter")).not.toBeInTheDocument();
        });

        it("affiche Filters et customFilters si customFilters est fourni", () => {
            render(
                <GenericIndicatorTable
                    {...defaultProps}
                    customFilters={<div data-testid="custom-filter">Custom</div>}
                />
            );
            expect(screen.getByTestId("filters")).toBeInTheDocument();
            expect(screen.getByTestId("custom-filter")).toBeInTheDocument();
        });
    });
});
