/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as meteoConfig from "../../../../src/components/indicateurs/meteo/meteo-config";
import { handleExportCsv } from "utils/exportCsv";

// ----- Mocks -----
vi.mock("utils/exportCsv", () => ({
    handleExportCsv: vi.fn()
}));

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
        const result = meteoConfig.buildMeteo(mockMeteos as any, allMonths);

        expect(result.length).toBe(2);
        expect(result[0].applicationName).toBe("App1");
        expect(result[0].byMonth["2026-01"][0].valeur).toBe("5");
        expect(result[0].byMonth["2026-02"][0].valeur).toBe("10");
        expect(result[1].byMonth["2026-01"][0].valeur).toBe("NR");
        expect(result[1].byMonth["2026-02"]).toEqual([]);
    });

    it("creates columns including month columns", () => {
        const meteos = meteoConfig.buildMeteo(mockMeteos as any, ["2026-01", "2026-02"]);
        const columns = meteoConfig.columnsMeteo(meteos, ["2026-01", "2026-02"]);

        expect(columns[0].header).toBe("Nom");
        expect(columns[1].header).toBe("Service dev.");
        expect(columns[2].header).toBe("Domaine dev.");

        expect(columns[3].header).toContain("janv.");
        expect(columns[4].header).toContain("févr.");
        expect(columns[3].Cell).toBeDefined();
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
