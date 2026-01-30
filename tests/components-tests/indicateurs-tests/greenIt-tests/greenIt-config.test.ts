/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleExportCsv } from "utils/exportCsv";
import type { GreenITIndicateur } from "models/indicateurs";
import type { MRT_Cell, MRT_Row, MRT_TableInstance } from "material-react-table";
import { formatIndicateur, onExport, columnsGreenIt } from "pages/indicateurs/greenIT/greenItConfig";
import { generateAriaLabelCell } from "utils/accessibility-functions";

// ----- Mock handleExportCsv -----
vi.mock("utils/exportCsv", () => ({
    handleExportCsv: vi.fn()
}));

beforeEach(() => {
    vi.clearAllMocks();
});

// ----- Tests formatIndicateur -----
describe("GreenIT formatIndicateur", () => {
    const mockApps = [
        { appName: "App1", sndi: "S1", domaineSndi: "D1" },
        { appName: "App2", sndi: "S2", domaineSndi: "D2" }
    ];

    const mockGreenItData = [
        {
            applicationName: "App1",
            conso: "1000",
            cpuAllocated: "2000",
            ramAllocated: "3000",
            diskAllocated: "4000",
            nbVm: "10",
            lettreGreen: "A",
            gaspillageScore: "B",
            consoScore: "C",
            impactScore: "D"
        }
    ];

    it("formatte correctement les applications avec données Green IT", () => {
        const result = formatIndicateur(mockApps, mockGreenItData);

        expect(result).toHaveLength(2);

        // Vérifie le premier élément avec données Green IT
        expect(result[0]).toEqual(
            expect.objectContaining({
                applicationName: "App1",
                sndi: "S1",
                domaine: "D1",
                consoGlobal: "1000",
                cpuAllocatedGlobal: "2000",
                ramAllocatedGlobal: "3000",
                diskAllocatedGlobal: "4000",
                nbVMGlobal: "10",
                lettreGreen: "A",
                gaspillage: "B",
                consoNormalized: "C",
                impactNormalized: "D",
                isModule: false
            })
        );

        // Vérifie le deuxième élément sans données Green IT
        expect(result[1]).toEqual(
            expect.objectContaining({
                applicationName: "App2",
                sndi: "S2",
                domaine: "D2",
                consoGlobal: "NR",
                cpuAllocatedGlobal: "NR",
                ramAllocatedGlobal: "NR",
                diskAllocatedGlobal: "NR",
                nbVMGlobal: "NR",
                lettreGreen: "NR",
                gaspillage: "NR",
                consoNormalized: "NR",
                impactNormalized: "NR",
                isModule: false
            })
        );
    });
});

describe("Green IT - onExport", () => {
    it("exporte correctement les lignes formatées en CSV", () => {
        const table = {
            getPrePaginationRowModel: () => ({
                rows: [
                    {
                        original: {
                            applicationName: "App1",
                            sndi: "S1",
                            domaine: "D1",
                            _conso: "1000",
                            _cpu: "2",
                            _ram: "3",
                            _disk: "4",
                            _nbVm: "10",
                            lettreGreen: "A",
                            gaspillage: "B",
                            consoNormalized: "C",
                            impactNormalized: "D"
                        }
                    },
                    {
                        original: {
                            applicationName: "App2",
                            sndi: "S2",
                            domaine: "D2",
                            _conso: "NR",
                            _cpu: "NR",
                            _ram: "NR",
                            _disk: "NR",
                            _nbVm: "NR",
                            lettreGreen: "NR",
                            gaspillage: "NR",
                            consoNormalized: "NR",
                            impactNormalized: "NR"
                        }
                    }
                ]
            })
        } as unknown as MRT_TableInstance<GreenITIndicateur>;

        onExport(table);

        expect(handleExportCsv).toHaveBeenCalledTimes(1);

        const [filename, headers, csvData] = vi.mocked(handleExportCsv).mock.calls[0];

        expect(filename).toBe("green-it");
        expect(headers).toBeDefined();
        expect(Array.isArray(csvData)).toBe(true);

        expect(csvData).toEqual([
            `"App1","S1","1000","2","3","4","B","10"`,
            `"App2","S2","NR","NR","NR","NR","NR","NR"`
        ]);
    });
});

describe("Colonnes Accessibilité", () => {
    const colonnes = columnsGreenIt();
    it("doit générer un aria-label Conso", () => {
        const colContributeur = colonnes.find(c => c.accessorKey === "_consoSort")!;
        const props =
            typeof colContributeur.muiTableBodyCellProps === "function"
                ? colContributeur.muiTableBodyCellProps({
                      cell: {
                          getValue: () => "100"
                      } as unknown as MRT_Cell<GreenITIndicateur, unknown>,
                      column: {} as any,
                      row: {
                          original: {
                              applicationName: "App1"
                          }
                      } as MRT_Row<GreenITIndicateur>,
                      table: {} as any
                  })
                : colContributeur.muiTableBodyCellProps;

        expect(props!["aria-label"]).toBe(generateAriaLabelCell("Consommation en Watt", "App1", "100"));
    });
    it("doit générer un aria-label Cpu", () => {
        const colContributeur = colonnes.find(c => c.accessorKey === "_cpuSort")!;
        const props =
            typeof colContributeur.muiTableBodyCellProps === "function"
                ? colContributeur.muiTableBodyCellProps({
                      cell: {
                          getValue: () => "1000"
                      } as unknown as MRT_Cell<GreenITIndicateur, unknown>,
                      column: {} as any,
                      row: {
                          original: {
                              applicationName: "App1"
                          }
                      } as MRT_Row<GreenITIndicateur>,
                      table: {} as any
                  })
                : colContributeur.muiTableBodyCellProps;

        expect(props!["aria-label"]).toBe(generateAriaLabelCell("Cpu alloué en Ghz", "App1", "1000"));
    });
    it("doit générer un aria-label Ram", () => {
        const colContributeur = colonnes.find(c => c.accessorKey === "_ramSort")!;
        const props =
            typeof colContributeur.muiTableBodyCellProps === "function"
                ? colContributeur.muiTableBodyCellProps({
                      cell: {
                          getValue: () => "50"
                      } as unknown as MRT_Cell<GreenITIndicateur, unknown>,
                      column: {} as any,
                      row: {
                          original: {
                              applicationName: "App1"
                          }
                      } as MRT_Row<GreenITIndicateur>,
                      table: {} as any
                  })
                : colContributeur.muiTableBodyCellProps;

        expect(props!["aria-label"]).toBe(generateAriaLabelCell("Ram allouée en Go", "App1", "50"));
    });
    it("doit générer un aria-label Disque", () => {
        const colContributeur = colonnes.find(c => c.accessorKey === "_diskSort")!;
        const props =
            typeof colContributeur.muiTableBodyCellProps === "function"
                ? colContributeur.muiTableBodyCellProps({
                      cell: {
                          getValue: () => "50"
                      } as unknown as MRT_Cell<GreenITIndicateur, unknown>,
                      column: {} as any,
                      row: {
                          original: {
                              applicationName: "App1"
                          }
                      } as MRT_Row<GreenITIndicateur>,
                      table: {} as any
                  })
                : colContributeur.muiTableBodyCellProps;

        expect(props!["aria-label"]).toBe(generateAriaLabelCell("Disque alloué en Go", "App1", "50"));
    });

    it("doit générer un aria-label Nombre VM", () => {
        const colContributeur = colonnes.find(c => c.accessorKey === "_nbVmSort")!;
        const props =
            typeof colContributeur.muiTableBodyCellProps === "function"
                ? colContributeur.muiTableBodyCellProps({
                      cell: {
                          getValue: () => "12"
                      } as unknown as MRT_Cell<GreenITIndicateur, unknown>,
                      column: {} as any,
                      row: {
                          original: {
                              applicationName: "App1"
                          }
                      } as MRT_Row<GreenITIndicateur>,
                      table: {} as any
                  })
                : colContributeur.muiTableBodyCellProps;

        expect(props!["aria-label"]).toBe(generateAriaLabelCell("Nombre de VM", "App1", "12"));
    });
});
