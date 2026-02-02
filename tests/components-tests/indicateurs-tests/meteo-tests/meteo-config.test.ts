/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as meteoConfig from "../../../../src/pages/indicateurs/meteo/meteo-config";
import { handleExportCsv } from "utils/exportCsv";
import type { Application } from "todos-api/client.gen";
import type { MRT_Cell, MRT_Row } from "material-react-table";
import type { MeteoIndicateur } from "models/indicateurs";
import { generateAriaLabelCell } from "utils/accessibility-functions";

// ----- Mocks -----
vi.mock("utils/exportCsv", () => ({
    handleExportCsv: vi.fn(),
    escapeCsvValue: vi.fn((value: string) => `"${value.replaceAll('"', '""')}"`)
}));

const mockApp: Application[] = [
    {
        appName: "App1",
        domaineFonctionnel: "F1",
        domaineSndi: "D1",
        sndi: "S1",
        idApplication: 1
    }
];

// ----- Données -----
const mockMeteos = [
    {
        idApplication: 1,
        appName: "App1",
        sndi: "S1",
        domaineSndi: "D1",
        date: "2026-01-05",
        valeurMeteo: 5,
        commentaire: "ok"
    },
    {
        idApplication: 1,
        appName: "App1",
        sndi: "S1",
        domaineSndi: "D1",
        date: "2026-02-05",
        valeurMeteo: 10
    },
    {
        idApplication: 2,
        appName: "App2",
        sndi: "S2",
        domaineSndi: "D2",
        date: "2026-01-15",
        valeurMeteo: null,
        commentaire: ""
    }
];

describe("meteo-config.ts", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("converts date to month key correctly", () => {
        expect(meteoConfig.toMonthKey("2026-01-05")).toBe("2026-01");
        expect(meteoConfig.toMonthKey("2026-12-31")).toBe("2026-12");
    });

    it("creates month range correctly", () => {
        const range = meteoConfig.monthRange("2026-01", "2026-03");
        expect(range).toEqual(["2026-01", "2026-02", "2026-03"]);
    });

    it("calculates month array from meteos", () => {
        const months = meteoConfig.month(mockMeteos as any);
        expect(months).toEqual(["2026-01", "2026-02"]);
    });

    it("builds meteo rows correctly", () => {
        const allMonths = ["2026-01", "2026-02"];
        const domaine = meteoConfig.buildDomaineFoncMap(mockApp);
        const result = meteoConfig.buildMeteo(mockMeteos as any, allMonths, domaine);

        expect(result.length).toBe(2);
        expect(result[0].applicationName).toBe("App1");
        expect(result[0].byMonth["2026-01"][0].valeur).toBe(5);
        expect(result[0].byMonth["2026-02"][0].valeur).toBe(10);
        expect(result[1].byMonth["2026-01"][0].valeur).toBe(-1);
        expect(result[1].byMonth["2026-02"]).toEqual([]);
    });

    it("creates columns including month columns", () => {
        const columns = meteoConfig.columnsMeteo(["2026-01", "2026-02"]);

        expect(columns[0].header).toBe("Nom");
    });
    it("doit générer un aria-label month columns", () => {
        const columns = meteoConfig.columnsMeteo(["2026-01"]);
        const colContributeur = columns.find(c => c.accessorKey === "Par mois")!;
        const props =
            typeof colContributeur.muiTableBodyCellProps === "function"
                ? colContributeur.muiTableBodyCellProps({
                      cell: {
                          getValue: () => [
                              {
                                  date: "2026-01-12",
                                  valeur: 4,
                                  commentaire: "oui"
                              }
                          ]
                      } as unknown as MRT_Cell<MeteoIndicateur, unknown>,
                      column: {} as any,
                      row: {
                          original: {
                              applicationName: "App1"
                          }
                      } as MRT_Row<MeteoIndicateur>,
                      table: {} as any
                  })
                : colContributeur.muiTableBodyCellProps;

        expect(props!["aria-label"]).toBe(generateAriaLabelCell("Météo de janv. 2026", "App1", "4"));
    });

    it("calls handleExportCsv correctly in onExport", () => {
        const mockTable: any = {
            getPrePaginationRowModel: () => ({
                rows: [
                    {
                        original: {
                            applicationName: "App1",
                            sndi: "S1",
                            domaine: "D1",
                            byMonth: { "2026-01": [{ valeur: "5" }] }
                        }
                    },
                    {
                        original: {
                            applicationName: "App2",
                            sndi: "S2",
                            domaine: "D2",
                            byMonth: { "2026-01": [{ valeur: "NR" }] }
                        }
                    }
                ]
            })
        };

        meteoConfig.onExport(mockTable);
        expect(handleExportCsv).toHaveBeenCalled();
        const [filename, , csvData] = (handleExportCsv as any).mock.calls[0];
        expect(filename).toBe("meteo-mensuel");
        expect(csvData.length).toBe(2);
        expect(csvData[0]).toContain("App1");
    });

    it("onExport does nothing if no rows", () => {
        const emptyTable: any = { getPrePaginationRowModel: () => ({ rows: [] }) };
        meteoConfig.onExport(emptyTable);
        expect(handleExportCsv).not.toHaveBeenCalled();
    });
});
