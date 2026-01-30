import { render, screen } from "@testing-library/react";
import type { AppForRadar } from "pages/dashboards/applications/RadarChart/RadarQualiteChar";
import RadarQualiteChart from "pages/dashboards/applications/RadarChart/RadarQualiteChar";
import * as echarts from "echarts";
import { vi, describe, it, beforeEach } from "vitest";

vi.mock("echarts", () => {
    return {
        init: vi.fn(() => ({
            setOption: vi.fn(),
            dispose: vi.fn()
        }))
    };
});

const mockApp: AppForRadar = {
    applicationName: "App1",
    lettreQualiteGenerale: "A",
    lettreNiveauCve: "B",
    distanceNote: "A",
    lettreFiabilite: "B",
    lettreGreen: "C",
    maturite: "B",
    domaineFonctionnel: "Finance"
};

const mockPopulation: AppForRadar[] = [
    mockApp,
    {
        applicationName: "App2",
        lettreQualiteGenerale: "C",
        lettreNiveauCve: "B",
        distanceNote: "B",
        lettreFiabilite: "C",
        lettreGreen: "A",
        maturite: "B",
        domaineFonctionnel: "Finance"
    }
];

describe("RadarQualiteChart", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders without crashing and initializes echarts", () => {
        render(<RadarQualiteChart app={mockApp} population={mockPopulation} title="Radar Test" />);

        const chartContainer = screen.getByTestId("radar-chart-container");
        expect(chartContainer).toBeInTheDocument();

        expect(echarts.init).toHaveBeenCalledWith(chartContainer);
    });
});
