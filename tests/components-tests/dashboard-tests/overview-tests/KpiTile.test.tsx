import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KpiTile } from "components/dashboards/overview/KpiTile";
import { CloudOutlined } from "@mui/icons-material";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe("KpiTile", () => {
    it("should render label and value", () => {
        renderWithTheme(
            <KpiTile label="Test Label" value="42" accent="success" icon={<CloudOutlined />} />
        );

        expect(screen.getByText("Test Label")).toBeInTheDocument();
        expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("should render helper text when provided", () => {
        renderWithTheme(
            <KpiTile
                label="Test Label"
                value="42"
                helper="Helper text"
                accent="success"
                icon={<CloudOutlined />}
            />
        );

        expect(screen.getByText("Helper text")).toBeInTheDocument();
    });

    it("should not render helper text when not provided", () => {
        const { container } = renderWithTheme(
            <KpiTile label="Test Label" value="42" accent="success" icon={<CloudOutlined />} />
        );

        const helperElement = container.querySelector('[class*="MuiTypography-caption"]');
        expect(helperElement).not.toBeInTheDocument();
    });

    it("should render icon", () => {
        renderWithTheme(
            <KpiTile
                label="Test Label"
                value="42"
                accent="success"
                icon={<CloudOutlined data-testid="kpi-icon" />}
            />
        );

        expect(screen.getByTestId("kpi-icon")).toBeInTheDocument();
    });

    it("should apply success accent color", () => {
        const { container } = renderWithTheme(
            <KpiTile label="Test Label" value="42" accent="success" icon={<CloudOutlined />} />
        );

        const card = container.querySelector('[class*="MuiCard-root"]');
        expect(card).toBeInTheDocument();
    });

    it("should handle different accent colors", () => {
        const accents: Array<"success" | "warning" | "error" | "info"> = [
            "success",
            "warning",
            "error",
            "info"
        ];

        accents.forEach(accent => {
            const { unmount } = renderWithTheme(
                <KpiTile label="Test Label" value="42" accent={accent} icon={<CloudOutlined />} />
            );
            expect(screen.getByText("Test Label")).toBeInTheDocument();
            unmount();
        });
    });

    it("should render numeric value", () => {
        renderWithTheme(<KpiTile label="Test" value={100} accent="info" icon={<CloudOutlined />} />);

        expect(screen.getByText("100")).toBeInTheDocument();
    });

    it("should render string value", () => {
        renderWithTheme(<KpiTile label="Test" value="25.5%" accent="info" icon={<CloudOutlined />} />);

        expect(screen.getByText("25.5%")).toBeInTheDocument();
    });
});
