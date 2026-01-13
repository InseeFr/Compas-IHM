/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { OnExport, columnsTable, formatIndicateur } from "components/indicateurs/a11y/a11yConfig";
import { handleExportCsv } from "utils/exportCsv";
import type { IndicateursModuleA11Y } from "todos-api/client.gen";
import type { MRT_Row } from "material-react-table";
import type { A11yIndicateur } from "models/indicateurs";

vi.mock("utils/exportCsv", () => ({
    handleExportCsv: vi.fn(),
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
    nbIssueAccessibilite: "5.00"
};

const mockModule2: IndicateursModuleA11Y = {
    modName: "Module2",
    sndi: "S2",
    domaineSndi: "D2",
    notation: "C",
    lettreIssueAccessibilite: "D",
    nbIssueAccessibilite: "10"
};

describe("formatIndicateur", () => {
    it("doit formater correctement un module A11y", () => {
        const resultat = formatIndicateur(mockModule);

        expect(resultat).toEqual({
            modName: "Module1",
            sndi: "S1",
            domaine: "D1",
            domaineFonc: "NR",
            notation: "A",
            lettreIssueAccessibilite: "B",
            nbIssueAccessibilite: "5"
        });
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
            "Nom du module",
            "serviceDev",
            "Notation Évaluation",
            "Issue Sonar"
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
        expect(Array.isArray(entetes)).toBe(true);

        expect(csvData).toEqual([`"Module1","S1","D1","A","B","5"`, `"Module2","S2","D2","C","D","10"`]);
    });

    it("doit exporter correctement avec des valeurs manquantes", () => {
        const mockIncomplete = {
            modName: "Module3",
            sndi: "S3",
            domaine: "D3",
            notation: undefined,
            lettreIssueAccessibilite: undefined,
            nbIssueAccessibilite: undefined
        };

        const mockTable: any = {
            getExpandedRowModel: () => ({
                rows: [{ original: mockIncomplete, subRows: [] }]
            })
        };

        OnExport(mockTable);

        expect(handleExportCsv).toHaveBeenCalledTimes(1);
        const [, , csvData] = (handleExportCsv as any).mock.calls[0];

        expect(csvData).toEqual([`"Module3","S3","D3","","NR","NR"`]);
    });
});
