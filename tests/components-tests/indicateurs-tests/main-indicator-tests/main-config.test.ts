/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import type { GlobalIndicator } from "models/indicateurs";
import { columnsGlobal, paginationConfig } from "components/indicateurs/main-indicator/main-config";

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
    });

    describe("colonne serviceDev", () => {
        const sndiColumn = columns[1];

        it("utilise accessorKey 'sndi'", () => {
            expect(sndiColumn.accessorKey).toBe("sndi");
        });

        it("a le header 'serviceDev'", () => {
            expect(sndiColumn.header).toBe("serviceDev");
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
    });

    describe("ordre des colonnes", () => {
        it("respecte l'ordre défini", () => {
            const headers = columns.map(col => col.header);
            expect(headers).toEqual([
                "Nom",
                "serviceDev",
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
