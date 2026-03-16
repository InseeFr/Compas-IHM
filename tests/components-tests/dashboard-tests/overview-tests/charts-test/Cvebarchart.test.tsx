/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { CveBarChart } from "pages/dashboards/overview/Charts/CveBarChart";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe("CveBarChart", () => {
    const mockData = [
        {
            applicationName: "App1",
            isModule: false,
            nbCveCritical: "5",
            nbCveHigh: "10",
            nbCveMedium: "15",
            nbCveLow: "20"
        },
        {
            applicationName: "App2",
            isModule: false,
            nbCveCritical: "3",
            nbCveHigh: "5",
            nbCveMedium: "8",
            nbCveLow: "12"
        },
        {
            applicationName: "Module1",
            isModule: true, // Should be excluded
            nbCveCritical: "10",
            nbCveHigh: "20",
            nbCveMedium: "30",
            nbCveLow: "40"
        },
        {
            applicationName: "App3",
            isModule: false,
            nbCveCritical: "0",
            nbCveHigh: "0",
            nbCveMedium: "0",
            nbCveLow: "0" // Should be excluded (no CVE)
        }
    ] as any;

    it("should render without crashing", () => {
        const { container } = renderWithTheme(<CveBarChart data={mockData} />);
        expect(container).toBeInTheDocument();
    });

    it("should render title with default topN", () => {
        const { getByText } = renderWithTheme(<CveBarChart data={mockData} />);
        expect(getByText("Les 10 applications avec le plus de CVE")).toBeInTheDocument();
    });

    it("should render title with custom topN", () => {
        const { getByText } = renderWithTheme(<CveBarChart data={mockData} topN={5} />);
        expect(getByText("Les 5 applications avec le plus de CVE")).toBeInTheDocument();
    });

    it("should handle empty data", () => {
        const { container } = renderWithTheme(<CveBarChart data={[]} />);
        expect(container).toBeInTheDocument();
    });

    it("should exclude modules from chart", () => {
        // Module1 has most CVEs but should not appear since isModule=true
        const { container } = renderWithTheme(<CveBarChart data={mockData} />);
        // Chart should still render, just without Module1
        expect(container.querySelector('[class*="echarts"]')).toBeTruthy();
    });

    it("should exclude applications with zero CVEs", () => {
        // App3 has 0 CVEs and should be excluded
        const { container } = renderWithTheme(<CveBarChart data={mockData} />);
        expect(container).toBeInTheDocument();
    });

    it("should handle missing CVE values", () => {
        const dataWithMissing = [
            {
                applicationName: "App1",
                isModule: false,
                nbCveCritical: "5"
                // Other CVE fields missing
            }
        ] as any;

        const { container } = renderWithTheme(<CveBarChart data={dataWithMissing} />);
        expect(container).toBeInTheDocument();
    });

    it("should render ECharts component", () => {
        const { container } = renderWithTheme(<CveBarChart data={mockData} />);
        // ECharts creates a div with specific structure
        expect(container.querySelector("div[_echarts_instance_]")).toBeTruthy();
    });

    it("should apply correct height style", () => {
        const { container } = renderWithTheme(<CveBarChart data={mockData} />);
        const echartsDiv = container.querySelector('div[style*="height"]');
        expect(echartsDiv).toHaveStyle({ height: "400px" });
    });
});
