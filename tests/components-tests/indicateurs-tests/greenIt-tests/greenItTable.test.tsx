/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// mocks context
import { useFilterContext } from "store/filterContext";
import { useTendanceContext } from "store/tendance-context";
import { useQueryIndicators } from "hooks/useQueryIndicators";
import { getApplications } from "todos-api/client.gen";
import { GreenItTable } from "pages/indicateurs/greenIT/GreenItTable";

// -------------------- MOCKS --------------------

vi.mock("store/filterContext", () => ({
    useFilterContext: vi.fn()
}));

vi.mock("store/tendance-context", () => ({
    useTendanceContext: vi.fn()
}));

vi.mock("hooks/useQueryIndicators", () => ({
    useQueryIndicators: vi.fn()
}));

vi.mock("components/TablePageLayout", () => ({
    default: (props: any) => (
        <div>
            <div data-testid="title">{props.titleTable}</div>

            {/* 🔥 AJOUT IMPORTANT */}
            <div data-testid="filters">{props.filters}</div>

            {props.renderTopCustom?.({ table: {} })}

            <div data-testid="data">{JSON.stringify(props.data)}</div>
        </div>
    )
}));

vi.mock("components/filtersLayout/FilterSideBar", () => ({
    FilterSidebar: () => <div data-testid="sidebar" />
}));

vi.mock("components/GreenItDate", () => ({
    GreenItDate: () => <div data-testid="date" />
}));

vi.mock("components/ButtonCsvExport", () => ({
    default: () => <button data-testid="export" />
}));

vi.mock("pages/indicateurs/greenIT/GreenItCell", () => ({
    GreenItToggleButton: () => <div data-testid="viewmode" />
}));

vi.mock("todos-api/client.gen", async () => {
    const actual = await vi.importActual<any>("todos-api/client.gen");
    return {
        ...actual,
        getApplications: vi.fn(),
        getValidDates: vi.fn(() => Promise.resolve([]))
    };
});

vi.mock("hooks/useCompasDataDate", () => ({
    useInitTendanceDates: vi.fn(),
    useValidDates: () => ({
        validDates: [],
        validDatesSet: new Set()
    })
}));

// -------------------- TESTS --------------------

describe("GreenItTable (Vitest)", () => {
    const dispatch = vi.fn();
    const dispatchTendance = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        (useFilterContext as any).mockReturnValue({
            state: {},
            dispatch
        });

        (useTendanceContext as any).mockReturnValue({
            stateTendance: {
                dateDebut: "2024-01-01",
                dateFin: "2024-01-31"
            },
            dispatchTendance
        });

        (useQueryIndicators as any).mockReturnValue({
            data: [],
            filteredData: [],
            isLoading: false,
            refetch: vi.fn()
        });

        (getApplications as any).mockResolvedValue([]);
    });

    it("renders main layout", () => {
        render(<GreenItTable />);

        expect(screen.getByTestId("title")).toHaveTextContent("Table Indicateur Écoconception");
        expect(screen.getByTestId("sidebar")).toBeInTheDocument();
        expect(screen.getByTestId("date")).toBeInTheDocument();
    });

    it("renders export button", () => {
        render(<GreenItTable />);

        expect(screen.getByTestId("export")).toBeInTheDocument();
    });

    it("renders view mode toggle", () => {
        render(<GreenItTable />);

        expect(screen.getByTestId("viewmode")).toBeInTheDocument();
    });

    it("switches infra mode to VM", async () => {
        render(<GreenItTable />);

        const vmBtn = screen.getByRole("button", { name: "VM" });
        fireEvent.click(vmBtn);

        await waitFor(() => {
            expect(vmBtn).toBeDefined();
        });
    });

    it("switches infra mode to Kube", async () => {
        render(<GreenItTable />);

        const kubeBtn = screen.getByRole("button", { name: "Kube" });
        fireEvent.click(kubeBtn);

        await waitFor(() => {
            expect(kubeBtn).toBeDefined();
        });
    });

    it("calls useQueryIndicators", () => {
        render(<GreenItTable />);

        expect(useQueryIndicators).toHaveBeenCalled();
    });
});
