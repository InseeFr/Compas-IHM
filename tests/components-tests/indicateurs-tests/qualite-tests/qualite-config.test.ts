/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { OnExport, columnsTable, formatIndicateur } from "components/indicateurs/qualité/qualiteConfig";
import { handleExportCsv } from "utils/exportCsv";
import type { IndicateurQualiteView } from "todos-api/client.gen";

vi.mock("utils/exportCsv", () => ({
    handleExportCsv: vi.fn()
}));

const mockApp: IndicateurQualiteView = {
    applicationId: 1,
    applicationName: "App1",
    sndi: "S1",
    domaineSndi: "D1",
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
            lettreCouvertureTestUniaire: "A",
            lettreFiabilite: "B",
            lettreDetteTechnique: "C",
            pourcentageCouvertureTestUniaire: "50%",
            lettreQualiteGenerale: "G",
            detteTechnique: "123"
        });
    });

    it("doit formater correctement un module", () => {
        const resultat = formatIndicateur(mockModule, true);

        expect(resultat).toEqual({
            applicationName: "Mod1",
            sndi: "S1",
            domaine: "D1",
            lettreCouvertureTestUniaire: "X",
            lettreFiabilite: "Y",
            lettreDetteTechnique: "Z",
            pourcentageCouvertureTestUniaire: "75%",
            parentApplication: "App1",
            isModule: true,
            lettreQualiteGenerale: undefined,
            detteTechnique: "456"
        });
    });
});

describe("columnsTable", () => {
    it("doit générer les colonnes avec les bons intitulés", () => {
        const data = [formatIndicateur(mockApp)];
        const colonnes = columnsTable(data);

        expect(colonnes.map(c => c.header)).toEqual([
            "Nom",
            "Service dev.",
            "Domaine dev.",
            "Couverture de Test",
            "Fiabilité",
            "Dette Technique"
        ]);

        const couvertureCol = colonnes.find(c => c.accessorKey === "lettreCouvertureTestUniaire");
        expect(couvertureCol?.Cell).toBeDefined();
    });
});

describe("OnExport", () => {
    it("doit appeler handleExportCsv avec les bonnes données CSV", () => {
        const mockTable: any = {
            getPrePaginationRowModel: () => ({
                rows: [
                    { original: formatIndicateur(mockApp) },
                    { original: formatIndicateur(mockModule, true) }
                ]
            })
        };

        OnExport(mockTable);

        expect(handleExportCsv).toHaveBeenCalledTimes(1);
        const [nomFichier, entetes, csvData] = (handleExportCsv as any).mock.calls[0];

        expect(nomFichier).toBe("qualité");
        expect(entetes).toBeDefined();
        expect(Array.isArray(entetes)).toBe(true);

        expect(csvData).toEqual([
            `"App1","","S1","D1","A","50%","C","123","B"`,
            `"App1","Mod1","S1","D1","X","75%","Z","456","Y"`
        ]);
    });
});
