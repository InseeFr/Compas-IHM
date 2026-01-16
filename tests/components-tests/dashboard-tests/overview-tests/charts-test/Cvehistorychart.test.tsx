/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CveHistoryChart } from "components/dashboards/overview/Charts/CveHistoryChart";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe("CveHistoryChart", () => {
    const mockData = [
        {
            applicationName: "App1",
            idApplication: 1,
            isModule: false,
            nbCveCritical: "10"
        },
        {
            applicationName: "App2",
            idApplication: 2,
            isModule: false,
            nbCveCritical: "5"
        },
        {
            applicationName: "Module1",
            idApplication: 3,
            isModule: true,
            nbCveCritical: "20" // Should be excluded
        },
        {
            applicationName: "App3",
            idApplication: 4,
            isModule: false,
            nbCveCritical: "0" // Should be excluded (no CVE)
        }
    ] as any;

    const mockMonthlyData = [
        { date: "2025-01-01", applicationId: 1, nbCveCritical: 5 },
        { date: "2025-02-01", applicationId: 1, nbCveCritical: 7 },
        { date: "2025-03-01", applicationId: 1, nbCveCritical: 10 },
        { date: "2025-01-01", applicationId: 2, nbCveCritical: 3 },
        { date: "2025-02-01", applicationId: 2, nbCveCritical: 4 },
        { date: "2025-03-01", applicationId: 2, nbCveCritical: 5 }
    ];

    it("should render without crashing", () => {
        const { container } = renderWithTheme(
            <CveHistoryChart data={mockData} monthlyData={mockMonthlyData} />
        );
        expect(container).toBeInTheDocument();
    });

    it("should render title", () => {
        renderWithTheme(<CveHistoryChart data={mockData} monthlyData={mockMonthlyData} />);
        expect(screen.getByText("Évolution mensuelle des CVE critiques")).toBeInTheDocument();
    });

    it("should render application selector with default option", () => {
        renderWithTheme(<CveHistoryChart data={mockData} monthlyData={mockMonthlyData} />);
        expect(screen.getByText("Top 6 applications avec le plus de CVE")).toBeInTheDocument();
    });

    it("should render application selector with custom maxApps", () => {
        renderWithTheme(<CveHistoryChart data={mockData} monthlyData={mockMonthlyData} maxApps={3} />);
        expect(screen.getByText("Top 3 applications avec le plus de CVE")).toBeInTheDocument();
    });

    it("should handle empty data", () => {
        const { container } = renderWithTheme(<CveHistoryChart data={[]} monthlyData={[]} />);
        expect(container).toBeInTheDocument();
    });

    it("should handle empty monthly data", () => {
        const { container } = renderWithTheme(<CveHistoryChart data={mockData} monthlyData={[]} />);
        expect(container).toBeInTheDocument();
    });

    it("should exclude modules from available apps", () => {
        renderWithTheme(<CveHistoryChart data={mockData} monthlyData={mockMonthlyData} />);

        // Open the select dropdown
        const selectButton = screen.getByRole("combobox");
        fireEvent.mouseDown(selectButton);

        // Module1 should not be in the list
        expect(screen.queryByText("Module1")).not.toBeInTheDocument();

        // App1 and App2 should be in the list
        expect(screen.getByText("App1")).toBeInTheDocument();
        expect(screen.getByText("App2")).toBeInTheDocument();
    });

    it("should exclude applications with zero CVEs", () => {
        renderWithTheme(<CveHistoryChart data={mockData} monthlyData={mockMonthlyData} />);

        // Open the select dropdown
        const selectButton = screen.getByRole("combobox");
        fireEvent.mouseDown(selectButton);

        // App3 (0 CVE) should not be in the list
        expect(screen.queryByText("App3")).not.toBeInTheDocument();
    });

    it("should render ECharts component", () => {
        const { container } = renderWithTheme(
            <CveHistoryChart data={mockData} monthlyData={mockMonthlyData} />
        );

        // ECharts creates a div with specific structure
        expect(container.querySelector("div[_echarts_instance_]")).toBeTruthy();
    });

    it("should apply correct height style", () => {
        const { container } = renderWithTheme(
            <CveHistoryChart data={mockData} monthlyData={mockMonthlyData} />
        );

        const echartsDiv = container.querySelector('div[style*="height"]');
        expect(echartsDiv).toHaveStyle({ height: "350px" });
    });

    it("should handle missing idApplication gracefully", () => {
        const dataWithoutId = [
            {
                applicationName: "AppNoId",
                isModule: false,
                nbCveCritical: "5"
            }
        ] as any;

        const { container } = renderWithTheme(<CveHistoryChart data={dataWithoutId} monthlyData={[]} />);

        expect(container).toBeInTheDocument();
    });

    it("should sort apps by critical CVE count", () => {
        renderWithTheme(<CveHistoryChart data={mockData} monthlyData={mockMonthlyData} />);

        // Open the select dropdown
        const selectButton = screen.getByRole("combobox");
        fireEvent.mouseDown(selectButton);

        // Get all menu items (excluding the "Top N" option)
        const menuItems = screen.getAllByRole("option");
        const appOptions = menuItems.slice(1); // Skip first option (Top N)

        // App1 (10 CVE) should be before App2 (5 CVE)
        expect(appOptions[0]).toHaveTextContent("App1");
        expect(appOptions[1]).toHaveTextContent("App2");
    });
});
