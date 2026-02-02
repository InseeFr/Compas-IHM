/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { OnExport, columnsTable, formatIndicateur } from "pages/indicateurs/a11y/a11yConfig";
import { handleExportCsv } from "utils/exportCsv";
import type { IndicateursModuleA11Y } from "todos-api/client.gen";
import type { MRT_Cell, MRT_Row } from "material-react-table";
import type { A11yIndicateur } from "models/indicateurs";
import { generateAriaLabelCell } from "utils/accessibility-functions";

vi.mock("utils/exportCsv", () => ({
    handleExportCsv: vi.fn(),
    escapeCsvValue: vi.fn((value: string) => `"${value.replaceAll('"', '""')}"`),
    flattenRows: vi.fn((rows: MRT_Row<A11yIndicateur>[]) => {
        const flatten = (arr: MRT_Row<A11yIndicateur>[]): MRT_Row<A11yIndicateur>[] => {
            return arr.flatMap((row: MRT_Row<A11yIndicateur>) => [
                row,
                ...(row.subRows ? flatten(row.subRows) : [])
            ]);
        };
        return flatten(rows);
    })
}));

const mockModule: IndicateursModuleA11Y = {
    modName: "Module1",
    sndi: "S1",
    domaineSndi: "D1",
    notation: "A",
    lettreIssueAccessibilite: "B",
    nbIssueAccessibilite: "5.00",
    scoreAudit: 3,
    typeAuditLibelle: "Audit partiel",
    isDeclaration: true,
    dateAudit: "2025-10-12",
    dateDeclaration: "2025-10-11"
};

const mockModule2: IndicateursModuleA11Y = {
    modName: "Module2",
    sndi: "S2",
    domaineSndi: "D2",
    notation: "C",
    lettreIssueAccessibilite: "D",
    nbIssueAccessibilite: "10",
    scoreAudit: 4,
    typeAuditLibelle: "Audit complet",
    isDeclaration: true,
    dateAudit: "2025-10-12",
    dateDeclaration: "2025-10-11"
};

describe("formatIndicateur", () => {
    it("doit formater correctement un module A11y", () => {
        const resultat = formatIndicateur(mockModule);
        const actual: A11yIndicateur = {
            modName: "Module1",
            sndi: "S1",
            domaine: "D1",
            domaineFonc: "NR",
            notation: "A",
            lettreIssueAccessibilite: "B",
            nbIssueAccessibilite: "5",
            declaration: {
                hasDeclaration: true,
                dateDeclaration: "2025-10-11"
            },
            audit: {
                score: "3",
                auditType: "Audit partiel",
                dateAudit: "2025-10-12"
            }
        };
        expect(resultat).toEqual(actual);
    });

    it("doit supprimer .00 du nombre d'issues", () => {
        const resultat = formatIndicateur(mockModule);
        expect(resultat.nbIssueAccessibilite).toBe("5");

        const resultat2 = formatIndicateur(mockModule2);
        expect(resultat2.nbIssueAccessibilite).toBe("10");
    });

    it("doit gérer les données manquantes avec NR", () => {
        const mockIncomplete: IndicateursModuleA11Y = {
            modName: undefined as any,
            sndi: undefined as any,
            domaineSndi: undefined as any
        };

        const resultat = formatIndicateur(mockIncomplete);

        expect(resultat.modName).toBe("NR");
        expect(resultat.sndi).toBe("NR");
        expect(resultat.domaine).toBe("NR");
        expect(resultat.notation).toBeUndefined();
        expect(resultat.lettreIssueAccessibilite).toBeUndefined();
        expect(resultat.nbIssueAccessibilite).toBeUndefined();
    });
});

describe("columnsTable", () => {
    it("doit générer les colonnes avec les bons intitulés", () => {
        const colonnes = columnsTable();

        expect(colonnes.map(c => c.header)).toEqual([
            "Nom de module",
            "Service dev.",
            "Notation Évaluation",
            "Déclaration",
            "Audit",
            "Problème Sonar"
        ]);

        const issueCol = colonnes.find(c => c.accessorKey === "lettreIssueAccessibilite");
        expect(issueCol?.Cell).toBeDefined();
    });
});

describe("OnExport", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("doit appeler handleExportCsv avec les bonnes données CSV", () => {
        const mockTable: any = {
            getExpandedRowModel: () => ({
                rows: [
                    { original: formatIndicateur(mockModule), subRows: [] },
                    { original: formatIndicateur(mockModule2), subRows: [] }
                ]
            })
        };

        OnExport(mockTable);

        expect(handleExportCsv).toHaveBeenCalledTimes(1);
        const [nomFichier, entetes, csvData] = (handleExportCsv as any).mock.calls[0];

        expect(nomFichier).toBe("accessibilité");
        expect(entetes).toBeDefined();

        expect(csvData).toEqual([
            `"Module1","S1","D1","NR","A","3","Audit partiel","2025-10-12","B","5"`,
            `"Module2","S2","D2","NR","C","4","Audit complet","2025-10-12","D","10"`
        ]);
    });

    it("doit exporter correctement avec des valeurs manquantes", () => {
        const mockIncomplete: A11yIndicateur = {
            modName: "Module3",
            sndi: "S3",
            domaine: "D3",
            notation: undefined,
            lettreIssueAccessibilite: undefined,
            nbIssueAccessibilite: undefined,
            domaineFonc: "",
            declaration: {
                hasDeclaration: true,
                dateDeclaration: "2025-10-11"
            },
            audit: {
                score: "3",
                auditType: "Audit complet",
                dateAudit: "2025-10-12"
            }
        };

        const mockTable: any = {
            getExpandedRowModel: () => ({
                rows: [{ original: mockIncomplete, subRows: [] }]
            })
        };

        OnExport(mockTable);

        expect(handleExportCsv).toHaveBeenCalledTimes(1);
        const [filename, headers, csvData] = (handleExportCsv as any).mock.calls[0];
        expect(filename).toBe("accessibilité");

        expect(headers).toBeDefined();
        expect(csvData).toEqual([
            `"Module3","S3","D3","","NR","3","Audit complet","2025-10-12","NR","NR"`
        ]);
    });

    it("doit générer un aria-label Déclarée avec date", () => {
        const colonnes = columnsTable();

        const col = colonnes.find(c => c.accessorKey === "declaration")!;
        const props =
            typeof col.muiTableBodyCellProps === "function"
                ? col.muiTableBodyCellProps({
                      cell: {
                          getValue: () => ({
                              hasDeclaration: true,
                              dateDeclaration: "2024-10-01"
                          })
                      } as unknown as MRT_Cell<A11yIndicateur, unknown>,
                      column: {} as any,
                      row: {
                          original: {
                              modName: "Mod1"
                          }
                      } as MRT_Row<A11yIndicateur>,
                      table: {} as any
                  })
                : col.muiTableBodyCellProps;

        expect(props!["aria-label"]).toBe(
            generateAriaLabelCell(
                "Déclaration d'audit",
                "Mod1",
                "Déclaration Déclarée, Date: 2024-10-01",
                true
            )
        );
    });
    it("doit générer un aria-label Audit", () => {
        const colonnes = columnsTable();

        const col = colonnes.find(c => c.accessorKey === "audit")!;
        const props =
            typeof col.muiTableBodyCellProps === "function"
                ? col.muiTableBodyCellProps({
                      cell: {
                          getValue: () => ({
                              dateAudit: "2024-10-01",
                              score: "10",
                              auditType: "Audit Complet"
                          })
                      } as unknown as MRT_Cell<A11yIndicateur, unknown>,
                      column: {} as any,
                      row: {
                          original: {
                              modName: "Mod1"
                          }
                      } as MRT_Row<A11yIndicateur>,
                      table: {} as any
                  })
                : col.muiTableBodyCellProps;

        expect(props!["aria-label"]).toBe(
            generateAriaLabelCell(
                "Audit",
                "Mod1",
                "Type d'audit Audit Complet, date: 2024-10-01, score: 10",
                true
            )
        );
    });
});
