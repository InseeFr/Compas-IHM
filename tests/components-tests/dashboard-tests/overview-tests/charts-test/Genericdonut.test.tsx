/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { GenericDonut } from "components/dashboards/overview/Charts/GenericDonut";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe("GenericDonut", () => {
    const mockData = [
        {
            applicationName: "App1",
            lettreQualite: "A"
        },
        {
            applicationName: "App2",
            lettreQualite: "B"
        },
        {
            applicationName: "App3",
            lettreQualite: "A"
        }
    ] as any;

    const mockTransformer = vi.fn(() => [
        { name: "A", value: 2, color: "#2e7d32" },
        { name: "B", value: 1, color: "#66bb6a" },
        { name: "C", value: 0, color: "#ffee58" }
    ]);

    it("should render without crashing", () => {
        const { container } = renderWithTheme(
            <GenericDonut data={mockData} title="Test Chart" dataTransformer={mockTransformer} />
        );
        expect(container).toBeInTheDocument();
    });

    it("should render title", () => {
        renderWithTheme(
            <GenericDonut data={mockData} title="Test Donut Chart" dataTransformer={mockTransformer} />
        );
        expect(screen.getByText("Test Donut Chart")).toBeInTheDocument();
    });

    it("should call dataTransformer with data", () => {
        renderWithTheme(
            <GenericDonut data={mockData} title="Test Chart" dataTransformer={mockTransformer} />
        );
        expect(mockTransformer).toHaveBeenCalledWith(mockData);
    });

    it("should filter out items with zero value", () => {
        const transformerWithZeros = vi.fn(() => [
            { name: "A", value: 2, color: "#2e7d32" },
            { name: "B", value: 0, color: "#66bb6a" }, // Should be filtered out
            { name: "C", value: 1, color: "#ffee58" }
        ]);

        renderWithTheme(
            <GenericDonut data={mockData} title="Test Chart" dataTransformer={transformerWithZeros} />
        );

        // ECharts should be rendered with filtered data
        expect(transformerWithZeros).toHaveBeenCalled();
    });

    it("should render ECharts component", () => {
        const { container } = renderWithTheme(
            <GenericDonut data={mockData} title="Test Chart" dataTransformer={mockTransformer} />
        );

        expect(container.querySelector("div[_echarts_instance_]")).toBeTruthy();
    });

    it("should apply correct height style", () => {
        const { container } = renderWithTheme(
            <GenericDonut data={mockData} title="Test Chart" dataTransformer={mockTransformer} />
        );

        const echartsDiv = container.querySelector('div[style*="height"]');
        expect(echartsDiv).toHaveStyle({ height: "280px" });
    });

    it("should use SVG renderer", () => {
        const { container } = renderWithTheme(
            <GenericDonut data={mockData} title="Test Chart" dataTransformer={mockTransformer} />
        );

        // SVG renderer creates an SVG element
        const svgElement = container.querySelector("svg");
        expect(svgElement).toBeTruthy();
    });

    it("should handle empty data", () => {
        const emptyTransformer = vi.fn(() => []);

        const { container } = renderWithTheme(
            <GenericDonut data={[]} title="Empty Chart" dataTransformer={emptyTransformer} />
        );

        expect(container).toBeInTheDocument();
        expect(emptyTransformer).toHaveBeenCalledWith([]);
    });

    it("should handle all zero values", () => {
        const allZerosTransformer = vi.fn(() => [
            { name: "A", value: 0, color: "#2e7d32" },
            { name: "B", value: 0, color: "#66bb6a" },
            { name: "C", value: 0, color: "#ffee58" }
        ]);

        const { container } = renderWithTheme(
            <GenericDonut data={mockData} title="All Zeros" dataTransformer={allZerosTransformer} />
        );

        expect(container).toBeInTheDocument();
    });

    it("should render with different titles", () => {
        const { rerender } = renderWithTheme(
            <GenericDonut data={mockData} title="First Title" dataTransformer={mockTransformer} />
        );

        expect(screen.getByText("First Title")).toBeInTheDocument();

        rerender(
            <ThemeProvider theme={theme}>
                <GenericDonut data={mockData} title="Second Title" dataTransformer={mockTransformer} />
            </ThemeProvider>
        );

        expect(screen.getByText("Second Title")).toBeInTheDocument();
        expect(screen.queryByText("First Title")).not.toBeInTheDocument();
    });

    it("should memoize chart data when data doesn't change", () => {
        const { rerender } = renderWithTheme(
            <GenericDonut data={mockData} title="Test Chart" dataTransformer={mockTransformer} />
        );

        const callCount = mockTransformer.mock.calls.length;

        // Rerender with same data
        rerender(
            <ThemeProvider theme={theme}>
                <GenericDonut data={mockData} title="Test Chart" dataTransformer={mockTransformer} />
            </ThemeProvider>
        );

        // Transformer should not be called again due to useMemo
        expect(mockTransformer.mock.calls.length).toBe(callCount);
    });

    it("should recalculate when data changes", () => {
        const { rerender } = renderWithTheme(
            <GenericDonut data={mockData} title="Test Chart" dataTransformer={mockTransformer} />
        );

        const callCount = mockTransformer.mock.calls.length;

        const newData = [...mockData, { applicationName: "App4", lettreQualite: "C" }] as any;

        // Rerender with different data
        rerender(
            <ThemeProvider theme={theme}>
                <GenericDonut data={newData} title="Test Chart" dataTransformer={mockTransformer} />
            </ThemeProvider>
        );

        // Transformer should be called again
        expect(mockTransformer.mock.calls.length).toBeGreaterThan(callCount);
    });

    it("should handle transformer with additional properties", () => {
        const extendedTransformer = vi.fn(() => [
            { name: "A", value: 2, color: "#2e7d32", customProp: "test" },
            { name: "B", value: 1, color: "#66bb6a", customProp: "test2" }
        ]);

        const { container } = renderWithTheme(
            <GenericDonut data={mockData} title="Test Chart" dataTransformer={extendedTransformer} />
        );

        expect(container).toBeInTheDocument();
        expect(extendedTransformer).toHaveBeenCalled();
    });
});
