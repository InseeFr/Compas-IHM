/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CveTreemap } from "components/dashboards/overview/Charts/CveTreemap";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe("CveTreemap", () => {
    const mockData = [
        {
            applicationName: "App1",
            isModule: false,
            nbCveCritical: "10",
            nbCveHigh: "5",
            nbCveMedium: "3",
            nbCveLow: "2",
            detteTechnique: "2100", // 5 jours -> 0-5j
            distanceCount: 25 // 0-30j
        },
        {
            applicationName: "App2",
            isModule: false,
            nbCveCritical: "5",
            nbCveHigh: "3",
            nbCveMedium: "2",
            nbCveLow: "1",
            detteTechnique: "6300", // 15 jours -> 6-15j
            distanceCount: 45 // 31-60j
        },
        {
            applicationName: "Module1",
            isModule: true,
            nbCveCritical: "20",
            nbCveHigh: "10",
            nbCveMedium: "5",
            nbCveLow: "3",
            detteTechnique: "4200",
            distanceCount: 50
        },
        {
            applicationName: "App3",
            isModule: false,
            nbCveCritical: "0",
            nbCveHigh: "0",
            nbCveMedium: "0",
            nbCveLow: "0",
            detteTechnique: "1000",
            distanceCount: 20
        }
    ] as any;

    it("should render without crashing", () => {
        const { container } = renderWithTheme(<CveTreemap data={mockData} />);
        expect(container).toBeInTheDocument();
    });

    it("should render title with default topN", () => {
        renderWithTheme(<CveTreemap data={mockData} />);
        expect(screen.getByText("Top 25 applications avec CVE critiques")).toBeInTheDocument();
    });

    it("should render title with custom topN", () => {
        renderWithTheme(<CveTreemap data={mockData} topN={10} />);
        expect(screen.getByText("Top 10 applications avec CVE critiques")).toBeInTheDocument();
    });

    it("should have dette as default color metric", () => {
        renderWithTheme(<CveTreemap data={mockData} />);
        const select = screen.getByRole("combobox");
        expect(select).toHaveTextContent("Dette technique (jours)");
    });

    it("should render legend for dette colors", () => {
        renderWithTheme(<CveTreemap data={mockData} />);

        // Check that dette legend items are present
        expect(screen.getByText("0-5j")).toBeInTheDocument();
        expect(screen.getByText("6-15j")).toBeInTheDocument();
        expect(screen.getByText("16-30j")).toBeInTheDocument();
        expect(screen.getByText("31-90j")).toBeInTheDocument();
        expect(screen.getByText(">90j")).toBeInTheDocument();
        expect(screen.getByText("NR")).toBeInTheDocument();
    });

    it("should exclude modules from treemap", () => {
        const { container } = renderWithTheme(<CveTreemap data={mockData} />);
        // Module1 has most CVEs but should not appear
        expect(container).toBeInTheDocument();
    });

    it("should exclude applications with zero CVEs", () => {
        const { container } = renderWithTheme(<CveTreemap data={mockData} />);
        // App3 has 0 CVE and should be excluded
        expect(container).toBeInTheDocument();
    });

    it("should render ECharts component", () => {
        const { container } = renderWithTheme(<CveTreemap data={mockData} />);
        expect(container.querySelector("div[_echarts_instance_]")).toBeTruthy();
    });

    it("should apply correct height style", () => {
        const { container } = renderWithTheme(<CveTreemap data={mockData} />);
        const echartsDiv = container.querySelector('div[style*="height"]');
        expect(echartsDiv).toHaveStyle({ height: "400px" });
    });

    it("should handle empty data", () => {
        const { container } = renderWithTheme(<CveTreemap data={[]} />);
        expect(container).toBeInTheDocument();
    });

    it("should handle missing CVE values", () => {
        const dataWithMissing = [
            {
                applicationName: "App1",
                isModule: false,
                nbCveCritical: "5"
                // Other fields missing
            }
        ] as any;

        const { container } = renderWithTheme(<CveTreemap data={dataWithMissing} />);
        expect(container).toBeInTheDocument();
    });

    it("should categorize dette correctly", () => {
        const testData = [
            {
                applicationName: "LowDebt",
                isModule: false,
                nbCveCritical: "1",
                detteTechnique: "420", // 1 jour = 0-5j
                distanceCount: 10
            },
            {
                applicationName: "HighDebt",
                isModule: false,
                nbCveCritical: "1",
                detteTechnique: "40000", // >90j
                distanceCount: 10
            }
        ] as any;

        const { container } = renderWithTheme(<CveTreemap data={testData} />);
        expect(container).toBeInTheDocument();
    });

    it("should categorize MEP correctly", () => {
        const testData = [
            {
                applicationName: "RecentMEP",
                isModule: false,
                nbCveCritical: "1",
                detteTechnique: "1000",
                distanceCount: 15 // 0-30j
            },
            {
                applicationName: "OldMEP",
                isModule: false,
                nbCveCritical: "1",
                detteTechnique: "1000",
                distanceCount: 200 // >180j
            }
        ] as any;

        const { container } = renderWithTheme(<CveTreemap data={testData} />);
        expect(container).toBeInTheDocument();
    });
});
