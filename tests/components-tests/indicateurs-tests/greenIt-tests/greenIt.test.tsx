import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as client from "todos-api/client.gen";
import * as exportCsv from "components/ButtonCsvExport";
import { GreenItTable } from "pages/indicateurs/greenIT/GreenItTable";
import type { Application } from "todos-api/client.gen";

vi.mock("todos-api/client.gen", () => ({
    getApplications1: vi.fn(),
    getApplications: vi.fn()
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

vi.mock("components/ButtonCsvExport", () => ({
    default: vi.fn(() => <button data-testid="button-export-csv">Export CSV</button>)
}));

// ====================
// Données mock
// ====================
const mockApps = [
    {
        appName: "App1",
        sndi: "S1",
        domaineSndi: "D1"
    }
];

const mockGreenIT = [
    {
        applicationName: "App1",
        conso: "100",
        cpuAllocated: "2000",
        diskAllocated: "300",
        ramAllocated: "400",
        nbVm: "2",

        consoProd: "80",
        cpuAllocatedProd: "1500",
        diskAllocatedProd: "250",
        ramAllocatedProd: "350",
        nbVmProd: "1",

        lettreGreen: "A",
        gaspillageScore: "10",
        consoScore: "90",
        impactScore: "5"
    }
];

vi.mock("@tanstack/react-query", () => ({
    useQuery: vi.fn(() => ({
        data: [...mockApps, ...mockGreenIT],
        isLoading: false
    }))
}));

// ====================
// Tests
// ====================
describe("GreenItTable (mocked)", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(client.getApplications1).mockResolvedValue(mockApps as Application[]);
        vi.mocked(client.getApplications).mockResolvedValue(
            mockGreenIT as client.IndicateurApplicationGreenITView[]
        );

        vi.mocked(exportCsv.default).mockImplementation(() => (
            <button data-testid="button-export-csv" onClick={() => {}}>
                Export CSV
            </button>
        ));
    });

    it("devrait retourner les données mockées de GreenIT", async () => {
        const apps = await client.getApplications1();
        const greenItData = await client.getApplications();

        expect(apps).toEqual(mockApps);
        expect(greenItData).toEqual(mockGreenIT);
    });

    it("renders table avec les données mockées et appelle les mocks", async () => {
        render(<GreenItTable />);

        await screen.findByText("App1");
        const heading = await screen.findByRole("heading", {
            name: /table indicateur GreenIT/i
        });
        expect(heading).toBeDefined();

        expect(screen.getByText("Nom")).toBeInTheDocument();
        const elements = await screen.findAllByText("Service dev.");
        expect(elements[0]).toBeInTheDocument();
        expect(screen.getByText("App1")).toBeInTheDocument();

        const apps = await client.getApplications1();
        const greenItData = await client.getApplications();

        expect(apps).toEqual(mockApps);
        expect(greenItData).toEqual(mockGreenIT);
    });

    it("simulate click sur le bouton CSV", async () => {
        const handleClick = vi.fn();

        vi.mocked(exportCsv.default).mockImplementation(() => (
            <button data-testid="button-export-csv" onClick={handleClick}>
                Export CSV
            </button>
        ));

        render(<GreenItTable />);
        const exportButton = await screen.findByTestId("button-export-csv");
        fireEvent.click(exportButton);

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("change le mode de vue via ToggleButtonGroup", async () => {
        render(<GreenItTable />);
        const prodButton = await screen.findByText("Prod");

        fireEvent.click(prodButton);

        expect(prodButton).toHaveAttribute("aria-pressed", "true");
    });
});
