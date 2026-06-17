import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GreenItTable } from "pages/indicateurs/greenIT/GreenItTable";
import { useQueryIndicators } from "hooks/useQueryIndicators";
import type { GreenITIndicateur } from "models/indicateurs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { fr } from "date-fns/locale";

vi.mock("hooks/useQueryIndicators", () => ({
    useQueryIndicators: vi.fn()
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

vi.mock("store/filterContext", () => ({
    useFilterContext: () => ({
        state: { domaineDev: "", service: "" },
        dispatch: vi.fn()
    })
}));

vi.mock("components/GreenItDate", () => ({
    GreenItDate: () => <div data-testid="greenit-date" />
}));

vi.mock("components/ButtonCsvExport", () => ({
    default: ({ onExport }: { onExport: () => void }) => (
        <button data-testid="button-export-csv" onClick={onExport}>
            Export CSV
        </button>
    )
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
        data: GreenITIndicateur[];
        isLoading: boolean;
        renderTopCustom: (props: { table: Record<string, unknown> }) => React.ReactNode;
    }) => (
        <div>
            <h1>{titleTable}</h1>
            {isLoading && <progress data-testid="progress">Loading...</progress>}
            <div data-testid="layout-filters">{filters}</div>
            <div data-testid="table-data">
                {data?.map(row => (
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

const mockData: GreenITIndicateur[] = [
    {
        applicationName: "App1",
        sndi: "S1",
        domaine: "D1",
        domaineFonc: "DF1",
        isModule: false,
        consoGlobal: "1000",
        cpuAllocatedGlobal: "2000",
        diskAllocatedGlobal: "4000",
        ramAllocatedGlobal: "3000",
        nbVMGlobal: "10",
        consoProd: "900",
        cpuAllocatedProd: "1800",
        diskAllocatedProd: "3800",
        ramAllocatedProd: "2800",
        nbVMProd: "8",
        lettreGreen: "A",
        gaspillage: "B",
        consoNormalized: "C",
        impactNormalized: "D",
        cpuUsed: "1000",
        cpuUsedProd: "900",
        ramUsed: "2000",
        ramUsedProd: "1900",
        diskUsed: "3000",
        diskUsedProd: "2900",
        s3Used: "500",
        s3UsedProd: "450",
        pvcUsed: "600",
        pvcUsedProd: "550",
        nbPodMaxi: "20",
        nbPodMaxiProd: "18",
        ramMaxi: "4000",
        cpuMaxi: "5000",
        ramMaxiProd: "3800",
        cpuMaxiProd: "4800"
    }
];

describe("GreenItTable", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useQueryIndicators).mockReturnValue({
            data: mockData,
            filteredData: mockData,
            isLoading: false,
            refetch: vi.fn()
        } as never);
    });

    it("affiche le titre correctement", () => {
        renderWithProviders(<GreenItTable />);
        expect(screen.getByRole("heading", { name: /table indicateur greenit/i })).toBeInTheDocument();
    });

    it("affiche les données", () => {
        renderWithProviders(<GreenItTable />);
        expect(screen.getByText("App1")).toBeInTheDocument();
    });

    it("change le mode de vue via ToggleButtonGroup", () => {
        renderWithProviders(<GreenItTable />);
        const prodButton = screen.getByText("Prod");
        fireEvent.click(prodButton);
        expect(prodButton).toHaveAttribute("aria-pressed", "true");
    });
});
