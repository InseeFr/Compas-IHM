import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    formatIndicateur,
    onExport,
    paginationConfig,
    columnsTable
} from "pages/indicateurs/strategiecloud/strategieCloud-config";
import type { IndicateurMaturiteView } from "todos-api/client.gen";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("utils/exportCsv", () => ({
    flattenRows: (rows: unknown[]) => rows,
    handleExportCsv: vi.fn(),
    escapeCsvValue: (v: string) => v,
    getBaseValueCSV:vi.fn(row => [
            `"${row.original.isModule ? (row.original.parentApplication ?? "") : row.original.applicationName}"`,
            `"${row.original.isModule ? row.original.applicationName : ""}"`,
            `"${row.original.sndi}"`,
            `"${row.original.domaine}"`,
            `"${row.original.domaineFonc}"`
        ]),
}));

vi.mock("pages/indicateurs/strategiecloud/strategieCloudCell", () => ({
    TauxCloudCell: () => null,
    EnvActuelCell: () => null,
    EnvCibleCell: () => null,
    EcartCibleCell: () => null,
    StrategieCloudCell: () => null,
    CommentaireCell: () => null,
    MaturiteCloudCell: () => null
}));

vi.mock("utils/accessibility-functions", () => ({
    muiAriaCell: vi.fn(() => ({}))
}));

vi.mock("constantes/constantes", () => ({
    BASE_COLONNE: () => [
        { accessorKey: "applicationName", header: "Application" },
        { accessorKey: "sndi", header: "Service" }
    ]
}));

vi.mock("constantes/constantes-headers", () => ({
    BASE_HEADERS: {
        NOM_APPLICATION: "Nom Application",
        NOM_MODULE: "Nom Module",
        SERVICE_DEV: "Service Dev"
    },
    STRATEGIE_CLOUD_HEADERS: {
        TAUX_CLOUD_PRODUCTION: "Taux Cloud Production",
        ENV_ACTUEL_PRODUCTION: "Env Actuel Production",
        ENV_CIBLE_PRODUCTION: "Env Cible Production",
        ECART_CIBLE: "Écart Cible",
        STRATEGIE_CLOUD: "Stratégie Cloud",
        COMMENTAIRE: "Commentaire",
        MATURITE_CLOUD: "Maturité Cloud"
    }
}));

// ─── formatIndicateur ─────────────────────────────────────────────────────────

describe("formatIndicateur", () => {
    const baseItem: IndicateurMaturiteView = {
        isModule: false,
        appName: "MonApp",
        moduleName: "MonModule",
        serviceName: "ServiceDev",
        tauxCloud: "75%",
        envActuelProd: "VM",
        envCibleProd: "Kube",
        ecartCible: "oui",
        stratCloud: "Lift & Shift",
        commentaire: "RAS",
        maturiteCloud: "2",
        idModule: 10,
        idApp: 42,
        domaineDev: "Web",
        domaineFonctionnel: "Finance"
    };

    it("mappe correctement une application (non module)", () => {
        const result = formatIndicateur(baseItem);
        expect(result.applicationName).toBe("MonApp");
        expect(result.sndi).toBe("ServiceDev");
        expect(result.tauxCloud).toBe("75%");
        expect(result.envActuelProd).toBe("VM");
        expect(result.envCibleProd).toBe("Kube");
        expect(result.ecartCible).toBe("oui");
        expect(result.stratCloud).toBe("Lift & Shift");
        expect(result.commentaire).toBe("RAS");
        expect(result.maturiteCloud).toBe("2");
        expect(result.idApp).toBe(42);
        expect(result.idModule).toBe(10);
        expect(result.isModule).toBe(false);
        expect(result.domaine).toBe("Web");
        expect(result.domaineFonc).toBe("Finance");
        expect(result.parentApplication).toBe("MonApp");
    });

    it("utilise moduleName comme applicationName si isModule vaut true", () => {
        const result = formatIndicateur({ ...baseItem, isModule: true });
        expect(result.applicationName).toBe("MonModule");
        expect(result.isModule).toBe(true);
    });

    it("remplace les champs null/undefined par 'NR'", () => {
        const sparse: IndicateurMaturiteView = {
            isModule: false,
            appName: undefined,
            moduleName: undefined,
            serviceName: undefined,
            tauxCloud: undefined,
            envActuelProd: undefined,
            envCibleProd: undefined,
            ecartCible: undefined,
            stratCloud: undefined,
            commentaire: undefined,
            maturiteCloud: undefined,
            idModule: undefined,
            idApp: undefined,
            domaineDev: undefined,
            domaineFonctionnel: undefined
        };
        const result = formatIndicateur(sparse);
        expect(result.applicationName).toBe("NR");
        expect(result.sndi).toBe("NR");
        expect(result.tauxCloud).toBe("NR");
        expect(result.envActuelProd).toBe("NR");
        expect(result.envCibleProd).toBe("NR");
        expect(result.ecartCible).toBe("NR");
        expect(result.stratCloud).toBe("NR");
        expect(result.commentaire).toBe("NR");
        expect(result.maturiteCloud).toBe("NR");
        expect(result.idModule).toBe(-1);
        expect(result.idApp).toBe(-1);
        expect(result.domaine).toBe("NR");
        expect(result.domaineFonc).toBe("NR");
    });

    it("utilise appName pour parentApplication même pour un module", () => {
        const result = formatIndicateur({ ...baseItem, isModule: true, appName: "AppParente" });
        expect(result.parentApplication).toBe("AppParente");
    });
});

// ─── paginationConfig ─────────────────────────────────────────────────────────

describe("paginationConfig", () => {
    it("définit pageIndex à 0 et pageSize à 30", () => {
        expect(paginationConfig.pagination.pageIndex).toBe(0);
        expect(paginationConfig.pagination.pageSize).toBe(30);
    });
});

// ─── columnsTable ─────────────────────────────────────────────────────────────

describe("columnsTable", () => {
    it("retourne les colonnes de base + les 7 colonnes spécifiques", () => {
        const cols = columnsTable();
        // 2 colonnes de base (mockées) + 7 colonnes métier
        expect(cols).toHaveLength(9);
    });

    it("contient les accessorKeys attendus", () => {
        const keys = columnsTable().map(c => c.accessorKey);
        expect(keys).toContain("tauxCloud");
        expect(keys).toContain("envActuelProd");
        expect(keys).toContain("envCibleProd");
        expect(keys).toContain("ecartCible");
        expect(keys).toContain("stratCloud");
        expect(keys).toContain("commentaire");
        expect(keys).toContain("maturiteCloud");
    });
});

// ─── onExport ─────────────────────────────────────────────────────────────────

describe("onExport", () => {
    let handleExportCsvMock: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
        vi.clearAllMocks();
        const mod = await import("utils/exportCsv");
        handleExportCsvMock = mod.handleExportCsv as ReturnType<typeof vi.fn>;
    });

    const makeTable = (rows: object[]) =>
        ({
            getExpandedRowModel: () => ({
                rows: rows.map(original => ({ original, subRows: [] }))
            })
        }) as never;

    it("appelle handleExportCsv avec le bon nom de fichier", () => {
        const table = makeTable([
            {
                applicationName: "AppTest",
                sndi: "Dev",
                tauxCloud: "50%",
                envActuelProd: "VM",
                envCibleProd: "Kube",
                ecartCible: "non",
                stratCloud: "Lift",
                commentaire: "OK",
                maturiteCloud: "3"
            }
        ]);
        onExport(table);
        expect(handleExportCsvMock).toHaveBeenCalledOnce();
        expect(handleExportCsvMock.mock.calls[0][0]).toBe("strategie-cloud");
    });

    it("utilise 'NR' pour les champs null/undefined dans le CSV", () => {
        const table = makeTable([
            {
                applicationName: "AppSansData",
                sndi: null,
                tauxCloud: null,
                envActuelProd: null,
                envCibleProd: null,
                ecartCible: null,
                stratCloud: null,
                commentaire: null,
                maturiteCloud: null
            }
        ]);
        onExport(table);
        const csvRows: string[] = handleExportCsvMock.mock.calls[0][2];
        expect(csvRows[0]).toContain('"NR"');
    });

    it("génère une ligne CSV par ligne de tableau", () => {
        const table = makeTable([
            {
                applicationName: "App1",
                sndi: "S1",
                tauxCloud: "10%",
                envActuelProd: "VM",
                envCibleProd: "Kube",
                ecartCible: "oui",
                stratCloud: "LS",
                commentaire: "C1",
                maturiteCloud: "1"
            },
            {
                applicationName: "App2",
                sndi: "S2",
                tauxCloud: "20%",
                envActuelProd: "Kube",
                envCibleProd: "Kube",
                ecartCible: "non",
                stratCloud: "CN",
                commentaire: "C2",
                maturiteCloud: "2"
            }
        ]);
        onExport(table);
        const csvRows: string[] = handleExportCsvMock.mock.calls[0][2];
        expect(csvRows).toHaveLength(2);
    });

    it("passe les bons headers à handleExportCsv", () => {
        const table = makeTable([]);
        onExport(table);
        const headers: string[] = handleExportCsvMock.mock.calls[0][3];
        expect(headers).toContain("Nom Application");
        expect(headers).toContain("Taux Cloud Production");
        expect(headers).toContain("Maturité Cloud");
    });
});
