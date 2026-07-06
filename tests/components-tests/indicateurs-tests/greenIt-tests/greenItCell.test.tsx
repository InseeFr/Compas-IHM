/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { GreenITIndicateur } from "models/indicateurs";
import type { ViewMode } from "constantes/constantes";
import {
    GreenItToggleButton,
    NbVMCell,
    NbPodCell,
    DiskAllocatedCell,
    DiskUsedCell,
    PvcUsedCell,
    S3UsedCell,
    CPUCell,
    CpuUsedCell,
    RamAlloueeCell,
    RamUsedCell,
    ConsoCell
} from "pages/indicateurs/greenIT/GreenItCell";

// --- Mocks -----------------------------------------------------------------

vi.mock("components/ToolTipLayout", () => ({
    ToolTipLayout: ({ title, content }: { title: string; content: React.ReactNode }) => (
        <div data-testid="tooltip" title={title}>
            {content}
        </div>
    )
}));

vi.mock("constantes/trend.constants", () => ({
    TREND_CONFIG: {
        up: { icon: (props: any) => <span data-testid="icon-up" {...props} />, color: "green" },
        down: { icon: (props: any) => <span data-testid="icon-down" {...props} />, color: "red" },
        flat: { icon: (props: any) => <span data-testid="icon-flat" {...props} />, color: "grey" }
    }
}));

vi.mock("./greenItConfig", () => ({
    diffNumeric: vi.fn((global: string, prod: string) => Number(global) - Number(prod))
}));

// --- Helpers -----------------------------------------------------------------

const buildRow = (overrides: Partial<GreenITIndicateur> = {}) =>
    ({
        _nbVm: "10",
        nbVMGlobalHist: "8",
        nbVMProdHist: "5",
        _nbPodMaxiSort: "20",
        nbPodMaxiHist: "18",
        nbPodMaxiProdHist: "10",
        _diskSort: "100",
        diskAllocatedGlobalHist: "90",
        diskAllocatedProdHist: "60",
        _diskUsedSort: "50",
        diskUsedHist: "55",
        diskUsedProdHist: "30",
        _pvcUsedSort: "40",
        pvcUsedHist: "40",
        pvcUsedProdHist: "20",
        _s3UsedSort: "70",
        s3UsedHist: "60",
        s3UsedProdHist: "30",
        _cpuSort: "4",
        cpuAllocatedGlobalHist: "3",
        cpuAllocatedProdHist: "2",
        _cpuUsedSort: "2",
        cpuUsedHist: "2",
        cpuUsedProdHist: "1",
        _ramSort: "16",
        ramAllocatedGlobalHist: "14",
        ramAllocatedProdHist: "8",
        _ramUsedSort: "12",
        ramUsedHist: "12",
        ramUsedProdHist: "6",
        _consoSort: "5",
        consoGlobalHist: "4",
        consoProdHist: "2",
        ...overrides
    }) as unknown as GreenITIndicateur;

describe("GreenItToggleButton", () => {
    it("affiche les trois options de vue", () => {
        render(<GreenItToggleButton viewMode="global" setViewMode={vi.fn()} />);
        expect(screen.getByText("Global")).toBeInTheDocument();
        expect(screen.getByText("Prod")).toBeInTheDocument();
        expect(screen.getByText("Hors-prod")).toBeInTheDocument();
    });

    it("appelle setViewMode avec la nouvelle valeur au clic", () => {
        const setViewMode = vi.fn();
        render(<GreenItToggleButton viewMode="global" setViewMode={setViewMode} />);
        fireEvent.click(screen.getByText("Prod"));
        expect(setViewMode).toHaveBeenCalledWith("prod");
    });

    it("n'appelle pas setViewMode si la valeur cliquée est nulle (déjà sélectionnée)", () => {
        const setViewMode = vi.fn();
        render(<GreenItToggleButton viewMode="global" setViewMode={setViewMode} />);
        fireEvent.click(screen.getByText("Global"));
        expect(setViewMode).not.toHaveBeenCalled();
    });
});

describe("NbVMCell", () => {
    it("affiche la valeur courante et le tooltip en mode global", () => {
        const row = { original: buildRow({ _nbVm: "10", nbVMGlobalHist: "8" }) };
        render(NbVMCell({ row }, "global" as ViewMode));
        expect(screen.getByText("10")).toBeInTheDocument();
        expect(screen.getByTestId("tooltip")).toHaveAttribute("title", "Nombre de VM : 10 (8)");
    });

    it("affiche une tendance à la baisse quand la valeur courante est supérieure à l'historique", () => {
        const row = { original: buildRow({ _nbVm: "10", nbVMGlobalHist: "5" }) };
        render(NbVMCell({ row }, "global" as ViewMode));
        expect(screen.getByTestId("icon-down")).toBeInTheDocument();
    });

    it("affiche une tendance à la hausse quand la valeur courante est inférieure à l'historique", () => {
        const row = { original: buildRow({ _nbVm: "5", nbVMGlobalHist: "10" }) };
        render(NbVMCell({ row }, "global"));
        expect(screen.getByTestId("icon-up")).toBeInTheDocument();
    });

    it("affiche une tendance stable quand les valeurs sont égales", () => {
        const row = { original: buildRow({ _nbVm: "10", nbVMGlobalHist: "10" }) };
        render(NbVMCell({ row }, "global"));
        expect(screen.getByTestId("icon-flat")).toBeInTheDocument();
    });

    it("utilise la valeur prod en mode 'prod'", () => {
        const row = { original: buildRow({ nbVMProdHist: "3" }) };
        render(NbVMCell({ row }, "prod"));
        expect(screen.getByTestId("tooltip")).toHaveAttribute("title", expect.stringContaining("(3)"));
    });

    it("utilise le diff (global - prod) en mode 'horsprod'", () => {
        const row = { original: buildRow({ nbVMGlobalHist: "8", nbVMProdHist: "5" }) };
        render(NbVMCell({ row }, "horsprod"));
        expect(screen.getByTestId("tooltip")).toHaveAttribute("title", expect.stringContaining("(3)"));
    });
});

describe.each([
    { name: "NbPodCell", Cell: NbPodCell, label: "Nombre de Pod", value: "_nbPodMaxiSort" },
    { name: "DiskAllocatedCell", Cell: DiskAllocatedCell, label: "Disque alloué", value: "_diskSort" },
    { name: "DiskUsedCell", Cell: DiskUsedCell, label: "Disque utilisé", value: "_diskUsedSort" },
    { name: "PvcUsedCell", Cell: PvcUsedCell, label: "Kube Stockage utilisé", value: "_pvcUsedSort" },
    { name: "S3UsedCell", Cell: S3UsedCell, label: "S3 utilisé", value: "_s3UsedSort" },
    { name: "CPUCell", Cell: CPUCell, label: "CPU VM reservé", value: "_cpuSort" },
    { name: "CpuUsedCell", Cell: CpuUsedCell, label: "CPU Kube utilisé", value: "_cpuUsedSort" },
    { name: "RamAlloueeCell", Cell: RamAlloueeCell, label: "RAM VM reservé", value: "_ramSort" },
    { name: "RamUsedCell", Cell: RamUsedCell, label: "RAM Kube utilisé", value: "_ramUsedSort" },
    { name: "ConsoCell", Cell: ConsoCell, label: "Consommation", value: "_consoSort" }
])("$name", ({ Cell, label, value }) => {
    it(`affiche le libellé "${label}" et la valeur brute dans le tooltip`, () => {
        const row = { original: buildRow() };
        render(Cell({ row }, "global"));
        const tooltip = screen.getByTestId("tooltip");
        expect(tooltip.getAttribute("title")).toContain(label);
        expect(tooltip.getAttribute("title")).toContain(
            String(row.original[value as keyof GreenITIndicateur])
        );
    });
});
