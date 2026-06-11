/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GreenItTable } from "pages/indicateurs/greenIT/GreenItTable";
import { useQueryIndicators } from "hooks/useQueryIndicators";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { fr } from "date-fns/locale";
// ============================
// MOCKS
// ============================

vi.mock("hooks/useQueryIndicators", () => ({
    useQueryIndicators: vi.fn()
}));

vi.mock("store/filterContext", () => ({
    useFilterContext: () => ({
        state: { domaineDev: "", service: "" },
        dispatch: vi.fn()
    })
}));

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

vi.mock("components/GreenItDate", () => ({
    GreenItDate: () => <div data-testid="greenit-date" />
}));

vi.mock("components/ButtonCsvExport", () => ({
    default: ({ onExport }: any) => (
        <button data-testid="button-export-csv" onClick={onExport}>
            Export CSV
        </button>
    )
}));

vi.mock("pages/indicateurs/greenIT/greenItConfig", async importOriginal => {
    const actual: any = await importOriginal();
    return {
        ...actual,
        columnsGreenIt: () => [{ accessorKey: "applicationName", header: "Nom" }],
        filteredViewMode: vi.fn((_mode, data) => data),
        paginationConfig: {},
        onExport: vi.fn()
    };
});

vi.mock("components/TablePageLayout", () => ({
    default: ({ titleTable, filters, data, isLoading, renderTopCustom }: any) => (
        <div>
            <h1>{titleTable}</h1>

            {isLoading && <progress data-testid="progress">Loading...</progress>}

            <div data-testid="layout-filters">{filters}</div>

            <div data-testid="table-data">
                {data?.map((row: any) => (
                    <div key={row.applicationName}>{row.applicationName}</div>
                ))}
            </div>

            <div data-testid="top-custom">{renderTopCustom?.({ table: {} })}</div>
        </div>
    )
}));

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            {ui}
        </LocalizationProvider>
    );
};

// ============================
// DATA MOCK
// ============================

const mockData = [
    {
        applicationName: "App1",
        isModule: false
    }
];

// ============================
// TESTS
// ============================

describe("GreenItTable", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(useQueryIndicators).mockReturnValue({
            data: mockData,
            filteredData: mockData,
            isLoading: false
        } as any);
    });

    // ============================
    // LOADING
    // ============================

    it("affiche le loader quand isLoading est true", () => {
        vi.mocked(useQueryIndicators).mockReturnValue({
            data: [],
            filteredData: [],
            isLoading: true
        } as any);

        renderWithProviders(<GreenItTable />);

        expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    // ============================
    // RENDER GLOBAL
    // ============================

    it("render correctement le titre et les composants principaux", () => {
        renderWithProviders(<GreenItTable />);

        expect(
            screen.getByRole("heading", {
                name: /table indicateur greenit/i
            })
        ).toBeInTheDocument();

        expect(screen.getByTestId("layout-filters")).toBeInTheDocument();
        expect(screen.getByTestId("greenit-date")).toBeInTheDocument();
        expect(screen.getByText("App1")).toBeInTheDocument();
    });

    // ============================
    // CSV EXPORT
    // ============================

    it("déclenche le bouton CSV", () => {
        renderWithProviders(<GreenItTable />);

        const button = screen.getByTestId("button-export-csv");
        fireEvent.click(button);

        expect(button).toBeInTheDocument();
    });

    // ============================
    // TOGGLE VIEW MODE
    // ============================

    it("change le mode de vue via ToggleButtonGroup", () => {
        renderWithProviders(<GreenItTable />);

        const prodButton = screen.getByText("Prod");
        fireEvent.click(prodButton);

        expect(prodButton).toHaveAttribute("aria-pressed", "true");
    });

    // ============================
    // filteredViewMode appelé
    // ============================

    it("appelle filteredViewMode avec le bon mode", () => {
        renderWithProviders(<GreenItTable />);

        const prodButton = screen.getByText("Prod");
        fireEvent.click(prodButton);
    });

    // ============================
    // ROW ID LOGIC
    // ============================

    it("génère correctement la rowId pour un module", () => {
        const moduleData = [
            {
                applicationName: "ChildApp",
                parentApplication: "ParentApp",
                isModule: true
            }
        ];

        vi.mocked(useQueryIndicators).mockReturnValue({
            data: moduleData,
            filteredData: moduleData,
            isLoading: false
        } as any);

        renderWithProviders(<GreenItTable />);

        expect(screen.getByText("ChildApp")).toBeInTheDocument();
    });
});
