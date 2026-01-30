/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { OnExport, columnsTable, formatIndicateur } from "pages/indicateurs/qualité/qualiteConfig";
import { handleExportCsv } from "utils/exportCsv";
import type { IndicateurQualiteView } from "todos-api/client.gen";
import type { QualiteIndicateur } from "models/indicateurs";
import type { MRT_Cell, MRT_Row } from "material-react-table";
import { generateAriaLabelCell } from "utils/accessibility-functions";

vi.mock("utils/exportCsv", () => ({
    handleExportCsv: vi.fn(),
    flattenRows: vi.fn(rows => {
        const flatten = (arr: any[]): any[] => {
            return arr.flatMap((row: any) => [row, ...(row.subRows ? flatten(row.subRows) : [])]);
        };
        return flatten(rows);
    }),
    getName: vi.fn(row => `"${row.original.applicationName}"`)
}));

const mockApp: IndicateurQualiteView = {
    applicationId: 1,
    applicationName: "App1",
    sndi: "S1",
    domaineSndi: "D1",
    domaineFonctionnel: "NR",
    lettreCouvertureTestUniaire: "A",
    lettreFiabilite: "B",
    lettreDetteTechnique: "C",
    pourcentageCouvertureTestUniaire: "50%",
    lettreGlobalQualite: "G",
    detteTechnique: "123.00"
};

const mockModule: IndicateurQualiteView = {
    moduleName: "Mod1",
    applicationName: "App1",
    sndi: "S1",
    domaineSndi: "D1",
    domaineFonctionnel: "NR",
    lettreCouvertureTestUniaire: "X",
    lettreFiabilite: "Y",
    lettreDetteTechnique: "Z",
    pourcentageCouvertureTestUniaire: "75%",
    lettreGlobalQualite: "H",
    detteTechnique: "456.00"
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
            lettreCouvertureTestUniaire: "A",
            lettreFiabilite: "B",
            lettreDetteTechnique: "C",
            pourcentageCouvertureTestUnitaire: "50%",
            lettreQualiteGenerale: "G",
            detteTechnique: "123"
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
            lettreCouvertureTestUniaire: "X",
            lettreFiabilite: "Y",
            lettreDetteTechnique: "Z",
            pourcentageCouvertureTestUnitaire: "75%",
            parentApplication: "App1",
            isModule: true,
            lettreQualiteGenerale: undefined,
            detteTechnique: "456"
        });
    });
});

describe("columnsTable", () => {
    it("doit générer les colonnes avec les bons intitulés", () => {
        const colonnes = columnsTable();
        expect(colonnes.map(c => c.header)).toEqual([
            "Nom",
            "serviceDev",
            "Couverture de Test",
            "Fiabilité",
            "Dette Technique"
        ]);
        const couvertureCol = colonnes.find(c => c.accessorKey === "lettreCouvertureTestUniaire");
        expect(couvertureCol?.Cell).toBeDefined();
    });
    it("doit générer un aria-label Couverture", () => {
        const colContributeur = columnsTable().find(
            c => c.accessorKey === "lettreCouvertureTestUniaire"
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
        expect(csvData).toEqual([`"App1","S1","A","B","C"`, `"Mod1","S1","X","Y","Z"`]);
    });
});
