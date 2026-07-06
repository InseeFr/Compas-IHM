import { describe, it, expect } from "vitest";
import type { GreenITIndicateur } from "models/indicateurs";
import type { IndicateurApplicationGreenITView } from "todos-api/client.gen";
import {
    filteredViewMode,
    formatIndicateur,
    paginationConfig,
    columnsGreenIt
} from "pages/indicateurs/greenIT/greenItConfig";

describe("greenItConfig", () => {
    describe("paginationConfig", () => {
        it("devrait avoir la configuration de pagination par défaut", () => {
            expect(paginationConfig.pagination.pageIndex).toBe(0);
            expect(paginationConfig.pagination.pageSize).toBe(30);
        });
    });

    describe("formatNumberWithSpaces (via filteredViewMode)", () => {
        it("devrait formater les nombres avec des espaces", () => {
            const data: GreenITIndicateur[] = [
                {
                    applicationName: "Test App",
                    sndi: "TEST",
                    domaine: "Test",
                    domaineFonc: "Test",
                    consoGlobal: "1000",
                    cpuAllocatedGlobal: "2000000",
                    diskAllocatedGlobal: "3000",
                    ramAllocatedGlobal: "4000",
                    nbVMGlobal: "5",
                    consoProd: "500",
                    cpuAllocatedProd: "1000000",
                    diskAllocatedProd: "1500",
                    ramAllocatedProd: "2000",
                    nbVMProd: "3",
                    lettreGreen: "A",
                    gaspillage: "10",
                    consoNormalized: "80",
                    impactNormalized: "70",
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
                    ramMaxi: "",
                    ramMaxiHist: "",
                    cpuMaxi: "",
                    cpuMaxiHist: "",
                    cpuUsed: "",
                    cpuUsedHist: "",
                    ramUsed: "",
                    ramUsedHist: "",
                    diskUsed: "",
                    diskUsedHist: "",
                    s3Used: "",
                    s3UsedHist: "",
                    pvcUsed: "",
                    pvcUsedHist: "",
                    nbPodMaxi: "",
                    nbPodMaxiHist: "",
                    ramMaxiProd: "",
                    ramMaxiProdHist: "",
                    cpuMaxiProd: "",
                    cpuMaxiProdHist: "",
                    cpuUsedProdHist: "",
                    cpuUsedProd: "",
                    ramUsedProd: "",
                    ramUsedProdHist: "",
                    diskUsedProd: "",
                    diskUsedProdHist: "",
                    s3UsedProd: "",
                    s3UsedProdHist: "",
                    pvcUsedProd: "",
                    pvcUsedProdHist: "",
                    nbPodMaxiProd: "",
                    nbPodMaxiProdHist: ""
                }
            ];

            const result = filteredViewMode("global", data);
            expect(result[0]._conso).toBe("1 000");
            expect(result[0]._cpu).toBe("2 000");
            expect(result[0]._ram).toBe("4 000");
            expect(result[0]._disk).toBe("3 000");
            expect(result[0]._nbVm).toBe("5");
        });

        it("devrait afficher NR pour les valeurs null/undefined", () => {
            const data: GreenITIndicateur[] = [
                {
                    applicationName: "Test App",
                    sndi: "TEST",
                    domaine: "Test",
                    domaineFonc: "Test",
                    consoGlobal: null as unknown as string,
                    cpuAllocatedGlobal: undefined as unknown as string,
                    diskAllocatedGlobal: "",
                    ramAllocatedGlobal: "0",
                    nbVMGlobal: "5"
                } as unknown as GreenITIndicateur
            ];

            const result = filteredViewMode("global", data);
            expect(result[0]._conso).toBe("NR");
            expect(result[0]._cpu).toBe("NR");
            expect(result[0]._ram).toBe("0");
        });
    });

    describe("firstNumberOrNull (via filteredViewMode)", () => {
        it("devrait extraire le premier nombre d'une chaîne", () => {
            const data: GreenITIndicateur[] = [
                {
                    applicationName: "Test",
                    sndi: "T",
                    domaine: "T",
                    domaineFonc: "T",
                    consoGlobal: "123ABC",
                    cpuAllocatedGlobal: "456",
                    diskAllocatedGlobal: "",
                    ramAllocatedGlobal: "",
                    nbVMGlobal: ""
                } as unknown as GreenITIndicateur
            ];

            const result = filteredViewMode("global", data);
            expect(result[0]._consoSort).toBe(123);
        });

        it("devrait retourner null pour les chaînes sans nombre", () => {
            const data: GreenITIndicateur[] = [
                {
                    applicationName: "Test",
                    sndi: "T",
                    domaine: "T",
                    domaineFonc: "T",
                    consoGlobal: "NR",
                    cpuAllocatedGlobal: "",
                    diskAllocatedGlobal: "",
                    ramAllocatedGlobal: "",
                    nbVMGlobal: ""
                } as unknown as GreenITIndicateur
            ];

            const result = filteredViewMode("global", data);
            expect(result[0]._consoSort).toBeNull();
        });
    });

    describe("diffNumeric (via filteredViewMode)", () => {
        it("devrait calculer la différence entre global et prod", () => {
            const data: GreenITIndicateur[] = [
                {
                    applicationName: "Test",
                    sndi: "T",
                    domaine: "T",
                    domaineFonc: "T",
                    consoGlobal: "1000",
                    consoProd: "500",
                    cpuAllocatedGlobal: "2000000",
                    cpuAllocatedProd: "1000000",
                    diskAllocatedGlobal: "",
                    diskAllocatedProd: "",
                    ramAllocatedGlobal: "",
                    ramAllocatedProd: "",
                    nbVMGlobal: "10",
                    nbVMProd: "5"
                } as unknown as GreenITIndicateur
            ];

            const result = filteredViewMode("horsprod", data);
            expect(result[0]._consoSort).toBe(500);
            expect(result[0]._cpuSort).toBe(1000);
            expect(result[0]._nbVmSort).toBe(5);
        });

        it("devrait retourner null si une valeur est manquante", () => {
            const data: GreenITIndicateur[] = [
                {
                    applicationName: "Test",
                    sndi: "T",
                    domaine: "T",
                    domaineFonc: "T",
                    consoGlobal: "1000",
                    consoProd: "NR",
                    cpuAllocatedGlobal: "",
                    cpuAllocatedProd: "",
                    diskAllocatedGlobal: "",
                    diskAllocatedProd: "",
                    ramAllocatedGlobal: "",
                    ramAllocatedProd: "",
                    nbVMGlobal: ""
                } as unknown as GreenITIndicateur
            ];

            const result = filteredViewMode("horsprod", data);
            expect(result[0]._consoSort).toBeNull();
        });
    });

    describe("filteredViewMode", () => {
        const baseData: GreenITIndicateur = {
            applicationName: "Test App",
            sndi: "TEST",
            domaine: "Test",
            domaineFonc: "Test",
            consoGlobal: "1000",
            cpuAllocatedGlobal: "2000000",
            diskAllocatedGlobal: "3000",
            ramAllocatedGlobal: "4000",
            nbVMGlobal: "5",
            consoProd: "500",
            cpuAllocatedProd: "1000000",
            diskAllocatedProd: "1500",
            ramAllocatedProd: "2000",
            nbVMProd: "3",
            lettreGreen: "A",
            gaspillage: "10",
            consoNormalized: "80",
            impactNormalized: "70",
            cpuMaxi: "4000000",
            cpuMaxiProd: "2000000",
            ramMaxi: "8000",
            ramMaxiProd: "4000",
            cpuUsed: "3600",
            cpuUsedProd: "1800",
            ramUsed: "1000",
            ramUsedProd: "500",
            diskUsed: "2000",
            diskUsedProd: "1000",
            s3Used: "500",
            s3UsedProd: "250",
            pvcUsed: "300",
            pvcUsedProd: "150",
            nbPodMaxi: "10",
            nbPodMaxiProd: "5",
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
            nbPodMaxiProdHist: ""
        };

        it("devrait utiliser les valeurs globales en mode global", () => {
            const result = filteredViewMode("global", [baseData]);
            expect(result[0]._consoSort).toBe(1000);
            expect(result[0]._cpuSort).toBe(2000);
            expect(result[0]._ramSort).toBe(4000);
        });

        it("devrait utiliser les valeurs prod en mode prod", () => {
            const result = filteredViewMode("prod", [baseData]);
            expect(result[0]._consoSort).toBe(500);
            expect(result[0]._cpuSort).toBe(1000);
            expect(result[0]._ramSort).toBe(2000);
        });

        it("devrait calculer la différence en mode horsprod", () => {
            const result = filteredViewMode("horsprod", [baseData]);
            expect(result[0]._consoSort).toBe(500);
            expect(result[0]._cpuSort).toBe(1000);
            expect(result[0]._ramSort).toBe(2000);
        });

        it("devrait formater CPU en GHz (divisé par 1000)", () => {
            const result = filteredViewMode("global", [baseData]);
            expect(result[0]._cpu).toBe("2 000");
        });

        it("devrait formater CPU maxi en GHz", () => {
            const result = filteredViewMode("global", [baseData]);
            expect(result[0]._cpuMaxiSort).toBe(4000);
        });

        it("devrait formater CPU utilisé en heures (divisé par 3600)", () => {
            const result = filteredViewMode("global", [baseData]);
            expect(result[0]._cpuUsedSort).toBe(1);
        });

        it("devrait formater les unités sans décimales", () => {
            const result = filteredViewMode("global", [baseData]);
            expect(result[0]._nbVm).toBe("5");
            expect(result[0]._nbPodMaxiSort).toBe(10);
        });
    });

    describe("formatIndicateur", () => {
        const greenItApp: IndicateurApplicationGreenITView[] = [
            {
                applicationName: "App1",
                domaineDev: "Domaine1",
                serviceDev: "SNDI1",
                domaineFonc: "Fonc1",
                conso: "1000",
                cpuAllocated: "2000000",
                diskAllocated: "3000",
                ramAllocated: "4000",
                nbVm: "5",
                consoProd: "500",
                cpuAllocatedProd: "1000000",
                diskAllocatedProd: "1500",
                ramAllocatedProd: "2000",
                nbVmProd: "3",
                lettreGreen: "A",
                gaspillageScore: "10",
                consoScore: "80",
                impactScore: "70",
                nbPodMaxi: "10",
                nbPodMaxiProd: "5",
                diskUsed: "2000",
                pvcUsed: "300",
                diskUsedProd: "1000",
                pvcUsedProd: "150",
                s3Used: "500",
                s3UsedProd: "250",
                cpuUsed: "3600",
                cpuUsedProd: "1800",
                ramUsed: "1000",
                ramUsedProd: "500",
                ramMaxi: "8000",
                cpuMaxi: "4000000",
                ramMaxiProd: "4000",
                cpuMaxiProd: "2000000"
            }
        ];

        it("devrait fusionner les données sndiAndDomain avec greenItApp", () => {
            const result = formatIndicateur(greenItApp);
            expect(result.length).toBe(1);
            expect(result[0].applicationName).toBe("App1");
            expect(result[0].sndi).toBe("SNDI1");
            expect(result[0].domaine).toBe("Domaine1");
            expect(result[0].domaineFonc).toBe("Fonc1");
        });

        it("devrait associer correctement les données greenIT", () => {
            const result = formatIndicateur(greenItApp);
            expect(result[0].consoGlobal).toBe("1000");
            expect(result[0].cpuAllocatedGlobal).toBe("2000000");
            expect(result[0].lettreGreen).toBe("A");
        });

        it("devrait mettre isModule à false", () => {
            const result = formatIndicateur(greenItApp);
            expect(result[0].isModule).toBe(false);
        });
    });

    describe("columnsGreenIt", () => {
        it("devrait retourner un tableau de colonnes", () => {
            const columns = columnsGreenIt("global");
            expect(Array.isArray(columns)).toBe(true);
            expect(columns.length).toBeGreaterThan(0);
        });

        it("devrait inclure les colonnes de base", () => {
            const columns = columnsGreenIt("global");
            const accessorKeys = columns.map(col => col.accessorKey);
            expect(accessorKeys).toContain("applicationName");
            expect(accessorKeys).toContain("sndi");
        });

        it("devrait inclure les colonnes GreenIT spécifiques", () => {
            const columns = columnsGreenIt("global");
            const accessorKeys = columns.map(col => col.accessorKey);
            expect(accessorKeys).toContain("_nbVmSort");
            expect(accessorKeys).toContain("_cpuSort");
            expect(accessorKeys).toContain("_ramSort");
            expect(accessorKeys).toContain("_diskSort");
            expect(accessorKeys).toContain("_consoSort");
        });

        it("devrait avoir les bons headers", () => {
            const columns = columnsGreenIt("global");
            const headers = columns.map(col => col.header);
            expect(headers).toContain("Nombre de VM");
            expect(headers).toContain("Consommation électrique VM (Wh)");
        });
    });
});
