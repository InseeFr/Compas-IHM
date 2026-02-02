/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import type { GlobalIndicator } from "models/indicateurs";
import {
    columnsGlobal,
    paginationConfig,
    sortHelper
} from "pages/indicateurs/main-indicator/main-config";
import type { MRT_Cell, MRT_Row } from "material-react-table";
import { generateAriaLabelCell } from "utils/accessibility-functions";

describe("paginationConfig", () => {
    it("définit la configuration de pagination par défaut", () => {
        expect(paginationConfig).toEqual({
            pagination: {
                pageIndex: 0,
                pageSize: 30
            }
        });
    });

    it("commence à la première page", () => {
        expect(paginationConfig.pagination.pageIndex).toBe(0);
    });

    it("affiche 30 éléments par page", () => {
        expect(paginationConfig.pagination.pageSize).toBe(30);
    });
});

describe("columnsGlobal", () => {
    const columns = columnsGlobal();

    it("retourne un tableau de 9 colonnes", () => {
        expect(columns).toHaveLength(9);
    });

    describe("colonne Nom", () => {
        const nomColumn = columns[0];

        it("utilise accessorKey 'applicationName'", () => {
            expect(nomColumn.accessorKey).toBe("applicationName");
        });

        it("a le header 'Nom'", () => {
            expect(nomColumn.header).toBe("Nom");
        });

        it("n'a pas de Cell personnalisée", () => {
            expect(nomColumn.Cell).toBeUndefined();
        });
        it("doit générer un aria-label appName", () => {
            const colContributeur = columns.find(c => c.accessorKey === "applicationName")!;
            const props =
                typeof colContributeur.muiTableBodyCellProps === "function"
                    ? colContributeur.muiTableBodyCellProps({
                          cell: {
                              getValue: () => "App1"
                          } as unknown as MRT_Cell<GlobalIndicator, unknown>,
                          column: {} as any,
                          row: {
                              original: {
                                  applicationName: "App1"
                              }
                          } as MRT_Row<GlobalIndicator>,
                          table: {} as any
                      })
                    : colContributeur.muiTableBodyCellProps;

            expect(props!["aria-label"]).toBe("Application: App1");
        });
    });

    describe("colonne serviceDev", () => {
        const sndiColumn = columns[1];

        it("utilise accessorKey 'sndi'", () => {
            expect(sndiColumn.accessorKey).toBe("sndi");
        });

        it("a le header 'serviceDev'", () => {
            expect(sndiColumn.header).toBe("Service dev.");
        });
        it("doit générer un aria-label servicedev", () => {
            const colContributeur = columns.find(c => c.accessorKey === "sndi")!;
            const props =
                typeof colContributeur.muiTableBodyCellProps === "function"
                    ? colContributeur.muiTableBodyCellProps({
                          cell: {
                              getValue: () => "S1"
                          } as unknown as MRT_Cell<GlobalIndicator, unknown>,
                          column: {} as any,
                          row: {
                              original: {
                                  applicationName: "App1"
                              }
                          } as MRT_Row<GlobalIndicator>,
                          table: {} as any
                      })
                    : colContributeur.muiTableBodyCellProps;

            expect(props!["aria-label"]).toBe(generateAriaLabelCell("Service SNDI", "App1", "S1"));
        });
    });

    describe("colonne Qualité", () => {
        const qualityColumn = columns[2];

        it("utilise accessorKey 'lettreQualiteGenerale'", () => {
            expect(qualityColumn.accessorKey).toBe("lettreQualiteGenerale");
        });

        it("a le header 'Qualité'", () => {
            expect(qualityColumn.header).toBe("Qualité");
        });

        it("a une Cell personnalisée QualityCell", () => {
            expect(qualityColumn.Cell).toBeDefined();
            expect(qualityColumn.Cell?.name).toBe("QualityCell");
        });
        it("doit générer un aria-label qualité", () => {
            const colContributeur = columns.find(c => c.accessorKey === "lettreQualiteGenerale")!;
            const props =
                typeof colContributeur.muiTableBodyCellProps === "function"
                    ? colContributeur.muiTableBodyCellProps({
                          cell: {
                              getValue: () => "A"
                          } as unknown as MRT_Cell<GlobalIndicator, unknown>,
                          column: {} as any,
                          row: {
                              original: {
                                  applicationName: "App1"
                              }
                          } as MRT_Row<GlobalIndicator>,
                          table: {} as any
                      })
                    : colContributeur.muiTableBodyCellProps;

            expect(props!["aria-label"]).toBe(generateAriaLabelCell("Qualité globale", "App1", "A"));
        });
    });

    describe("colonne Sécurité", () => {
        const securityColumn = columns[3];

        it("utilise accessorKey 'lettreGlobaleSecurite'", () => {
            expect(securityColumn.accessorKey).toBe("lettreGlobaleSecurite");
        });

        it("a le header 'Sécurité'", () => {
            expect(securityColumn.header).toBe("Sécurité");
        });

        it("a une Cell personnalisée SecurityCell", () => {
            expect(securityColumn.Cell).toBeDefined();
            expect(securityColumn.Cell?.name).toBe("SecurityCell");
        });
        it("doit générer un aria-label Securite", () => {
            const colContributeur = columns.find(c => c.accessorKey === "lettreGlobaleSecurite")!;
            const props =
                typeof colContributeur.muiTableBodyCellProps === "function"
                    ? colContributeur.muiTableBodyCellProps({
                          cell: {
                              getValue: () => "C"
                          } as unknown as MRT_Cell<GlobalIndicator, unknown>,
                          column: {} as any,
                          row: {
                              original: {
                                  applicationName: "App1"
                              }
                          } as MRT_Row<GlobalIndicator>,
                          table: {} as any
                      })
                    : colContributeur.muiTableBodyCellProps;

            expect(props!["aria-label"]).toBe(generateAriaLabelCell("Sécurité globale", "App1", "C"));
        });
    });

    describe("colonne DevOps", () => {
        const devopsColumn = columns[4];

        it("utilise accessorKey 'lettreDistanceCount'", () => {
            expect(devopsColumn.accessorKey).toBe("lettreDistanceCount");
        });

        it("a un id personnalisé 'devopsSort'", () => {
            expect(devopsColumn.id).toBe("devopsSort");
        });

        it("a le header 'DevOps'", () => {
            expect(devopsColumn.header).toBe("DevOps");
        });

        it("a une Cell personnalisée DevopsCell", () => {
            expect(devopsColumn.Cell).toBeDefined();
            expect(devopsColumn.Cell?.name).toBe("DevopsCell");
        });

        it("a un accessorFn qui combine lettre et count", () => {
            expect(devopsColumn.accessorFn).toBeDefined();

            const mockRow: GlobalIndicator = {
                lettreDistanceCount: "B",
                distanceCount: 5
            } as any;

            const result = devopsColumn.accessorFn?.(mockRow);
            expect(result).toBe("B-5");
        });

        it("doit générer un aria-label Devops", () => {
            const colContributeur = columns.find(c => c.accessorKey === "lettreDistanceCount")!;
            const props =
                typeof colContributeur.muiTableBodyCellProps === "function"
                    ? colContributeur.muiTableBodyCellProps({
                          cell: {
                              getValue: () => "C"
                          } as unknown as MRT_Cell<GlobalIndicator, unknown>,
                          column: {} as any,
                          row: {
                              original: {
                                  applicationName: "App1"
                              }
                          } as MRT_Row<GlobalIndicator>,
                          table: {} as any
                      })
                    : colContributeur.muiTableBodyCellProps;

            expect(props!["aria-label"]).toBe(generateAriaLabelCell("Devops globale", "App1", "C"));
        });
    });

    describe("colonne GreenIt", () => {
        const greenItColumn = columns[5];

        it("utilise accessorKey 'lettreGreen'", () => {
            expect(greenItColumn.accessorKey).toBe("lettreGreen");
        });

        it("a le header 'GreenIt'", () => {
            expect(greenItColumn.header).toBe("GreenIt");
        });

        it("a une Cell personnalisée GreenItCell", () => {
            expect(greenItColumn.Cell).toBeDefined();
            expect(greenItColumn.Cell?.name).toBe("GreenItCell");
        });
        it("doit générer un aria-label green", () => {
            const colContributeur = columns.find(c => c.accessorKey === "lettreGreen")!;
            const props =
                typeof colContributeur.muiTableBodyCellProps === "function"
                    ? colContributeur.muiTableBodyCellProps({
                          cell: {
                              getValue: () => "B"
                          } as unknown as MRT_Cell<GlobalIndicator, unknown>,
                          column: {} as any,
                          row: {
                              original: {
                                  applicationName: "App1"
                              }
                          } as MRT_Row<GlobalIndicator>,
                          table: {} as any
                      })
                    : colContributeur.muiTableBodyCellProps;

            expect(props!["aria-label"]).toBe(generateAriaLabelCell("GreenIt global", "App1", "B"));
        });
    });

    describe("colonne Météo ressentie", () => {
        const meteoColumn = columns[6];

        it("utilise accessorKey 'meteo'", () => {
            expect(meteoColumn.accessorKey).toBe("meteo");
        });

        it("a le header 'Météo ressentie'", () => {
            expect(meteoColumn.header).toBe("Météo ressentie");
        });

        it("a une Cell personnalisée MeteoCell", () => {
            expect(meteoColumn.Cell).toBeDefined();
            expect(meteoColumn.Cell?.name).toBe("MeteoCell");
        });
        it("doit générer un aria-label meteo", () => {
            const colContributeur = columns.find(c => c.accessorKey === "meteo")!;
            const props =
                typeof colContributeur.muiTableBodyCellProps === "function"
                    ? colContributeur.muiTableBodyCellProps({
                          cell: {
                              getValue: () => "4"
                          } as unknown as MRT_Cell<GlobalIndicator, unknown>,
                          column: {} as any,
                          row: {
                              original: {
                                  applicationName: "App1"
                              }
                          } as MRT_Row<GlobalIndicator>,
                          table: {} as any
                      })
                    : colContributeur.muiTableBodyCellProps;

            expect(props!["aria-label"]).toBe(generateAriaLabelCell("Météo globale", "App1", "4"));
        });
    });

    describe("colonne Accessibilité", () => {
        const a11yColumn = columns[7];

        it("utilise accessorKey 'lettreA11y'", () => {
            expect(a11yColumn.accessorKey).toBe("lettreA11y");
        });

        it("a le header 'Accessibilité'", () => {
            expect(a11yColumn.header).toBe("Accessibilité");
        });

        it("a une Cell personnalisée A11yCell", () => {
            expect(a11yColumn.Cell).toBeDefined();
            expect(a11yColumn.Cell?.name).toBe("A11yCell");
        });
        it("doit générer un aria-label a11y", () => {
            const colContributeur = columns.find(c => c.accessorKey === "lettreA11y")!;
            const props =
                typeof colContributeur.muiTableBodyCellProps === "function"
                    ? colContributeur.muiTableBodyCellProps({
                          cell: {
                              getValue: () => "NR"
                          } as unknown as MRT_Cell<GlobalIndicator, unknown>,
                          column: {} as any,
                          row: {
                              original: {
                                  applicationName: "App1"
                              }
                          } as MRT_Row<GlobalIndicator>,
                          table: {} as any
                      })
                    : colContributeur.muiTableBodyCellProps;

            expect(props!["aria-label"]).toBe(
                generateAriaLabelCell("Accessibilité globale", "App1", "NR")
            );
        });
    });

    describe("colonne Maturité Cloud", () => {
        const maturityColumn = columns[8];

        it("utilise accessorKey 'maturite'", () => {
            expect(maturityColumn.accessorKey).toBe("maturite");
        });

        it("a le header 'Maturité Cloud'", () => {
            expect(maturityColumn.header).toBe("Maturité Cloud");
        });

        it("a une Cell personnalisée MaturityCell", () => {
            expect(maturityColumn.Cell).toBeDefined();
            expect(maturityColumn.Cell?.name).toBe("MaturityCell");
        });
        it("doit générer un aria-label maturité", () => {
            const colContributeur = columns.find(c => c.accessorKey === "maturite")!;
            const props =
                typeof colContributeur.muiTableBodyCellProps === "function"
                    ? colContributeur.muiTableBodyCellProps({
                          cell: {
                              getValue: () => "NR"
                          } as unknown as MRT_Cell<GlobalIndicator, unknown>,
                          column: {} as any,
                          row: {
                              original: {
                                  applicationName: "App1"
                              }
                          } as MRT_Row<GlobalIndicator>,
                          table: {} as any
                      })
                    : colContributeur.muiTableBodyCellProps;

            expect(props!["aria-label"]).toBe(generateAriaLabelCell("Maturité globale", "App1", "NR"));
        });
    });

    describe("ordre des colonnes", () => {
        it("respecte l'ordre défini", () => {
            const headers = columns.map(col => col.header);
            expect(headers).toEqual([
                "Nom",
                "Service dev.",
                "Qualité",
                "Sécurité",
                "DevOps",
                "GreenIt",
                "Météo ressentie",
                "Accessibilité",
                "Maturité Cloud"
            ]);
        });
    });

    describe("types de colonnes", () => {
        it("a 2 colonnes texte simples", () => {
            const simpleColumns = columns.filter(col => !col.Cell);
            expect(simpleColumns).toHaveLength(2);
        });

        it("a 7 colonnes avec Cell personnalisée", () => {
            const customCellColumns = columns.filter(col => col.Cell);
            expect(customCellColumns).toHaveLength(7);
        });

        it("a 1 colonne avec accessorFn personnalisé", () => {
            const customAccessorColumns = columns.filter(col => col.accessorFn);
            expect(customAccessorColumns).toHaveLength(1);
        });
    });

    describe("accessorFn DevOps - cas limites", () => {
        const devopsColumn = columns[4];

        it("gère les valeurs à zéro", () => {
            const mockRow: GlobalIndicator = {
                lettreDistanceCount: "A",
                distanceCount: 0
            } as any;

            const result = devopsColumn.accessorFn?.(mockRow);
            expect(result).toBe("A-0");
        });

        it("gère les grandes valeurs", () => {
            const mockRow: GlobalIndicator = {
                lettreDistanceCount: "E",
                distanceCount: 999
            } as any;

            const result = devopsColumn.accessorFn?.(mockRow);
            expect(result).toBe("E-999");
        });

        it("gère les lettres vides", () => {
            const mockRow: GlobalIndicator = {
                lettreDistanceCount: "",
                distanceCount: 10
            } as any;

            const result = devopsColumn.accessorFn?.(mockRow);
            expect(result).toBe("-10");
        });
    });
});
describe("sortHelper sans mock", () => {
    const makeRow = (original: any) => ({ original });

    it("place les dates expirées avant les non-expirées", () => {
        const now = new Date();

        const oldDate = new Date();
        oldDate.setDate(now.getDate() - 32);
        const recentDate = new Date();
        recentDate.setDate(now.getDate() - 10);

        const a = makeRow({ dateMeteoCommentaire: oldDate.toISOString() });
        const b = makeRow({ dateMeteoCommentaire: recentDate.toISOString() });

        expect((sortHelper as any)(a, b)).toBe(-1);
        expect((sortHelper as any)(b, a)).toBe(1);
    });

    it("compare correctement les valeurs meteo numériques", () => {
        const a = makeRow({ dateMeteoCommentaire: "2026-01-01", meteo: 2 });
        const b = makeRow({ dateMeteoCommentaire: "2026-01-01", meteo: 5 });

        expect((sortHelper as any)(a, b)).toBeLessThan(0);
        expect((sortHelper as any)(b, a)).toBeGreaterThan(0);
    });
});
