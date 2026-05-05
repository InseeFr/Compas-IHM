/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { OnExport, columnsTable, formatIndicateur } from "pages/indicateurs/qualité/qualiteConfig";
import { handleExportCsv } from "utils/exportCsv";
import type { QualiteIndicateur } from "models/indicateurs";
import type { MRT_Cell, MRT_Row } from "material-react-table";
import { generateAriaLabelCell } from "utils/accessibility-functions";

vi.mock("utils/exportCsv", () => ({
    handleExportCsv: vi.fn(),
    escapeCsvValue: vi.fn((value: string) => `"${value.replaceAll('"', '""')}"`),
    flattenRows: vi.fn(rows => {
        const flatten = (arr: any[]): any[] => {
            return arr.flatMap((row: any) => [row, ...(row.subRows ? flatten(row.subRows) : [])]);
        };
        return flatten(rows);
    }),
    getName: vi.fn(row => `"${row.original.applicationName}"`)
}));

const mockApp = {
    applicationId: 1,
    applicationName: "App1",
    sndi: "S1",
    domaineSndi: "D1",
    domaineFonctionnel: "NR",
    lettreCouvertureTestUnitaire: "A",
    lettreFiabilite: "B",
    lettreDetteTechnique: "C",
    pourcentageCouvertureTestUnitaire: "50%",
    lettreGlobalQualite: "G",
    detteTechnique: "123.00",
    tendanceDetteTechnique: "flat",
    tendanceFiabilite: "flat",
    tendanceTestUnitaire: "flat",
    pourcentageCouvertureTestUnitairePast: "NR"
};

const mockModule = {
    moduleName: "Mod1",
    applicationName: "App1",
    sndi: "S1",
    domaineSndi: "D1",
    domaineFonctionnel: "NR",
    lettreCouvertureTestUnitaire: "X",
    lettreFiabilite: "Y",
    lettreDetteTechnique: "Z",
    pourcentageCouvertureTestUnitaire: "75%",
    lettreGlobalQualite: "H",
    detteTechnique: "456.00",
    tendanceDetteTechnique: "flat",
    tendanceFiabilite: "flat",
    tendanceTestUnitaire: "flat",
    pourcentageCouvertureTestUnitairePast: "NR"
};

describe("formatIndicateur", () => {
    it("doit formater correctement une application", () => {
        const resultat = formatIndicateur(mockApp, false);
        expect(resultat).toEqual({
            applicationId: 1,
            applicationName: "App1",
            sndi: "S1",
            domaine: "D1",
            domaineFonc: "NR",
            lettreCouvertureTestUnitaire: "A",
            lettreFiabilite: "B",
            lettreDetteTechnique: "C",
            pourcentageCouvertureTestUnitaire: "50%",
            lettreQualiteGenerale: "G",
            detteTechnique: "123",
            tendanceDetteTechnique: "flat",
            tendanceFiabilite: "flat",
            tendanceTestUnitaire: "flat",
            pourcentageCouvertureTestUnitairePast: "NR"
        });
    });

    it("doit formater correctement un module", () => {
        const resultat = formatIndicateur(mockModule, true);
        expect(resultat).toEqual({
            applicationId: undefined,
            applicationName: "Mod1",
            sndi: "S1",
            domaine: "D1",
            domaineFonc: "NR",
            lettreCouvertureTestUnitaire: "X",
            lettreFiabilite: "Y",
            lettreDetteTechnique: "Z",
            pourcentageCouvertureTestUnitaire: "75%",
            pourcentageCouvertureTestUnitairePast: "NR",
            parentApplication: "App1",
            isModule: true,
            lettreQualiteGenerale: undefined,
            detteTechnique: "456",
            tendanceDetteTechnique: "flat",
            tendanceFiabilite: "flat",
            tendanceTestUnitaire: "flat"
        });
    });
});

describe("columnsTable", () => {
    it("doit générer les colonnes avec les bons intitulés", () => {
        const colonnes = columnsTable();
        expect(colonnes.map(c => c.header)).toEqual([
            "Nom",
            "Service dev.",
            "Couverture de Test",
            "Fiabilité",
            "Dette Technique"
        ]);
        const couvertureCol = colonnes.find(c => c.accessorKey === "lettreCouvertureTestUnitaire");
        expect(couvertureCol?.Cell).toBeDefined();
    });
    it("doit générer un aria-label Couverture", () => {
        const colContributeur = columnsTable().find(
            c => c.accessorKey === "lettreCouvertureTestUnitaire"
        )!;
        const props =
            typeof colContributeur.muiTableBodyCellProps === "function"
                ? colContributeur.muiTableBodyCellProps({
                      cell: {
                          getValue: () => "NR"
                      } as unknown as MRT_Cell<QualiteIndicateur, unknown>,
                      column: {} as any,
                      row: {
                          original: {
                              applicationName: "App1"
                          }
                      } as MRT_Row<QualiteIndicateur>,
                      table: {} as any
                  })
                : colContributeur.muiTableBodyCellProps;

        expect(props!["aria-label"]).toBe(
            generateAriaLabelCell("Couverture Test Unitaire", "App1", "NR")
        );
    });
    it("doit générer un aria-label Fiabilité", () => {
        const colContributeur = columnsTable().find(c => c.accessorKey === "lettreFiabilite")!;
        const props =
            typeof colContributeur.muiTableBodyCellProps === "function"
                ? colContributeur.muiTableBodyCellProps({
                      cell: {
                          getValue: () => "E"
                      } as unknown as MRT_Cell<QualiteIndicateur, unknown>,
                      column: {} as any,
                      row: {
                          original: {
                              applicationName: "App1"
                          }
                      } as MRT_Row<QualiteIndicateur>,
                      table: {} as any
                  })
                : colContributeur.muiTableBodyCellProps;

        expect(props!["aria-label"]).toBe(generateAriaLabelCell("Fiabilité", "App1", "E"));
    });
    it("doit générer un aria-label Dette", () => {
        const colContributeur = columnsTable().find(c => c.accessorKey === "lettreDetteTechnique")!;
        const props =
            typeof colContributeur.muiTableBodyCellProps === "function"
                ? colContributeur.muiTableBodyCellProps({
                      cell: {
                          getValue: () => "C"
                      } as unknown as MRT_Cell<QualiteIndicateur, unknown>,
                      column: {} as any,
                      row: {
                          original: {
                              applicationName: "App1"
                          }
                      } as MRT_Row<QualiteIndicateur>,
                      table: {} as any
                  })
                : colContributeur.muiTableBodyCellProps;

        expect(props!["aria-label"]).toBe(generateAriaLabelCell("Dette technique", "App1", "C"));
    });
});

describe("OnExport", () => {
    it("doit appeler handleExportCsv avec les bonnes données CSV", () => {
        const mockTable: any = {
            getExpandedRowModel: () => ({
                rows: [
                    { original: formatIndicateur(mockApp), subRows: [] },
                    { original: formatIndicateur(mockModule, true), subRows: [] }
                ]
            })
        };

        OnExport(mockTable);

        expect(handleExportCsv).toHaveBeenCalledTimes(1);
        const [nomFichier, entetes, csvData] = (handleExportCsv as any).mock.calls[0];
        expect(nomFichier).toBe("qualité");
        expect(entetes).toBeDefined();

        expect(csvData).toEqual([
            `"App1","S1","D1","NR","A","50%","B","C","123"`,
            `"Mod1","S1","D1","NR","X","75%","Y","Z","456"`
        ]);
    });
});

// ─── formatIndicateur — cas supplémentaires ───────────────────────────────

describe("formatIndicateur — valeurs manquantes", () => {
    it("doit remplacer les champs null par 'NR'", () => {
        const vide = {
            applicationId: 2,
            applicationName: null,
            sndi: null,
            domaineSndi: null,
            domaineFonctionnel: null,
            lettreCouvertureTestUnitaire: null,
            lettreFiabilite: null,
            lettreDetteTechnique: null,
            pourcentageCouvertureTestUnitaire: null,
            lettreGlobalQualite: null,
            detteTechnique: null,
            evolutionCouvertureTestUnitaire: null,
            evolutionDetteTechnique: null,
            evolutionFiabilite: null
        };
        const resultat = formatIndicateur(vide as any, false);
        expect(resultat.applicationName).toBe("NR");
        expect(resultat.sndi).toBe("NR");
        expect(resultat.domaine).toBe("NR");
        expect(resultat.domaineFonc).toBe("NR");
        expect(resultat.lettreCouvertureTestUnitaire).toBe("NR");
        expect(resultat.lettreFiabilite).toBe("NR");
        expect(resultat.lettreDetteTechnique).toBe("NR");
        expect(resultat.detteTechnique).toBe("NR");
        expect(resultat.lettreQualiteGenerale).toBe("NR");
    });

    it("ne doit pas supprimer '.00' si la valeur ne se termine pas par '.00'", () => {
        const item = { ...mockApp, detteTechnique: "456.50" };
        const resultat = formatIndicateur(item as any, false);
        expect(resultat.detteTechnique).toBe("456.50");
    });

    it("doit gérer detteTechnique sans '.00' (valeur entière sans suffixe)", () => {
        const item = { ...mockApp, detteTechnique: "10" };
        const resultat = formatIndicateur(item as any, false);
        expect(resultat.detteTechnique).toBe("10");
    });

    it("doit utiliser 'NR' comme applicationName si moduleName est null en mode module", () => {
        const item = { ...mockModule, moduleName: null };
        const resultat = formatIndicateur(item as any, true);
        expect(resultat.applicationName).toBe("NR");
        expect(resultat.isModule).toBe(true);
        expect(resultat.parentApplication).toBe("App1");
    });

    it("ne doit pas inclure parentApplication ni isModule pour une application", () => {
        const resultat = formatIndicateur(mockApp as any, false);
        expect((resultat as any).isModule).toBeUndefined();
        expect((resultat as any).parentApplication).toBeUndefined();
    });
});

// ─── columnsTable — cas supplémentaires ──────────────────────────────────

describe("columnsTable — structure", () => {
    it("doit contenir exactement 5 colonnes dans le bon ordre", () => {
        const colonnes = columnsTable();
        expect(colonnes).toHaveLength(5);
        expect(colonnes.map(c => c.accessorKey)).toEqual([
            "applicationName",
            "sndi",
            "lettreCouvertureTestUnitaire",
            "lettreFiabilite",
            "lettreDetteTechnique"
        ]);
    });

    it("toutes les colonnes doivent avoir un accessorKey défini", () => {
        columnsTable().forEach(col => {
            expect(col.accessorKey).toBeDefined();
        });
    });
});

// ─── OnExport — cas supplémentaires ──────────────────────────────────────

describe("OnExport — cas limites", () => {
    it("doit produire un CSV vide si la table n'a aucune ligne", () => {
        const mockTableVide: any = {
            getExpandedRowModel: () => ({ rows: [] })
        };
        OnExport(mockTableVide);
        const csvData = (handleExportCsv as any).mock.calls.at(-1)[2];
        expect(csvData).toEqual([]);
    });

    it("doit afficher 'NR' pour les champs absents dans le CSV", () => {
        const appSansData = formatIndicateur(
            {
                applicationId: 3,
                applicationName: "AppVide",
                sndi: null,
                domaineSndi: null,
                domaineFonctionnel: null,
                lettreCouvertureTestUnitaire: null,
                lettreFiabilite: null,
                lettreDetteTechnique: null,
                pourcentageCouvertureTestUnitaire: null,
                lettreGlobalQualite: null,
                detteTechnique: null,
                evolutionCouvertureTestUnitaire: null,
                evolutionDetteTechnique: null,
                evolutionFiabilite: null
            } as any,
            false
        );

        const mockTable: any = {
            getExpandedRowModel: () => ({
                rows: [{ original: appSansData, subRows: [] }]
            })
        };
        OnExport(mockTable);
        const csvData = (handleExportCsv as any).mock.calls.at(-1)[2];
        expect(csvData[0]).toBe(`"AppVide","NR","NR","NR","NR","NR","NR","NR","NR"`);
    });

    it("doit aplatir les subRows et les inclure dans le CSV", () => {
        const mockTable: any = {
            getExpandedRowModel: () => ({
                rows: [
                    {
                        original: formatIndicateur(mockApp as any),
                        subRows: [{ original: formatIndicateur(mockModule as any, true), subRows: [] }]
                    }
                ]
            })
        };
        OnExport(mockTable);
        const csvData = (handleExportCsv as any).mock.calls.at(-1)[2];
        expect(csvData).toHaveLength(2);
        expect(csvData[1]).toContain('"Mod1"');
    });

    it("doit passer le nom de fichier 'qualité'", () => {
        const mockTable: any = {
            getExpandedRowModel: () => ({ rows: [] })
        };
        OnExport(mockTable);
        const nomFichier = (handleExportCsv as any).mock.calls.at(-1)[0];
        expect(nomFichier).toBe("qualité");
    });
});
