import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChartCard } from "components/dashboards/overview/ChartCard";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe("ChartCard", () => {
    it("should render children", () => {
        renderWithTheme(
            <ChartCard>
                <div data-testid="chart-content">Chart Content</div>
            </ChartCard>
        );

        expect(screen.getByTestId("chart-content")).toBeInTheDocument();
        expect(screen.getByText("Chart Content")).toBeInTheDocument();
    });

    it("should render title when provided", () => {
        renderWithTheme(
            <ChartCard title="Test Chart">
                <div>Content</div>
            </ChartCard>
        );

        expect(screen.getByText("Test Chart")).toBeInTheDocument();
    });

    it("should not render title when not provided", () => {
        const { container } = renderWithTheme(
            <ChartCard>
                <div>Content</div>
            </ChartCard>
        );

        const title = container.querySelector("h6");
        expect(title).not.toBeInTheDocument();
    });

    it("should apply default minHeight", () => {
        const { container } = renderWithTheme(
            <ChartCard>
                <div>Content</div>
            </ChartCard>
        );

        const box = container.querySelector('[class*="MuiBox-root"]');
        expect(box).toHaveStyle({ minHeight: 320 });
    });

    it("should apply custom minHeight", () => {
        const { container } = renderWithTheme(
            <ChartCard minHeight={500}>
                <div>Content</div>
            </ChartCard>
        );

        const box = container.querySelector('[class*="MuiBox-root"]');
        expect(box).toHaveStyle({ minHeight: 500 });
    });

    it("should accept string minHeight", () => {
        const { container } = renderWithTheme(
            <ChartCard minHeight="400px">
                <div>Content</div>
            </ChartCard>
        );

        const box = container.querySelector('[class*="MuiBox-root"]');
        expect(box).toHaveStyle({ minHeight: "400px" });
    });

    it("should render Card component", () => {
        const { container } = renderWithTheme(
            <ChartCard>
                <div>Content</div>
            </ChartCard>
        );

        const card = container.querySelector('[class*="MuiCard-root"]');
        expect(card).toBeInTheDocument();
    });

    it("should render multiple children", () => {
        renderWithTheme(
            <ChartCard>
                <div data-testid="child1">Child 1</div>
                <div data-testid="child2">Child 2</div>
            </ChartCard>
        );

        expect(screen.getByTestId("child1")).toBeInTheDocument();
        expect(screen.getByTestId("child2")).toBeInTheDocument();
    });
});
