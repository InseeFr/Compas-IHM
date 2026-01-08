/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { formatIndicateur, onExport } from "components/indicateurs/devops/devopsConfig";
import { handleExportCsv } from "utils/exportCsv";
import type { DevopsIndicateur } from "models/indicateurs";
import type { MRT_TableInstance } from "material-react-table";
import { HEADERS_DEVOPS } from "constantes/constantes-csv";

// ----- Mock handleExportCsv et flattenRows -----
vi.mock("utils/exportCsv", () => ({
    handleExportCsv: vi.fn(),
    // 👇 Ajouter le mock de flattenRows
    flattenRows: vi.fn(rows => {
        const flatten = (arr: any[]): any[] => {
            return arr.flatMap((row: any) => [row, ...(row.subRows ? flatten(row.subRows) : [])]);
        };
        return flatten(rows);
    })
}));

beforeEach(() => {
    vi.clearAllMocks();
});

// ----- Tests formatIndicateur -----
describe("formatIndicateur", () => {
    it("formate correctement une application", () => {
        const result = formatIndicateur({
            applicationName: "App1",
            sndi: "S1",
            domaineSndi: "D1"
        } as unknown as DevopsIndicateur);
        expect(result).toEqual(
            expect.objectContaining({
                applicationName: "App1",
                sndi: "S1",
                domaine: "D1",
                lettreContributorCount: "NR",
                lettreDeploymentCount: "NR",
                lettreDistanceCount: "NR",
                nbContributorCount: "NR",
                nbDeploymentCount: "NR",
                distanceCount: "NR",
                lettreGlobalDevops: "NR"
            })
        );
        expect(result.isModule).toBeUndefined();
        expect(result.parentApplication).toBeUndefined();
    });

    it("formate correctement un module", () => {
        const result = formatIndicateur(
            {
                applicationName: "App1",
                moduleName: "Mod1",
                sndi: "S1"
            } as unknown as DevopsIndicateur,
            true
        );
        expect(result).toEqual(
            expect.objectContaining({
                applicationName: "Mod1",
                parentApplication: "App1",
                sndi: "S1",
                isModule: true
            })
        );
    });
});

// ----- Tests onExport -----
describe("onExport", () => {
    it("exporte correctement les lignes formatées en CSV", () => {
        const table = {
            getExpandedRowModel: () => ({
                rows: [
                    {
                        original: {
                            applicationName: "App1",
                            sndi: "S1",
                            domaine: "D1",
                            lettreContributorCount: "A",
                            lettreDeploymentCount: "B",
                            lettreDistanceCount: "C",
                            isModule: false
                        },
                        subRows: []
                    },
                    {
                        original: {
                            applicationName: "App2",
                            sndi: "S2",
                            domaine: "D2",
                            lettreContributorCount: "X",
                            lettreDeploymentCount: "Y",
                            lettreDistanceCount: "Z",
                            isModule: true,
                            parentApplication: "AppParent"
                        },
                        subRows: []
                    }
                ]
            })
        } as unknown as MRT_TableInstance<DevopsIndicateur>;

        onExport(table);

        // Vérifie qu'on a bien appelé handleExportCsv
        expect(handleExportCsv).toHaveBeenCalledTimes(1);
        const [filename, headers, csvData] = vi.mocked(handleExportCsv).mock.calls[0];
        expect(filename).toBe("devops");
        expect(headers).toBe(HEADERS_DEVOPS);
        expect(Array.isArray(csvData)).toBe(true);

        // Vérifie le format CSV
        expect(csvData).toEqual([
            `"App1","","S1","D1","A","B","C"`,
            `"AppParent","App2","S2","D2","X","Y","Z"`
        ]);
    });
});
