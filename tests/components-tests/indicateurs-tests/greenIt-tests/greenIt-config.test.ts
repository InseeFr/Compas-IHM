/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleExportCsv } from "utils/exportCsv";
import type { GreenITIndicateur } from "models/indicateurs";
import type { MRT_Cell, MRT_Row, MRT_TableInstance } from "material-react-table";
import {
    formatIndicateur,
    onExport,
    columnsGreenIt,
    filteredViewMode
} from "pages/indicateurs/greenIT/greenItConfig";
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
describe("GreenIT formatIndicateur - mode Vm", () => {
    const mockVmData: any[] = [
        {
            applicationId: 1,
            applicationName: "App1",
            serviceDev: "S1",
            domaineDev: "D1",
            domaineFonc: "DF1",
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

    it("formatte correctement les applications en mode Vm", () => {
        const result = formatIndicateur([], mockVmData);

        expect(result).toHaveLength(1);

        expect(result[0]).toEqual(
            expect.objectContaining({
                applicationId: 1,
                applicationName: "App1",
                sndi: "S1",
                domaine: "D1",
                domaineFonc: "DF1",
                hasVm: true,
                hasKube: false,
                consoGlobal: "1000",
                consoGlobalHist: "NR",
                consoNormalized: "C",
                consoProd: "NR",
                consoProdHist: "NR",
                cpuAllocatedGlobal: "2000",
                cpuAllocatedGlobalHist: "NR",
                cpuAllocatedProd: "NR",
                cpuAllocatedProdHist: "NR",
                diskAllocatedGlobal: "4000",
                diskAllocatedGlobalHist: "NR",
                diskAllocatedProd: "NR",
                diskAllocatedProdHist: "NR",
                gaspillage: "B",
                impactNormalized: "D",
                isModule: false,
                lettreGreen: "A",
                nbVMGlobal: "10",
                nbVMGlobalHist: "NR",
                nbVMProd: "NR",
                nbVMProdHist: "NR",
                ramAllocatedGlobal: "3000",
                ramAllocatedGlobalHist: "NR",
                ramAllocatedProd: "NR",
                ramAllocatedProdHist: "NR",
                ramMaxi: "NR",
                cpuMaxi: "NR",
                diskUsed: "NR",
                asAllocated: "NR",
                asUsed: "NR"
            })
        );
    });
});

describe("GreenIT formatIndicateur - mode Kube", () => {
    const mockKubeData: any[] = [
        {
            applicationId: 1,
            applicationName: "App1",
            cpuUsed: "1000",
            ramUsed: "2000",
            s3Used: "500",
            pvcUsed: "600",
            nbPodMaxi: "20",
            cpuUsedProd: "900",
            ramUsedProd: "1900",
            s3UsedProd: "450",
            pvcUsedProd: "550",
            nbPodMaxiProd: "18",
            lettreGreen: "A",
            gaspillageScore: "B",
            consoScore: "C",
            impactScore: "D"
        }
    ];

    it("formatte correctement les applications en mode Kube", () => {
        const result = formatIndicateur(mockKubeData, []);

        expect(result).toHaveLength(1);

        expect(result[0]).toEqual(
            expect.objectContaining({
                applicationId: 1,
                applicationName: "App1",
                hasKube: true,
                hasVm: false,
                cpuUsed: "1000",
                ramUsed: "2000",
                s3Used: "500",
                pvcUsed: "600",
                nbPodMaxi: "20",
                cpuUsedProd: "900",
                ramUsedProd: "1900",
                s3UsedProd: "450",
                pvcUsedProd: "550",
                nbPodMaxiProd: "18",
                lettreGreen: "A",
                gaspillage: "B",
                consoNormalized: "C",
                impactNormalized: "D",
                sndi: "NR",
                domaine: "NR",
                domaineFonc: "NR",
                cpuUsedHist: "NR",
                ramUsedHist: "NR",
                s3UsedHist: "NR",
                pvcUsedHist: "NR",
                nbPodMaxiHist: "NR"
            })
        );
    });
});

describe("GreenIT formatIndicateur - fusion Kube + Vm", () => {
    const mockKubeData: any[] = [
        {
            applicationId: 1,
            applicationName: "App1",
            cpuUsed: "1000",
            ramUsed: "2000",
            lettreGreen: "A",
            gaspillageScore: "B",
            consoScore: "C",
            impactScore: "D"
        }
    ];

    const mockVmData: any[] = [
        {
            applicationId: 1,
            applicationName: "App1",
            serviceDev: "S1",
            domaineDev: "D1",
            domaineFonc: "DF1",
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

    it("fusionne les données Kube et Vm pour une même application", () => {
        const result = formatIndicateur(mockKubeData, mockVmData);

        expect(result).toHaveLength(1);

        expect(result[0]).toEqual(
            expect.objectContaining({
                applicationId: 1,
                applicationName: "App1",
                hasKube: true,
                hasVm: true,
                cpuUsed: "1000",
                ramUsed: "2000",
                consoGlobal: "1000",
                cpuAllocatedGlobal: "2000",
                ramAllocatedGlobal: "3000",
                diskAllocatedGlobal: "4000",
                nbVMGlobal: "10"
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

describe("GreenIT - filteredViewMode", () => {
    const mockData: GreenITIndicateur[] = [
        {
            applicationName: "App1",
            sndi: "S1",
            domaine: "D1",
            domaineFonc: "DF1",
            consoGlobal: "1000",
            consoProd: "900",
            consoHp: "100",
            cpuAllocatedGlobal: "2000",
            cpuAllocatedProd: "1800",
            cpuAllocatedHp: "200",
            ramAllocatedGlobal: "3000",
            ramAllocatedProd: "2800",
            ramAllocatedHp: "200",
            diskAllocatedGlobal: "4000",
            diskAllocatedProd: "3800",
            diskAllocatedHp: "200",
            nbVMGlobal: "10",
            nbVMProd: "8",
            nbVMHp: "2",
            cpuUsed: "1000",
            cpuUsedProd: "900",
            cpuUsedHp: "100",
            ramUsed: "2000",
            ramUsedProd: "1900",
            ramUsedHp: "100",
            diskUsed: "3000",
            diskUsedProd: "2900",
            diskUsedHp: "100",
            s3Used: "500",
            s3UsedProd: "450",
            s3UsedHp: "50",
            pvcUsed: "600",
            pvcUsedProd: "550",
            pvcUsedHp: "50",
            nbPodMaxi: "20",
            nbPodMaxiProd: "18",
            nbPodMaxiHp: "2",
            ramMaxi: "NR",
            cpuMaxi: "NR",
            ramMaxiProd: "NR",
            cpuMaxiProd: "NR",
            ramMaxiHp: "NR",
            cpuMaxiHp: "NR",
            asUsed: "300",
            asUsedProd: "280",
            asUsedHp: "20",
            asAllocated: "400",
            asAllocatedProd: "380",
            asAllocatedHp: "20",
            lettreGreen: "A",
            gaspillage: "B",
            consoNormalized: "C",
            impactNormalized: "D",
            isModule: false,
            applicationId: 0,
            consoGlobalHist: "",
            cpuAllocatedGlobalHist: "",
            diskAllocatedGlobalHist: "",
            ramAllocatedGlobalHist: "",
            nbVMGlobalHist: "",
            consoProdHist: "",
            cpuAllocatedProdHist: "",
            diskAllocatedProdHist: "",
            ramAllocatedProdHist: "",
            nbVMProdHist: "",
            ramMaxiHist: "",
            cpuMaxiHist: "",
            cpuUsedHist: "",
            ramUsedHist: "",
            diskUsedHist: "",
            s3UsedHist: "",
            pvcUsedHist: "",
            nbPodMaxiHist: "",
            ramMaxiProdHist: "",
            cpuMaxiProdHist: "",
            cpuUsedProdHist: "",
            ramUsedProdHist: "",
            diskUsedProdHist: "",
            s3UsedProdHist: "",
            pvcUsedProdHist: "",
            nbPodMaxiProdHist: "",
            asUsedHist: "",
            asAllocatedHist: "",
            asUsedProdHist: "",
            asAllocatedProdHist: ""
        } as GreenITIndicateur
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

    it("retourne directement la valeur hors-prod en mode horsprod (plus de diff)", () => {
        const result = filteredViewMode("horsprod", mockData);

        expect(result).toHaveLength(1);
        expect(result[0]._consoSort).toBe(100);
        expect(result[0]._nbVmSort).toBe(2);
    });

    it("formate correctement les champs numériques (arrondis, sans décimale)", () => {
        const result = filteredViewMode("global", mockData);

        expect(result[0].cpuUsed).not.toBe("NR");
        expect(result[0]._conso).not.toMatch(/\./);
    });

    it("calcule toujours les colonnes VM et Kube, quel que soit le mode d'affichage courant", () => {
        const result = filteredViewMode("global", mockData);

        // VM
        expect(result[0]._nbVmSort).not.toBeNull();
        expect(result[0]._diskSort).not.toBeNull();
        expect(result[0]._cpuSort).not.toBeNull();
        expect(result[0]._ramSort).not.toBeNull();
        expect(result[0]._consoSort).not.toBeNull();
        // Kube
        expect(result[0]._cpuUsedSort).not.toBeNull();
        expect(result[0]._ramUsedSort).not.toBeNull();
        expect(result[0]._s3UsedSort).not.toBeNull();
        expect(result[0]._pvcUsedSort).not.toBeNull();
        expect(result[0]._nbPodMaxiSort).not.toBeNull();
    });
});

describe("Colonnes Accessibilité", () => {
    const colonnes = columnsGreenIt("global");

    const getProps = (accessorKey: string, value: string) => {
        const colonne = colonnes.find(c => c.accessorKey === accessorKey);
        if (!colonne) return undefined;
        return typeof colonne.muiTableBodyCellProps === "function"
            ? colonne.muiTableBodyCellProps({
                  cell: { getValue: () => value } as unknown as MRT_Cell<GreenITIndicateur, unknown>,
                  column: {} as never,
                  row: { original: { applicationName: "App1" } } as MRT_Row<GreenITIndicateur>,
                  table: {} as never
              })
            : colonne.muiTableBodyCellProps;
    };

    it("doit générer un aria-label Conso", () => {
        const props = getProps("_consoSort", "100");
        expect(props!["aria-label"]).toBe(
            generateAriaLabelCell("consommation électrique VM (Wh)", "App1", "100")
        );
    });

    it("doit générer un aria-label Cpu", () => {
        const props = getProps("_cpuSort", "1000");
        expect(props!["aria-label"]).toBe(
            generateAriaLabelCell("CPU réservée VM (Ghz)", "App1", "1000")
        );
    });

    it("doit générer un aria-label Ram", () => {
        const props = getProps("_ramSort", "50");
        expect(props!["aria-label"]).toBe(generateAriaLabelCell("RAM réservée VM (Go)", "App1", "50"));
    });

    it("doit générer un aria-label Disque", () => {
        const props = getProps("_diskSort", "50");
        expect(props!["aria-label"]).toBe(
            generateAriaLabelCell("stockage réservé VM (Go)", "App1", "50")
        );
    });

    it("doit générer un aria-label Nombre VM", () => {
        const props = getProps("_nbVmSort", "12");
        expect(props!["aria-label"]).toBe(generateAriaLabelCell("Nombre de VM", "App1", "12"));
    });

    it("doit générer un aria-label Stockage réservé applishare", () => {
        const props = getProps("_asAllocatedSort", "1000");
        expect(props!["aria-label"]).toBe(
            generateAriaLabelCell("Stockage réservé applishare (Go)", "App1", "1000")
        );
    });

    it("doit générer un aria-label Stockage utilisé applishare", () => {
        const props = getProps("_asUsedSort", "800");
        expect(props!["aria-label"]).toBe(
            generateAriaLabelCell("Stockage utilisé applishare (Go)", "App1", "800")
        );
    });

    it("doit générer un aria-label CPU Utilisé Kube", () => {
        const props = getProps("_cpuUsedSort", "1000");
        expect(props!["aria-label"]).toBe(
            generateAriaLabelCell("CPU utilisée Kube (heure)", "App1", "1000")
        );
    });

    it("doit générer un aria-label RAM Utilisée Kube", () => {
        const props = getProps("_ramUsedSort", "2000");
        expect(props!["aria-label"]).toBe(
            generateAriaLabelCell("RAM utilisée Kube (Go)", "App1", "2000")
        );
    });

    it("doit générer un aria-label Disque Utilisé", () => {
        const props = getProps("_diskUsedSort", "3000");
        expect(props!["aria-label"]).toBe(
            generateAriaLabelCell("Stockage utilisé VM (Go)", "App1", "3000")
        );
    });

    it("doit générer un aria-label S3 Utilisé", () => {
        const props = getProps("_s3UsedSort", "500");
        expect(props!["aria-label"]).toBe(
            generateAriaLabelCell("Stockage utilisé S3 (Go)", "App1", "500")
        );
    });

    it("doit générer un aria-label PVC Utilisé", () => {
        const props = getProps("_pvcUsedSort", "600");
        expect(props!["aria-label"]).toBe(
            generateAriaLabelCell("Stockage utilisé Kube (Go)", "App1", "600")
        );
    });

    it("doit générer un aria-label Nombre de POD", () => {
        const props = getProps("_nbPodMaxiSort", "20");
        expect(props!["aria-label"]).toBe(generateAriaLabelCell("Nombre (maxi) de POD", "App1", "20"));
    });
});
