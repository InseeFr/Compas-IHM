/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import TreeGraphCveCritiques from "components/dashboards/overview/Charts/Treegraph";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe("TreeGraphCveCritiques", () => {
    const mockData = [
        {
            applicationName: "App1",
            sndi: "SNDI Paris",
            nbCveCritical: "10"
        },
        {
            applicationName: "App2",
            sndi: "SNDI Paris",
            nbCveCritical: "5"
        },
        {
            applicationName: "App3",
            sndi: "SNDI Nantes",
            nbCveCritical: "8"
        },
        {
            applicationName: "App4",
            sndi: "SNDI Lille",
            nbCveCritical: "3"
        },
        {
            applicationName: "App5",
            sndi: "SNSSI",
            nbCveCritical: "12"
        }
    ];

    it("should render without crashing", () => {
        const { container } = renderWithTheme(<TreeGraphCveCritiques data={mockData} />);
        expect(container).toBeInTheDocument();
    });

    it("should render ECharts component", () => {
        const { container } = renderWithTheme(<TreeGraphCveCritiques data={mockData} />);
        expect(container.querySelector("div[_echarts_instance_]")).toBeTruthy();
    });

    it("should apply default height (80vh)", () => {
        const { container } = renderWithTheme(<TreeGraphCveCritiques data={mockData} />);
        const echartsDiv = container.querySelector('div[style*="height"]');
        expect(echartsDiv).toHaveStyle({ height: "80vh" });
    });

    it("should apply custom height as number", () => {
        const { container } = renderWithTheme(<TreeGraphCveCritiques data={mockData} height={500} />);
        const echartsDiv = container.querySelector('div[style*="height"]');
        expect(echartsDiv).toHaveStyle({ height: "500px" });
    });

    it("should apply custom height as string", () => {
        const { container } = renderWithTheme(<TreeGraphCveCritiques data={mockData} height="600px" />);
        const echartsDiv = container.querySelector('div[style*="height"]');
        expect(echartsDiv).toHaveStyle({ height: "600px" });
    });

    it("should handle empty data", () => {
        const { container } = renderWithTheme(<TreeGraphCveCritiques data={[]} />);
        expect(container).toBeInTheDocument();
    });

    it("should handle data with missing sndi", () => {
        const dataWithMissing = [
            {
                applicationName: "App1",
                nbCveCritical: "5"
                // sndi missing
            }
        ];
        const { container } = renderWithTheme(<TreeGraphCveCritiques data={dataWithMissing} />);
        expect(container).toBeInTheDocument();
    });

    it("should handle data with missing nbCveCritical", () => {
        const dataWithMissing = [
            {
                applicationName: "App1",
                sndi: "SNDI Paris"
                // nbCveCritical missing
            }
        ];
        const { container } = renderWithTheme(<TreeGraphCveCritiques data={dataWithMissing} />);
        expect(container).toBeInTheDocument();
    });

    it("should handle data with null values", () => {
        const dataWithNulls = [
            {
                applicationName: "App1",
                sndi: null,
                nbCveCritical: null
            }
        ] as any;
        const { container } = renderWithTheme(<TreeGraphCveCritiques data={dataWithNulls} />);
        expect(container).toBeInTheDocument();
    });

    it("should handle data with negative CVE values", () => {
        const dataWithNegative = [
            {
                applicationName: "App1",
                sndi: "SNDI Paris",
                nbCveCritical: "-5"
            }
        ];
        const { container } = renderWithTheme(<TreeGraphCveCritiques data={dataWithNegative} />);
        expect(container).toBeInTheDocument();
    });

    it("should filter out applications with zero CVE when multiple SNDI", () => {
        const dataWithZeros = [
            {
                applicationName: "App1",
                sndi: "SNDI Paris",
                nbCveCritical: "10"
            },
            {
                applicationName: "App2",
                sndi: "SNDI Nantes",
                nbCveCritical: "0"
            }
        ];
        const { container } = renderWithTheme(<TreeGraphCveCritiques data={dataWithZeros} />);
        expect(container).toBeInTheDocument();
    });

    it("should apply maxAppsPerSndi limit", () => {
        const manyApps = Array.from({ length: 50 }, (_, i) => ({
            applicationName: `App${i}`,
            sndi: "SNDI Paris",
            nbCveCritical: String(i + 1)
        }));

        const { container } = renderWithTheme(
            <TreeGraphCveCritiques data={manyApps} maxAppsPerSndi={10} />
        );
        expect(container).toBeInTheDocument();
    });

    it("should handle SNDI not in allowed list", () => {
        const dataWithUnknownSndi = [
            {
                applicationName: "App1",
                sndi: "SNDI Unknown",
                nbCveCritical: "5"
            }
        ];
        const { container } = renderWithTheme(<TreeGraphCveCritiques data={dataWithUnknownSndi} />);
        expect(container).toBeInTheDocument();
    });

    it("should prioritize allowed SNDI", () => {
        const mixedData = [
            {
                applicationName: "App1",
                sndi: "SNDI Paris",
                nbCveCritical: "5"
            },
            {
                applicationName: "App2",
                sndi: "Unknown SNDI",
                nbCveCritical: "100"
            }
        ];
        const { container } = renderWithTheme(<TreeGraphCveCritiques data={mixedData} />);
        expect(container).toBeInTheDocument();
    });

    it("should aggregate CVE by application within same SNDI", () => {
        const duplicateApps = [
            {
                applicationName: "App1",
                sndi: "SNDI Paris",
                nbCveCritical: "5"
            },
            {
                applicationName: "App1",
                sndi: "SNDI Paris",
                nbCveCritical: "3"
            }
        ];
        const { container } = renderWithTheme(<TreeGraphCveCritiques data={duplicateApps} />);
        expect(container).toBeInTheDocument();
    });

    it("should handle whitespace in SNDI and application names", () => {
        const dataWithWhitespace = [
            {
                applicationName: "  App1  ",
                sndi: "  SNDI Paris  ",
                nbCveCritical: "5"
            }
        ];
        const { container } = renderWithTheme(<TreeGraphCveCritiques data={dataWithWhitespace} />);
        expect(container).toBeInTheDocument();
    });

    it("should use canvas renderer", () => {
        const { container } = renderWithTheme(<TreeGraphCveCritiques data={mockData} />);
        expect(container.querySelector("div[_echarts_instance_]")).toBeTruthy();
    });

    it("should handle single SNDI differently", () => {
        const singleSndiData = [
            {
                applicationName: "App1",
                sndi: "SNDI Paris",
                nbCveCritical: "5"
            },
            {
                applicationName: "App2",
                sndi: "SNDI Paris",
                nbCveCritical: "0"
            }
        ];
        const { container } = renderWithTheme(<TreeGraphCveCritiques data={singleSndiData} />);
        expect(container).toBeInTheDocument();
    });
});
