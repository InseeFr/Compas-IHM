/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    OnExport,
    columnsTable,
    formatApplicationSecurite,
    formatModuleSecurite
} from "components/indicateurs/securite/securiteConfig";
import { handleExportCsv } from "utils/exportCsv";
import type { Application, Module, IndicateurSecuriteView } from "todos-api/client.gen";
import type { MRT_Row } from "material-react-table";
import type { SecuriteIndicateur } from "models/indicateurs";

vi.mock("utils/exportCsv", () => ({
    handleExportCsv: vi.fn(),
    flattenRows: vi.fn((rows: MRT_Row<SecuriteIndicateur>[]) => {
        const flatten = (arr: MRT_Row<SecuriteIndicateur>[]): MRT_Row<SecuriteIndicateur>[] => {
            return arr.flatMap((row: MRT_Row<SecuriteIndicateur>) => [
                row,
                ...(row.subRows ? flatten(row.subRows) : [])
            ]);
        };
        return flatten(rows);
    })
}));

const mockApp: Application = {
    idApplication: 1,
    appName: "App1",
    sndi: "S1",
    domaineSndi: "D1"
};

const mockSecuriteApp: IndicateurSecuriteView = {
    applicationId: 1,
    nbCveCritical: "5",
    nbCveHigh: "10",
    nbCveMedium: "15",
    nbCveLow: "20",
    lettreCve: "B",
    nbVmNonMaj: "3",
    lettreMajVm: "C",
    delaiVmNonMiseAjour: "45",
    lettreGlobaleSecurite: "B",
    lettreGlobale: "B"
};

const mockModule: Module = {
    id: 1,
    modName: "Mod1",
    appName: "App1",
    sndi: "S1",
    domaineSndi: "D1"
};

const mockSecuriteModule: IndicateurSecuriteView = {
    moduleId: 1,
    nbCveCritical: "2",
    nbCveHigh: "4",
    nbCveMedium: "6",
    nbCveLow: "8",
    lettreCve: "A",
    nbVmNonMaj: "1",
    lettreMajVm: "A",
    delaiVmNonMiseAjour: "20",
    lettreGlobaleSecurite: "A",
    lettreGlobale: "A"
};

describe("formatApplicationSecurite", () => {
    it("doit formater correctement une application", () => {
        const resultat = formatApplicationSecurite(mockApp, mockSecuriteApp);

        expect(resultat).toEqual({
            applicationId: 1,
            applicationName: "App1",
            sndi: "S1",
            domaine: "D1",
            domaineFonc: "NR",
            nbCveCritical: "5",
            nbCveHigh: "10",
            nbCveMedium: "15",
            nbCveLow: "20",
            lettreCve: "B",
            lettreNiveauCve: "B",
            nbVmNonMaj: "3",
            lettreMajVm: "C",
            delaiVmNonMiseAjour: "45",
            lettreGlobaleSecurite: "B",
            lettreGlobale: "B",
            isModule: false
        });
    });

    it("doit gérer les données manquantes avec NR", () => {
        const resultat = formatApplicationSecurite(mockApp);

        expect(resultat.nbCveCritical).toBe("NR");
        expect(resultat.nbCveHigh).toBe("NR");
        expect(resultat.lettreCve).toBe("NR");
        expect(resultat.nbVmNonMaj).toBe("NR");
    });
});

describe("formatModuleSecurite", () => {
    it("doit formater correctement un module", () => {
        const resultat = formatModuleSecurite(mockModule, mockSecuriteModule);

        expect(resultat).toEqual({
            moduleId: 1,
            applicationName: "Mod1",
            sndi: "S1",
            domaine: "D1",
            domaineFonc: "NR",
            nbCveCritical: "2",
            nbCveHigh: "4",
            nbCveMedium: "6",
            nbCveLow: "8",
            lettreCve: "A",
            lettreNiveauCve: "A",
            nbVmNonMaj: "1",
            lettreMajVm: "A",
            delaiVmNonMiseAjour: "20",
            lettreGlobaleSecurite: "A",
            lettreGlobale: "A",
            parentApplication: "App1",
            isModule: true
        });
    });

    it("doit gérer les données manquantes avec NR", () => {
        const resultat = formatModuleSecurite(mockModule);

        expect(resultat.nbCveCritical).toBe("NR");
        expect(resultat.lettreCve).toBe("NR");
        expect(resultat.isModule).toBe(true);
        expect(resultat.parentApplication).toBe("App1");
    });
});

describe("columnsTable", () => {
    it("doit générer les colonnes avec les bons intitulés", () => {
        const colonnes = columnsTable();

        expect(colonnes.map(c => c.header)).toEqual([
            "Nom",
            "serviceDev",
            "CVE",
            "nb de VMs hors délai",
            "Max delai Maj VM"
        ]);

        const cveCol = colonnes.find(c => c.accessorKey === "lettreNiveauCve");
        expect(cveCol?.Cell).toBeDefined();

        const vmCol = colonnes.find(c => c.accessorKey === "lettreMajVm");
        expect(vmCol?.Cell).toBeDefined();
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
                    { original: formatApplicationSecurite(mockApp, mockSecuriteApp), subRows: [] },
                    { original: formatModuleSecurite(mockModule, mockSecuriteModule), subRows: [] }
                ]
            })
        };

        OnExport(mockTable);

        expect(handleExportCsv).toHaveBeenCalledTimes(1);
        const [nomFichier, entetes, csvData] = (handleExportCsv as any).mock.calls[0];

        expect(nomFichier).toBe("sécurité");
        expect(entetes).toBeDefined();
        expect(Array.isArray(entetes)).toBe(true);

        expect(csvData).toEqual([
            `"App1","","S1","D1","B","5","10","15","20","3","C","45","B","B"`,
            `"App1","Mod1","S1","D1","A","2","4","6","8","1","A","20","A","A"`
        ]);
    });
});
