/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { GlobalIndicator } from "models/indicateurs";
import { CorrelationChart } from "pages/dashboards/overview/Charts/ScatterChart";
import * as MUI from "@mui/material";

vi.mock("echarts-for-react", () => ({
    default: ({ option }: { option: any }) => (
        <div data-testid="echarts-mock" data-option={JSON.stringify(option)} />
    )
}));

const mockUseTheme = vi.fn();
vi.mocked(MUI.useTheme).mockImplementation(mockUseTheme);

vi.mock("@mui/material", async importOriginal => {
    const actual = await importOriginal<typeof import("@mui/material")>();
    return {
        ...actual,
        useTheme: vi.fn()
    };
});

const mockTheme = {
    palette: {
        mode: "light",
        primary: { main: "#1976d2", dark: "#1565c0", light: "#42a5f5" },
        error: { main: "#d32f2f" }
    }
};

const mockData: GlobalIndicator[] = [
    {
        applicationName: "App1",
        nbCveCritical: "5",
        pourcentageCouvertureTestUniaire: "85.5",
        delaiVmNonMiseAjour: "12.3",
        distanceCount: "45",
        detteTechnique: "1260",
        isModule: false,
        sndi: "",
        domaine: "",
        domaineFonc: "",
        lettreCouvertureTestUniaire: "",
        lettreGlobaleSecurite: "",
        nbCveHigh: "",
        nbCveLow: "",
        nbCveMedium: "",
        lettreCve: "",
        consoNormalized: "",
        impactNormalized: "",
        gaspillage: ""
    },
    {
        applicationName: "App2",
        nbCveCritical: "2",
        pourcentageCouvertureTestUniaire: "92.1",
        delaiVmNonMiseAjour: "3.2",
        distanceCount: "23",
        detteTechnique: "840",
        isModule: false,
        sndi: "",
        domaine: "",
        domaineFonc: "",
        lettreCouvertureTestUniaire: "",
        lettreGlobaleSecurite: "",
        nbCveHigh: "",
        nbCveLow: "",
        nbCveMedium: "",
        lettreCve: "",
        consoNormalized: "",
        impactNormalized: "",
        gaspillage: ""
    },
    {
        applicationName: "App3",
        nbCveCritical: "8",
        pourcentageCouvertureTestUniaire: "78.9",
        delaiVmNonMiseAjour: "25.1",
        distanceCount: "67",
        detteTechnique: "0",
        isModule: true,
        sndi: "",
        domaine: "",
        domaineFonc: "",
        lettreCouvertureTestUniaire: "",
        lettreGlobaleSecurite: "",
        nbCveHigh: "",
        nbCveLow: "",
        nbCveMedium: "",
        lettreCve: "",
        consoNormalized: "",
        impactNormalized: "",
        gaspillage: ""
    }
];

const renderWithTheme = (ui: React.ReactElement) =>
    render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>);

describe("CorrelationChart", () => {
    beforeEach(() => {
        mockUseTheme.mockReturnValue(mockTheme);
        vi.clearAllMocks();
    });

    it("renders without crashing with valid data", () => {
        renderWithTheme(<CorrelationChart data={mockData} />);

        expect(screen.getByText("Analyse de corrélation croisée")).toBeInTheDocument();
        expect(screen.getByTestId("echarts-mock")).toBeInTheDocument();
    });

    it("displays correct number of applications analyzed", () => {
        renderWithTheme(<CorrelationChart data={mockData} />);

        expect(screen.getByText("2 applications analysées")).toBeInTheDocument();
    });

    it("shows default correlation value", () => {
        renderWithTheme(<CorrelationChart data={mockData} />);

        const correlationChip = screen.getByText(/Corrélation:/);
        expect(correlationChip).toBeInTheDocument();
    });

    it("changes X axis metric when select changes", async () => {
        renderWithTheme(<CorrelationChart data={mockData} />);
        const comboboxes = screen.getAllByRole("combobox");
        const xSelect = comboboxes[0];

        fireEvent.mouseDown(xSelect);

        const cveOptions = screen.getAllByText("CVE critiques");
        fireEvent.click(cveOptions[0]);

        expect(screen.getByTestId("echarts-mock")).toBeInTheDocument();
    });

    it("changes Y axis metric when select changes", async () => {
        renderWithTheme(<CorrelationChart data={mockData} />);

        const comboboxes = screen.getAllByRole("combobox");
        const ySelect = comboboxes[1];

        fireEvent.mouseDown(ySelect);

        const vmDelayOption = screen.getByText("Délai VM non mise à jour");
        fireEvent.click(vmDelayOption);

        expect(screen.getByTestId("echarts-mock")).toBeInTheDocument();
    });

    it("filters out modules and zero/negative values", () => {
        renderWithTheme(<CorrelationChart data={mockData} />);

        expect(screen.getByText("2 applications analysées")).toBeInTheDocument();
    });

    it("handles empty data gracefully", () => {
        renderWithTheme(<CorrelationChart data={[]} />);

        expect(screen.getByText("Analyse de corrélation croisée")).toBeInTheDocument();
        expect(screen.getByTestId("echarts-mock")).toBeInTheDocument();
    });

    it("handles data with some invalid values", () => {
        const invalidData = [
            ...mockData,
            {
                applicationName: "AppInvalid",
                nbCveCritical: null,
                pourcentageCouvertureTestUniaire: null,
                delaiVmNonMiseAjour: "-1",
                distanceCount: null,
                detteTechnique: null,
                isModule: false
            } as unknown as GlobalIndicator
        ];

        renderWithTheme(<CorrelationChart data={invalidData} />);

        expect(screen.getByText("2 applications analysées")).toBeInTheDocument();
    });

    it("correctly calculates correlation coefficient", async () => {
        const simpleData: GlobalIndicator[] = [
            {
                applicationName: "A",
                nbCveCritical: "1",
                pourcentageCouvertureTestUniaire: "80",
                delaiVmNonMiseAjour: "0",
                distanceCount: "0",
                detteTechnique: "0",
                isModule: false,
                sndi: "",
                domaine: "",
                domaineFonc: "",
                lettreCouvertureTestUniaire: "",
                lettreGlobaleSecurite: "",
                nbCveHigh: "",
                nbCveLow: "",
                nbCveMedium: "",
                lettreCve: "",
                consoNormalized: "",
                impactNormalized: "",
                gaspillage: ""
            },
            {
                applicationName: "B",
                nbCveCritical: "2",
                pourcentageCouvertureTestUniaire: "90",
                delaiVmNonMiseAjour: "0",
                distanceCount: "0",
                detteTechnique: "0",
                isModule: false,
                sndi: "",
                domaine: "",
                domaineFonc: "",
                lettreCouvertureTestUniaire: "",
                lettreGlobaleSecurite: "",
                nbCveHigh: "",
                nbCveLow: "",
                nbCveMedium: "",
                lettreCve: "",
                consoNormalized: "",
                impactNormalized: "",
                gaspillage: ""
            }
        ];

        renderWithTheme(<CorrelationChart data={simpleData} />);

        // La corrélation devrait être 1 (corrélation parfaite)
        const correlationChip = screen.getByText(/Corrélation: 1\./);
        expect(correlationChip).toBeInTheDocument();
    });
});
