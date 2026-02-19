import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import * as echarts from "echarts";

import type { AppForRadar } from "pages/dashboards/applications/RadarChart/RadarQualiteChar";
import RadarQualiteChart from "pages/dashboards/applications/RadarChart/RadarQualiteChar";

// ---------------------------------------------------------------------------
// Mock ECharts — on capture setOption pour inspecter l'option produite
// ---------------------------------------------------------------------------

const mockSetOption = vi.fn();
const mockDispose = vi.fn();

vi.mock("echarts", () => ({
    init: vi.fn(() => ({
        setOption: mockSetOption,
        dispose: mockDispose
    }))
}));

// Mock radar-config : on contrôle les valeurs retournées pour des assertions précises
vi.mock("pages/dashboards/applications/RadarChart/radar-config", () => ({
    pickSixAxisScores: vi.fn((app: AppForRadar) => {
        // Retourne des scores fixes par application pour garder les tests déterministes
        if (app.applicationName === "App1") return [4, 3, 2, 5, 1, 4];
        if (app.applicationName === "App2") return [2, 4, 3, 1, 5, 2];
        return [0, 0, 0, 0, 0, 0];
    }),
    avgArrays: vi.fn((rows: number[][]) => {
        if (rows.length === 0) return [0, 0, 0, 0, 0, 0];
        const len = rows[0].length;
        return Array.from(
            { length: len },
            (_, i) => rows.reduce((sum, r) => sum + r[i], 0) / rows.length
        );
    }),
    scoreToLetter: vi.fn((val: number) => {
        if (val >= 4.5) return "A";
        if (val >= 3.5) return "B";
        if (val >= 2.5) return "C";
        if (val >= 1.5) return "D";
        return "E";
    })
}));

// ---------------------------------------------------------------------------
// Données de test partagées
// ---------------------------------------------------------------------------

const mockApp: AppForRadar = {
    applicationName: "App1",
    lettreQualiteGenerale: "A",
    lettreNiveauCve: "B",
    distanceNote: "A",
    lettreFiabilite: "B",
    lettreGreen: "C",
    maturite: "B",
    domaineFonc: "Finance"
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
        domaineFonc: "Finance"
    }
];

/** Helper : retourne la dernière option passée à setOption */
function getCapturedOption() {
    const calls = mockSetOption.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    return calls[calls.length - 1][0];
}

// ---------------------------------------------------------------------------

describe("RadarQualiteChart", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // -----------------------------------------------------------------------
    describe("Rendu de base", () => {
        it("devrait rendre le conteneur du graphique", () => {
            render(<RadarQualiteChart app={mockApp} population={mockPopulation} title="Radar Test" />);
            expect(screen.getByTestId("radar-chart-container")).toBeInTheDocument();
        });

        it("devrait initialiser echarts avec le conteneur DOM", () => {
            render(<RadarQualiteChart app={mockApp} population={mockPopulation} title="Radar Test" />);
            const container = screen.getByTestId("radar-chart-container");
            expect(echarts.init).toHaveBeenCalledWith(container);
        });

        it("devrait appeler setOption au montage", () => {
            render(<RadarQualiteChart app={mockApp} population={mockPopulation} />);
            expect(mockSetOption).toHaveBeenCalledTimes(1);
        });

        it("devrait appeler dispose au démontage", () => {
            const { unmount } = render(<RadarQualiteChart app={mockApp} population={mockPopulation} />);
            unmount();
            expect(mockDispose).toHaveBeenCalledTimes(1);
        });

        it("devrait afficher l'indice d'utilisation de la légende", () => {
            render(<RadarQualiteChart app={mockApp} population={mockPopulation} />);
            expect(screen.getByText(/Cliquez sur les carrés de la légende/i)).toBeInTheDocument();
        });
    });

    // -----------------------------------------------------------------------
    describe("Option ECharts — title", () => {
        it("devrait inclure le titre quand la prop title est fournie", () => {
            render(<RadarQualiteChart app={mockApp} population={mockPopulation} title="Mon radar" />);
            const option = getCapturedOption();
            expect(option.title).toBeDefined();
            expect(option.title.text).toBe("Mon radar");
            expect(option.title.left).toBe("center");
        });

        it("devrait omettre le titre quand la prop title est absente", () => {
            render(<RadarQualiteChart app={mockApp} population={mockPopulation} />);
            const option = getCapturedOption();
            expect(option.title).toBeUndefined();
        });
    });

    // -----------------------------------------------------------------------
    describe("Option ECharts — tooltip", () => {
        it("devrait configurer le trigger sur 'item'", () => {
            render(<RadarQualiteChart app={mockApp} population={mockPopulation} />);
            const { tooltip } = getCapturedOption();
            expect(tooltip.trigger).toBe("item");
        });

        it("devrait définir une fonction formatter", () => {
            render(<RadarQualiteChart app={mockApp} population={mockPopulation} />);
            const { tooltip } = getCapturedOption();
            expect(typeof tooltip.formatter).toBe("function");
        });

        it("le formatter devrait retourner '' si params.value est absent", () => {
            render(<RadarQualiteChart app={mockApp} population={mockPopulation} />);
            const { formatter } = getCapturedOption().tooltip;
            expect(formatter({ seriesName: "App1" })).toBe("");
        });

        it("le formatter devrait retourner '' si params.value n'est pas un tableau", () => {
            render(<RadarQualiteChart app={mockApp} population={mockPopulation} />);
            const { formatter } = getCapturedOption().tooltip;
            expect(formatter({ seriesName: "App1", value: 42 })).toBe("");
        });

        it("le formatter devrait inclure le nom de la série en titre", () => {
            render(<RadarQualiteChart app={mockApp} population={mockPopulation} />);
            const { formatter } = getCapturedOption().tooltip;
            const html = formatter({ seriesName: "App1", value: [4, 3, 2, 5, 1, 4] });
            expect(html).toContain("App1");
        });

        it("le formatter devrait afficher les 6 axes avec leur label", () => {
            render(<RadarQualiteChart app={mockApp} population={mockPopulation} />);
            const { formatter } = getCapturedOption().tooltip;
            const html = formatter({ seriesName: "App1", value: [4, 3, 2, 5, 1, 4] });

            const expectedLabels = [
                "Maturité Cloud",
                "Sécurité",
                "Freq MEP",
                "Fiabilité",
                "Green IT",
                "Qualité"
            ];
            expectedLabels.forEach(label => {
                expect(html).toContain(label);
            });
        });

        it("le formatter devrait afficher les valeurs avec 2 décimales", () => {
            render(<RadarQualiteChart app={mockApp} population={mockPopulation} />);
            const { formatter } = getCapturedOption().tooltip;
            const html = formatter({ seriesName: "App1", value: [4, 3, 2, 5, 1, 4] });

            // Les valeurs entières doivent s'afficher avec .00
            expect(html).toContain("4.00");
            expect(html).toContain("3.00");
        });

        it("le formatter devrait afficher la lettre correspondant à chaque score", () => {
            render(<RadarQualiteChart app={mockApp} population={mockPopulation} />);
            const { formatter } = getCapturedOption().tooltip;
            // [4, 3, 2, 5, 1, 4] → scoreToLetter mock : B, C, D, A, E, B
            const html = formatter({ seriesName: "App1", value: [4, 3, 2, 5, 1, 4] });
            expect(html).toContain("(B)"); // 4 → B
            expect(html).toContain("(A)"); // 5 → A
            expect(html).toContain("(E)"); // 1 → E
        });
    });

    // -----------------------------------------------------------------------
    describe("Option ECharts — radar & séries", () => {
        it("devrait définir 6 indicateurs avec max à 5", () => {
            render(<RadarQualiteChart app={mockApp} population={mockPopulation} />);
            const { radar } = getCapturedOption();
            expect(radar.indicator).toHaveLength(6);
            radar.indicator.forEach((ind: { name: string; max: number }) => {
                expect(ind.max).toBe(5);
            });
        });

        it("devrait nommer les 6 axes dans le bon ordre", () => {
            render(<RadarQualiteChart app={mockApp} population={mockPopulation} />);
            const { radar } = getCapturedOption();
            const names = radar.indicator.map((i: { name: string }) => i.name);
            expect(names).toEqual([
                "Maturité Cloud",
                "Sécurité",
                "Freq MEP",
                "Fiabilité",
                "Green IT",
                "Qualité"
            ]);
        });

        it("devrait produire 3 séries : application, moyenne globale, moyenne domaine", () => {
            render(<RadarQualiteChart app={mockApp} population={mockPopulation} />);
            const { series } = getCapturedOption();
            expect(series).toHaveLength(3);
            const names = series.map((s: { name: string }) => s.name);
            expect(names).toContain("App1");
            expect(names).toContain("Moyenne globale");
            expect(names).toContain("Moyenne domaine");
        });

        it("devrait utiliser le nom de l'application dans la légende", () => {
            render(<RadarQualiteChart app={mockApp} population={mockPopulation} />);
            const { legend } = getCapturedOption();
            expect(legend.data).toContain("App1");
            expect(legend.data).toContain("Moyenne globale");
            expect(legend.data).toContain("Moyenne domaine");
        });

        it("devrait fournir les données appData dans la première série", () => {
            render(<RadarQualiteChart app={mockApp} population={mockPopulation} />);
            const { series } = getCapturedOption();
            expect(series[0].data[0].value).toEqual([4, 3, 2, 5, 1, 4]);
        });
    });

    // -----------------------------------------------------------------------
    describe("Comportement avec population vide", () => {
        it("devrait rendre sans erreur avec une population vide", () => {
            render(<RadarQualiteChart app={mockApp} population={[]} />);
            expect(screen.getByTestId("radar-chart-container")).toBeInTheDocument();
        });

        it("devrait produire des moyennes à zéro quand la population est vide", () => {
            render(<RadarQualiteChart app={mockApp} population={[]} />);
            const { series } = getCapturedOption();
            expect(series[1].data[0].value).toEqual([0, 0, 0, 0, 0, 0]);
            expect(series[2].data[0].value).toEqual([0, 0, 0, 0, 0, 0]);
        });
    });
});
