/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleExportCsv } from "utils/exportCsv";
import type { GreenITIndicateur } from "models/indicateurs";
import type { MRT_Cell, MRT_Row, MRT_TableInstance } from "material-react-table";
import { formatIndicateur, onExport, columnsGreenIt, filteredViewMode } from "pages/indicateurs/greenIT/greenItConfig";
import { generateAriaLabelCell } from "utils/accessibility-functions";

// ----- Mock handleExportCsv -----
vi.mock("utils/exportCsv", () => ({
    handleExportCsv: vi.fn(),
    escapeCsvValue: vi.fn((value: string) => `"${value.replaceAll('"', '""')}"`)
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
                            domaineFonc: "DF1",
                            lettreGreen: "A",
                            consoGlobal: "1000",
                            consoNormalized: "C",
                            impactNormalized: "D",
                            gaspillage: "B",
                            nbVMGlobal: "10",
                            cpuAllocatedGlobal: "2000",
                            ramAllocatedGlobal: "3000",
                            diskAllocatedGlobal: "4000",
                            nbVMProd: "8",
                            cpuAllocatedProd: "1800",
                            ramAllocatedProd: "2800",
                            diskAllocatedProd: "3800",
                            consoProd: "900"
                        }
                    },
                    {
                        original: {
                            applicationName: "App2",
                            sndi: "S2",
                            domaine: "D2",
                            domaineFonc: "DF2",
                            lettreGreen: undefined,
                            consoGlobal: undefined,
                            consoNormalized: undefined,
                            impactNormalized: undefined,
                            gaspillage: undefined,
                            nbVMGlobal: undefined,
                            cpuAllocatedGlobal: undefined,
                            ramAllocatedGlobal: undefined,
                            diskAllocatedGlobal: undefined,
                            nbVMProd: undefined,
                            cpuAllocatedProd: undefined,
                            ramAllocatedProd: undefined,
                            diskAllocatedProd: undefined,
                            consoProd: undefined
                        }
                    }
                ]
            })
        } as unknown as MRT_TableInstance<GreenITIndicateur>;

        onExport(table);

        expect(handleExportCsv).toHaveBeenCalledTimes(1);

        const [filename, , csvData] = vi.mocked(handleExportCsv).mock.calls[0];

        expect(filename).toBe("green-it");
        expect(Array.isArray(csvData)).toBe(true);

        expect(csvData).toEqual([
            `"App1","S1","D1","DF1","A","1000","C","D","B","10","2000","2000","3000","3000","4000","4000","8","1800","1800","2800","2800","3800","3800","900"`,
            `"App2","S2","D2","DF2","NR","NR","NR","NR","NR","NR","NR","NR","NR","NR","NR","NR","NR","NR","NR","NR","NR","NR","NR","NR"`
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

        expect(props!["aria-label"]).toBe(generateAriaLabelCell("consommation électrique VM (Wh)", "App1", "100"));
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

        expect(props!["aria-label"]).toBe(generateAriaLabelCell("CPU réservée VM (Ghz)", "App1", "1000"));
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

        expect(props!["aria-label"]).toBe(generateAriaLabelCell("RAM réservée VM (Go)", "App1", "50"));
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

        expect(props!["aria-label"]).toBe(generateAriaLabelCell("stockage réservé VM (Go)", "App1", "50"));
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

describe("GreenIT - filteredViewMode", () => {
    const mockData: GreenITIndicateur[] = [
        {
            applicationName: "App1",
            sndi: "S1",
            domaine: "D1",
            domaineFonc: "DF1",
            consoGlobal: "1000",
            consoProd: "900",
            cpuAllocatedGlobal: "2000",
            cpuAllocatedProd: "1800",
            ramAllocatedGlobal: "3000",
            ramAllocatedProd: "2800",
            diskAllocatedGlobal: "4000",
            diskAllocatedProd: "3800",
            nbVMGlobal: "10",
            nbVMProd: "8",
            cpuUsed: "1000",
            cpuUsedProd: "900",
            ramUsed: "2000",
            ramUsedProd: "1900",
            diskUsed: "3000",
            diskUsedProd: "2900",
            s3Used: "500",
            s3UsedProd: "450",
            pvcUsed: "600",
            pvcUsedProd: "550",
            nbPodMaxi: "20",
            nbPodMaxiProd: "18",
            ramMaxi: "NR",
            cpuMaxi: "NR",
            ramMaxiProd: "NR",
            cpuMaxiProd: "NR",
            lettreGreen: "A",
            gaspillage: "B",
            consoNormalized: "C",
            impactNormalized: "D",
            isModule: false
        }
    ];

    it("retourne les données globales en mode global", () => {
        const result = filteredViewMode("global", mockData);

        expect(result).toHaveLength(1);
        expect(result[0]._consoSort).toBe(1000);
        expect(result[0]._nbVmSort).toBe(10);
    });

    it("retourne les données prod en mode prod", () => {
        const result = filteredViewMode("prod", mockData);

        expect(result).toHaveLength(1);
        expect(result[0]._consoSort).toBe(900);
        expect(result[0]._nbVmSort).toBe(8);
    });

    it("retourne la différence en mode horsprod", () => {
        const result = filteredViewMode("horsprod", mockData);

        expect(result).toHaveLength(1);
        expect(result[0]._consoSort).toBe(100); 
        expect(result[0]._nbVmSort).toBe(2);    
    });

    it("formate correctement cpuUsed en heures", () => {
        const result = filteredViewMode("global", mockData);

        expect(result[0].cpuUsed).not.toBe("NR");
    });
});

describe("GreenIT - formatIndicateur avec nouveaux champs", () => {
    const mockApps = [
        { appName: "App1", sndi: "S1", domaineSndi: "D1" }
    ];

    const mockGreenItData = [
        {
            applicationName: "App1",
            cpuUsed: "1000",
            ramUsed: "2000",
            diskUsed: "3000",
            s3Used: "500",
            pvcUsed: "600",
            nbPodMaxi: "20",
            cpuUsedProd: "900",
            ramUsedProd: "1900",
            diskUsedProd: "2900",
            s3UsedProd: "450",
            pvcUsedProd: "550",
            nbPodMaxiProd: "18",
            ramMaxi: "4000",
            cpuMaxi: "5000",
            ramMaxiProd: "3800",
            cpuMaxiProd: "4800"
        }
    ];

    it("formate correctement les nouveaux champs Kube et VM", () => {
        const result = formatIndicateur(mockApps, mockGreenItData);

        expect(result[0]).toEqual(
            expect.objectContaining({
                cpuUsed: "1000",
                ramUsed: "2000",
                diskUsed: "3000",
                s3Used: "500",
                pvcUsed: "600",
                nbPodMaxi: "20",
                ramMaxi: "4000",
                cpuMaxi: "5000"
            })
        );
    });
});

describe("Colonnes Accessibilité", () => {
    const colonnes = columnsGreenIt();
    it("doit générer un aria-label CPU Max", () => {
        const colonne = colonnes.find(c => c.accessorKey === "_cpuMaxiSort")!;
        if (!colonne) return;
        const props = typeof colonne.muiTableBodyCellProps === "function"
            ? colonne.muiTableBodyCellProps({
                cell: { getValue: () => "5000" } as unknown as MRT_Cell<GreenITIndicateur, unknown>,
                column: {} as never,
                row: { original: { applicationName: "App1" } } as MRT_Row<GreenITIndicateur>,
                table: {} as never
            })
            : colonne.muiTableBodyCellProps;
        expect(props!["aria-label"]).toBe(generateAriaLabelCell("CPU maxi (GHz)", "App1", "5000"));
    });

    it("doit générer un aria-label CPU Utilisé Kube", () => {
        const colonne = colonnes.find(c => c.accessorKey === "_cpuUsedSort")!;
        if (!colonne) return;
        const props = typeof colonne.muiTableBodyCellProps === "function"
            ? colonne.muiTableBodyCellProps({
                cell: { getValue: () => "1000" } as unknown as MRT_Cell<GreenITIndicateur, unknown>,
                column: {} as never,
                row: { original: { applicationName: "App1" } } as MRT_Row<GreenITIndicateur>,
                table: {} as never
            })
            : colonne.muiTableBodyCellProps;
        expect(props!["aria-label"]).toBe(generateAriaLabelCell("CPU utilisée Kube (heure)", "App1", "1000"));
    });

    it("doit générer un aria-label RAM Utilisée Kube", () => {
        const colonne = colonnes.find(c => c.accessorKey === "_ramUsedSort")!;
        if (!colonne) return;
        const props = typeof colonne.muiTableBodyCellProps === "function"
            ? colonne.muiTableBodyCellProps({
                cell: { getValue: () => "2000" } as unknown as MRT_Cell<GreenITIndicateur, unknown>,
                column: {} as never,
                row: { original: { applicationName: "App1" } } as MRT_Row<GreenITIndicateur>,
                table: {} as never
            })
            : colonne.muiTableBodyCellProps;
        expect(props!["aria-label"]).toBe(generateAriaLabelCell("RAM utilisée Kube (Go)", "App1", "2000"));
    });

    it("doit générer un aria-label Disque Utilisé", () => {
        const colonne = colonnes.find(c => c.accessorKey === "_diskUsedSort")!;
        if (!colonne) return;
        const props = typeof colonne.muiTableBodyCellProps === "function"
            ? colonne.muiTableBodyCellProps({
                cell: { getValue: () => "3000" } as unknown as MRT_Cell<GreenITIndicateur, unknown>,
                column: {} as never,
                row: { original: { applicationName: "App1" } } as MRT_Row<GreenITIndicateur>,
                table: {} as never
            })
            : colonne.muiTableBodyCellProps;
        expect(props!["aria-label"]).toBe(generateAriaLabelCell("Stockage utilisé VM (Go)", "App1", "3000"));
    });

    it("doit générer un aria-label S3 Utilisé", () => {
        const colonne = colonnes.find(c => c.accessorKey === "_s3UsedSort")!;
        if (!colonne) return;
        const props = typeof colonne.muiTableBodyCellProps === "function"
            ? colonne.muiTableBodyCellProps({
                cell: { getValue: () => "500" } as unknown as MRT_Cell<GreenITIndicateur, unknown>,
                column: {} as never,
                row: { original: { applicationName: "App1" } } as MRT_Row<GreenITIndicateur>,
                table: {} as never
            })
            : colonne.muiTableBodyCellProps;
        expect(props!["aria-label"]).toBe(generateAriaLabelCell("Stockage utilisé S3 (Go)", "App1", "500"));
    });

    it("doit générer un aria-label PVC Utilisé", () => {
        const colonne = colonnes.find(c => c.accessorKey === "_pvcUsedSort")!;
        if (!colonne) return;
        const props = typeof colonne.muiTableBodyCellProps === "function"
            ? colonne.muiTableBodyCellProps({
                cell: { getValue: () => "600" } as unknown as MRT_Cell<GreenITIndicateur, unknown>,
                column: {} as never,
                row: { original: { applicationName: "App1" } } as MRT_Row<GreenITIndicateur>,
                table: {} as never
            })
            : colonne.muiTableBodyCellProps;
        expect(props!["aria-label"]).toBe(generateAriaLabelCell("Stockage utilisé Kube (Go)", "App1", "600"));
    });

    it("doit générer un aria-label Nombre de POD", () => {
        const colonne = colonnes.find(c => c.accessorKey === "_nbPodMaxiSort")!;
        if (!colonne) return;
        const props = typeof colonne.muiTableBodyCellProps === "function"
            ? colonne.muiTableBodyCellProps({
                cell: { getValue: () => "20" } as unknown as MRT_Cell<GreenITIndicateur, unknown>,
                column: {} as never,
                row: { original: { applicationName: "App1" } } as MRT_Row<GreenITIndicateur>,
                table: {} as never
            })
            : colonne.muiTableBodyCellProps;
        expect(props!["aria-label"]).toBe(generateAriaLabelCell("Nombre (maxi) de POD", "App1", "20"));
    });
});