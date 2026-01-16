import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SectionHeader } from "components/dashboards/overview/SectionHeader";
import { DashboardOutlined } from "@mui/icons-material";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe("SectionHeader", () => {
    it("should render title", () => {
        renderWithTheme(<SectionHeader icon={<DashboardOutlined />} title="Test Title" />);

        expect(screen.getByText("Test Title")).toBeInTheDocument();
    });

    it("should render icon", () => {
        renderWithTheme(
            <SectionHeader icon={<DashboardOutlined data-testid="section-icon" />} title="Test Title" />
        );

        expect(screen.getByTestId("section-icon")).toBeInTheDocument();
    });

    it("should render subtitle when provided", () => {
        renderWithTheme(
            <SectionHeader icon={<DashboardOutlined />} title="Test Title" subtitle="Test Subtitle" />
        );

        expect(screen.getByText("Test Subtitle")).toBeInTheDocument();
    });

    it("should not render subtitle when not provided", () => {
        const { container } = renderWithTheme(
            <SectionHeader icon={<DashboardOutlined />} title="Test Title" />
        );

        // Check that there's only one Typography element (the title)
        const typographies = container.querySelectorAll('[class*="MuiTypography"]');
        expect(typographies.length).toBe(1);
    });

    it("should render with h5 variant for title", () => {
        renderWithTheme(<SectionHeader icon={<DashboardOutlined />} title="Test Title" />);

        const title = screen.getByText("Test Title");
        expect(title.tagName).toBe("H5");
    });

    it("should apply correct styles for title", () => {
        renderWithTheme(<SectionHeader icon={<DashboardOutlined />} title="Test Title" />);

        const title = screen.getByText("Test Title");
        expect(title).toHaveStyle({ fontWeight: 700 });
    });
});
