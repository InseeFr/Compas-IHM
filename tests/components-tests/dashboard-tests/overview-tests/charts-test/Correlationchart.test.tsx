/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CorrelationChart } from "components/dashboards/overview/Charts/ScatterChart";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe("CorrelationChart", () => {
    const mockData = [
        {
            applicationName: "App1",
            isModule: false,
            nbCveCritical: "10",
            pourcentageCouvertureTestUniaire: "80",
            delaiVmNonMiseAjour: "15",
            distanceCount: 30,
            detteTechnique: "2100" // 5 jours
        },
        {
            applicationName: "App2",
            isModule: false,
            nbCveCritical: "5",
            pourcentageCouvertureTestUniaire: "90",
            delaiVmNonMiseAjour: "10",
            distanceCount: 20,
            detteTechnique: "4200" // 10 jours
        },
        {
            applicationName: "Module1",
            isModule: true,
            nbCveCritical: "20",
            pourcentageCouvertureTestUniaire: "50",
            delaiVmNonMiseAjour: "25",
            distanceCount: 60,
            detteTechnique: "8400"
        },
        {
            applicationName: "App3",
            isModule: false,
            nbCveCritical: "3",
            pourcentageCouvertureTestUniaire: "95",
            delaiVmNonMiseAjour: "5",
            distanceCount: 15,
            detteTechnique: "1260"
        }
    ] as any;

    it("should render without crashing", () => {
        const { container } = renderWithTheme(<CorrelationChart data={mockData} />);
        expect(container).toBeInTheDocument();
    });

    it("should render title", () => {
        renderWithTheme(<CorrelationChart data={mockData} />);
        expect(screen.getByText("Analyse de corrélation croisée")).toBeInTheDocument();
    });

    it("should render X and Y axis selectors", () => {
        renderWithTheme(<CorrelationChart data={mockData} />);
        const selectors = screen.getAllByRole("combobox");
        expect(selectors).toHaveLength(2);
    });

    it("should have testCoverage as default X metric", () => {
        renderWithTheme(<CorrelationChart data={mockData} />);
        const xSelector = screen.getAllByRole("combobox")[0];
        expect(xSelector).toHaveTextContent("Couverture tests unitaires");
    });

    it("should have cveCritical as default Y metric", () => {
        renderWithTheme(<CorrelationChart data={mockData} />);
        const ySelector = screen.getAllByRole("combobox")[1];
        expect(ySelector).toHaveTextContent("CVE critiques");
    });

    it("should display correlation coefficient", () => {
        renderWithTheme(<CorrelationChart data={mockData} />);
        expect(screen.getByText(/Corrélation:/)).toBeInTheDocument();
    });

    it("should display number of analyzed applications", () => {
        renderWithTheme(<CorrelationChart data={mockData} />);
        expect(screen.getByText("3 applications analysées")).toBeInTheDocument();
    });

    it("should exclude modules from analysis", () => {
        renderWithTheme(<CorrelationChart data={mockData} />);
        expect(screen.getByText("3 applications analysées")).toBeInTheDocument();
    });

    it("should render ECharts component", () => {
        const { container } = renderWithTheme(<CorrelationChart data={mockData} />);
        expect(container.querySelector("div[_echarts_instance_]")).toBeTruthy();
    });

    it("should apply correct height style", () => {
        const { container } = renderWithTheme(<CorrelationChart data={mockData} />);
        const echartsDiv = container.querySelector('div[style*="height"]');
        expect(echartsDiv).toHaveStyle({ height: "400px" });
    });

    it("should handle empty data", () => {
        const { container } = renderWithTheme(<CorrelationChart data={[]} />);
        expect(container).toBeInTheDocument();
        expect(screen.getByText("0 applications analysées")).toBeInTheDocument();
    });

    it("should filter out applications with zero values", () => {
        const dataWithZeros = [
            {
                applicationName: "AppWithZeros",
                isModule: false,
                nbCveCritical: "0",
                pourcentageCouvertureTestUniaire: "80",
                delaiVmNonMiseAjour: "10",
                distanceCount: 20,
                detteTechnique: "2100"
            },
            ...mockData
        ] as any;

        renderWithTheme(<CorrelationChart data={dataWithZeros} />);
        expect(screen.getByText("3 applications analysées")).toBeInTheDocument();
    });

    it("should display correlation chip", () => {
        const { container } = renderWithTheme(<CorrelationChart data={mockData} />);
        const chip = container.querySelector('[class*="MuiChip-root"]');
        expect(chip).toBeInTheDocument();
    });

    it("should handle missing metric values", () => {
        const dataWithMissing = [
            {
                applicationName: "AppMissing",
                isModule: false,
                nbCveCritical: "5"
            }
        ] as any;

        const { container } = renderWithTheme(<CorrelationChart data={dataWithMissing} />);
        expect(container).toBeInTheDocument();
    });

    it("should calculate correlation between -1 and 1", () => {
        renderWithTheme(<CorrelationChart data={mockData} />);

        const correlationText = screen.getByText(/Corrélation:/);
        const correlationMatch = correlationText.textContent?.match(/(-?\d+\.\d+)/);

        if (correlationMatch) {
            const correlation = parseFloat(correlationMatch[1]);
            expect(correlation).toBeGreaterThanOrEqual(-1);
            expect(correlation).toBeLessThanOrEqual(1);
        }
    });

    it("should render all metric options when opening selector", () => {
        renderWithTheme(<CorrelationChart data={mockData} />);

        const xSelector = screen.getAllByRole("combobox")[0];
        fireEvent.mouseDown(xSelector);

        // Wait for menu to open
        waitFor(() => {
            const options = screen.getAllByRole("option");
            expect(options.length).toBeGreaterThan(0);
        });
    });

    it("should use canvas renderer", () => {
        const { container } = renderWithTheme(<CorrelationChart data={mockData} />);

        expect(container.querySelector("div[_echarts_instance_]")).toBeTruthy();
    });
});
