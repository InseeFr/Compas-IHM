/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { columnsTable, formatIndicateur, onExport } from "pages/indicateurs/devops/devopsConfig";
import { handleExportCsv } from "utils/exportCsv";
import type { DevopsIndicateur } from "models/indicateurs";
import type { MRT_Cell, MRT_Row, MRT_TableInstance } from "material-react-table";
import { generateAriaLabelCell } from "utils/accessibility-functions";

// ----- Mock handleExportCsv et flattenRows -----
vi.mock("utils/exportCsv", () => ({
    handleExportCsv: vi.fn(),
    escapeCsvValue: vi.fn((value: string) => `"${value}"`), // ✅ Ajout de escapeCsvValue
    flattenRows: vi.fn(rows => {
        const flatten = (arr: any[]): any[] => {
            return arr.flatMap((row: any) => [row, ...(row.subRows ? flatten(row.subRows) : [])]);
        };
        return flatten(rows);
    }),
    getName: vi.fn(row => `"${row.original.applicationName}"`)
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
                            domaineFonc: "DF1",
                            lettreContributorCount: "A",
                            lettreDeploymentCount: "B",
                            lettreDistanceCount: "C",
                            lettreGlobalDevops: "A",
                            distanceCount: "10",
                            isModule: false
                        },
                        subRows: []
                    },
                    {
                        original: {
                            applicationName: "App2",
                            sndi: "S2",
                            domaine: "D2",
                            domaineFonc: "DF2",
                            lettreContributorCount: "X",
                            lettreDeploymentCount: "Y",
                            lettreDistanceCount: "Z",
                            lettreGlobalDevops: "B",
                            distanceCount: "20",
                            isModule: true
                        },
                        subRows: [
                            {
                                original: {
                                    applicationName: "bk",
                                    sndi: "S2",
                                    domaine: "D2",
                                    domaineFonc: "DF2",
                                    lettreDeploymentCount: "B",
                                    lettreDistanceCount: "C",
                                    lettreGlobalDevops: "C",
                                    distanceCount: "15",
                                    parentApplication: "App2",
                                    isModule: true
                                }
                            }
                        ]
                    }
                ]
            })
        } as unknown as MRT_TableInstance<DevopsIndicateur>;

        onExport(table);

        expect(handleExportCsv).toHaveBeenCalledTimes(1);

        // Vérifier les arguments de handleExportCsv
        const callArgs = vi.mocked(handleExportCsv).mock.calls[0];
        const [filename, tableArg, csvData, headers] = callArgs;

        expect(filename).toBe("devops");
        expect(tableArg).toBe(table);
        expect(headers).toBeDefined();
        expect(Array.isArray(headers)).toBe(true);
        expect(Array.isArray(csvData)).toBe(true);

        // Avec la nouvelle fonction onExport complète, on a plus de colonnes
        // Les données CSV contiennent maintenant :
        // Nom app, Nom module, SNDI, Domaine, Domaine Fonc, Contributeur, NbMEP, DernièreMEP, Niveau Fraicheur, Distance
        expect(csvData).toHaveLength(3); // 3 lignes (App1, App2, bk)

        // Vérifier qu'on a bien les bonnes données dans les lignes CSV
        expect(csvData[0]).toContain("App1"); // Application
        expect(csvData[0]).toContain("S1"); // SNDI
        expect(csvData[1]).toContain("App2"); // Module (nom dans colonne module)
        expect(csvData[2]).toContain("bk"); // Sous-module
    });
});

describe("Colonnes", () => {
    const colonnes = columnsTable();
    beforeEach(() => {
        return colonnes;
    });

     it("doit générer un aria-label Contributeur", () => {
         const colContributeur = colonnes.find(c => c.accessorKey === "lettreContributorCount")!;
         const props =
             typeof colContributeur.muiTableBodyCellProps === "function"
                 ? colContributeur.muiTableBodyCellProps({
                       cell: {
                           getValue: () => "A"
                       } as unknown as MRT_Cell<DevopsIndicateur, unknown>,
                       column: {} as any,
                       row: {
                           original: {
                               applicationName: "App1"
                           }
                       } as MRT_Row<DevopsIndicateur>,
                       table: {} as any
                   })
                 : colContributeur.muiTableBodyCellProps;

         expect(props!["aria-label"]).toBe(generateAriaLabelCell("Note Contributeur", "App1", "A"));
     });
    it("doit générer un aria-label Deployment", () => {
        const colContributeur = colonnes.find(c => c.accessorKey === "lettreDeploymentCount")!;
        const props =
            typeof colContributeur.muiTableBodyCellProps === "function"
                ? colContributeur.muiTableBodyCellProps({
                      cell: {
                          getValue: () => "A"
                      } as unknown as MRT_Cell<DevopsIndicateur, unknown>,
                      column: {} as any,
                      row: {
                          original: {
                              applicationName: "App1"
                          }
                      } as MRT_Row<DevopsIndicateur>,
                      table: {} as any
                  })
                : colContributeur.muiTableBodyCellProps;

        expect(props!["aria-label"]).toBe(generateAriaLabelCell("Note de déploiement", "App1", "A"));
    });
    it("doit générer un aria-label DistanceCount", () => {
        const colContributeur = colonnes.find(c => c.accessorKey === "lettreDistanceCount")!;
        const props =
            typeof colContributeur.muiTableBodyCellProps === "function"
                ? colContributeur.muiTableBodyCellProps({
                      cell: {
                          getValue: () => "A"
                      } as unknown as MRT_Cell<DevopsIndicateur, unknown>,
                      column: {} as any,
                      row: {
                          original: {
                              applicationName: "App1"
                          }
                      } as MRT_Row<DevopsIndicateur>,
                      table: {} as any
                  })
                : colContributeur.muiTableBodyCellProps;

        expect(props!["aria-label"]).toBe(generateAriaLabelCell("Note de distance", "App1", "A"));
    });
});
