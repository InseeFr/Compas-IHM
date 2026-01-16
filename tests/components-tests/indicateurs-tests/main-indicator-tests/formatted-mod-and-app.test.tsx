import { describe, it, expect } from "vitest";
import type {
    Application,
    IndicateurQualiteView,
    IndicateurDevopsView,
    Meteo,
    IndicateurApplicationGreenITView,
    IndicateursModuleA11Y,
    IndicateurSecuriteView,
    IndicateurApplicationMaturiteCloud,
    Module
} from "todos-api/client.gen";
import {
    formattedApps,
    formattedModules
} from "components/indicateurs/main-indicator/formatted-mod-and-app";

describe("formattedApps", () => {
    it("devrait formater une application avec toutes les données présentes", () => {
        const mockApp: Application = {
            idApplication: 1,
            appName: "Test App",
            sndi: "SNDI-001",
            domaineSndi: "Domaine Test",
            domaineFonctionnel: "Fonctionnel Test"
        };

        const mockQualite: IndicateurQualiteView = {
            applicationId: 1,
            lettreCouvertureTestUniaire: "A",
            lettreFiabilite: "B",
            lettreDetteTechnique: "C",
            lettreGlobalQualite: "B",
            pourcentageCouvertureTestUniaire: "85",
            detteTechnique: "10.00"
        };

        const mockDevops: IndicateurDevopsView = {
            applicationId: 1,
            lettreDistanceCount: "A",
            lettreDeploymentCount: "B",
            lettreContributorCount: "A",
            lettreGlobalDevops: "A",
            distanceCount: "5",
            nbDeploymentCount: "20",
            nbContributorCount: "8"
        };

        const mockMeteo: Meteo = {
            idApplication: 1,
            valeurMeteo: 3,
            commentaire: "Tout va bien",
            date: "2024-01-15"
        };

        const mockGreenIT: IndicateurApplicationGreenITView = {
            applicationId: 1,
            conso: "150",
            lettreGreen: "B",
            gaspillageScore: "20",
            consoScore: "75",
            impactScore: "80",
            ramAllocated: "16",
            ramMaxi: "32",
            diskAllocated: "100",
            diskUsed: "60",
            cpuAllocated: "4",
            cpuMaxi: "8",
            nbVm: "5",
            ramAllocatedProd: "32",
            ramMaxiProd: "64",
            diskAllocatedProd: "200",
            diskUsedProd: "120",
            cpuAllocatedProd: "8",
            cpuMaxiProd: "16",
            nbVmProd: "10",
            consoProd: "300"
        };

        const mockA11y: IndicateursModuleA11Y = {
            notation: "A",
            scoreAudit: 85,
            declaration: true,
            dateDeclaration: "2024-01-01"
        };

        const mockSecurite: IndicateurSecuriteView = {
            applicationId: 1,
            lettreGlobaleSecurite: "B",
            lettreCve: "C",
            nbCveCritical: "1",
            nbCveHigh: "3",
            nbCveMedium: "5",
            nbCveLow: "10",
            delaiVmNonMiseAjour: "15",
            nbVmNonMaj: "2"
        };

        const mockMaturite: IndicateurApplicationMaturiteCloud = {
            applicationId: 1,
            maturite: "Avancé",
            robustesse: "Forte",
            scoreBenefice: "85",
            scoreComplexite: "60",
            scoreOrga: "75",
            scoreTechnique: "80",
            progressionDeploy: "90",
            progressionArchi: "85",
            progressionTechnos: "80",
            progressionCloud: "95",
            progressionDevops: "88",
            progressionMateqip: "70"
        };

        const result = formattedApps({
            apps: [mockApp],
            qualiteAppData: [mockQualite],
            devopsAppData: [mockDevops],
            meteoData: [mockMeteo],
            consoAppData: [mockGreenIT],
            a11yDataApps: [mockA11y],
            securiteApps: [mockSecurite],
            maturiteCloudApps: [mockMaturite]
        });

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            idApplication: 1,
            applicationName: "Test App",
            sndi: "SNDI-001",
            domaine: "Domaine Test",
            domaineFonc: "Fonctionnel Test",
            lettreCouvertureTestUniaire: "A",
            lettreFiabilite: "B",
            meteo: 3,
            lettreGreen: "B",
            lettreGlobaleSecurite: "B",
            maturite: "Avancé"
        });
    });

    it("devrait utiliser des valeurs par défaut quand les données sont absentes", () => {
        const mockApp: Application = {
            idApplication: 2,
            appName: "Empty App"
        };

        const result = formattedApps({
            apps: [mockApp],
            qualiteAppData: [],
            devopsAppData: [],
            meteoData: [],
            consoAppData: [],
            a11yDataApps: [],
            securiteApps: [],
            maturiteCloudApps: []
        });

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            idApplication: 2,
            applicationName: "Empty App",
            sndi: "NR",
            domaine: "NR",
            lettreCouvertureTestUniaire: "NR",
            conso: "NR",
            meteo: -1,
            lettreGlobaleSecurite: "NR"
        });
    });

    it("devrait retirer .00 de la dette technique", () => {
        const mockApp: Application = {
            idApplication: 3,
            appName: "Test App"
        };

        const mockQualite: IndicateurQualiteView = {
            applicationId: 3,
            detteTechnique: "25.00"
        };

        const result = formattedApps({
            apps: [mockApp],
            qualiteAppData: [mockQualite],
            devopsAppData: [],
            meteoData: [],
            consoAppData: [],
            a11yDataApps: [],
            securiteApps: [],
            maturiteCloudApps: []
        });

        expect(result[0].detteTechnique).toBe("25");
    });

    it("devrait gérer plusieurs applications", () => {
        const mockApps: Application[] = [
            { idApplication: 1, appName: "App 1" },
            { idApplication: 2, appName: "App 2" },
            { idApplication: 3, appName: "App 3" }
        ];

        const result = formattedApps({
            apps: mockApps,
            qualiteAppData: [],
            devopsAppData: [],
            meteoData: [],
            consoAppData: [],
            a11yDataApps: [],
            securiteApps: [],
            maturiteCloudApps: []
        });

        expect(result).toHaveLength(3);
        expect(result[0].applicationName).toBe("App 1");
        expect(result[1].applicationName).toBe("App 2");
        expect(result[2].applicationName).toBe("App 3");
    });
});

describe("formattedModules", () => {
    it("devrait formater un module avec toutes les données présentes", () => {
        const mockModule: Module = {
            id: 1,
            appName: "Parent App",
            sndi: "SNDI-MOD-001",
            domaineSndi: "Domaine Module",
            domaineFonctionnel: "Fonctionnel Module"
        };

        const mockQualite: IndicateurQualiteView = {
            moduleId: 1,
            lettreCouvertureTestUniaire: "A",
            lettreFiabilite: "B",
            lettreDetteTechnique: "C",
            lettreGlobalQualite: "B",
            pourcentageCouvertureTestUniaire: "90",
            detteTechnique: "5.00"
        };

        const mockDevops: IndicateurDevopsView = {
            moduleId: 1,
            lettreDistanceCount: "B",
            lettreDeploymentCount: "A",
            lettreContributorCount: "B",
            lettreGlobalDevops: "B",
            distanceCount: "3",
            nbDeploymentCount: "15",
            nbContributorCount: "5"
        };

        const mockMeteo: Meteo = {
            idApplication: 1,
            valeurMeteo: 4,
            commentaire: "Module stable",
            date: "2024-01-20"
        };

        const mockA11y: IndicateursModuleA11Y = {
            notation: "B",
            scoreAudit: 78,
            declaration: false,
            dateDeclaration: "2023-12-15"
        };

        const mockSecurite: IndicateurSecuriteView = {
            moduleId: 1,
            lettreGlobaleSecurite: "A",
            lettreCve: "B",
            nbCveCritical: "0",
            nbCveHigh: "1",
            nbCveMedium: "2",
            nbCveLow: "5",
            delaiVmNonMiseAjour: "10",
            nbVmNonMaj: "1"
        };

        const result = formattedModules({
            modules: [mockModule],
            qualiteModule: [mockQualite],
            devopsModulesData: [mockDevops],
            meteoData: [mockMeteo],
            a11yDataModules: [mockA11y],
            securiteModules: [mockSecurite]
        });

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            applicationName: "Parent App",
            sndi: "SNDI-MOD-001",
            domaine: "Domaine Module",
            domaineFonc: "Fonctionnel Module",
            isModule: true,
            parentApplication: "Parent App",
            lettreCouvertureTestUniaire: "A",
            meteo: -1,
            lettreGlobaleSecurite: "A",
            lettreA11y: "NR"
        });
    });

    it("devrait utiliser SO pour les indicateurs GreenIT et Maturité Cloud des modules", () => {
        const mockModule: Module = {
            id: 2,
            appName: "Test Module"
        };

        const result = formattedModules({
            modules: [mockModule],
            qualiteModule: [],
            devopsModulesData: [],
            meteoData: [],
            a11yDataModules: [],
            securiteModules: []
        });

        expect(result[0]).toMatchObject({
            conso: "SO",
            lettreGreen: "SO",
            maturite: "SO",
            robustesse: "SO"
        });
    });

    it("devrait utiliser SO pour meteoCommentaire et dateMeteoCommentaire si absents", () => {
        const mockModule: Module = {
            id: 3,
            appName: "Test Module"
        };

        const result = formattedModules({
            modules: [mockModule],
            qualiteModule: [],
            devopsModulesData: [],
            meteoData: [],
            a11yDataModules: [],
            securiteModules: []
        });

        expect(result[0].meteoCommentaire).toBe("SO");
        expect(result[0].dateMeteoCommentaire).toBe("SO");
    });

    it("devrait marquer isModule comme true", () => {
        const mockModule: Module = {
            id: 4,
            appName: "Module Test"
        };

        const result = formattedModules({
            modules: [mockModule],
            qualiteModule: [],
            devopsModulesData: [],
            meteoData: [],
            a11yDataModules: [],
            securiteModules: []
        });

        expect(result[0].isModule).toBe(true);
    });

    it("devrait gérer plusieurs modules", () => {
        const mockModules: Module[] = [
            { id: 1, appName: "Module 1" },
            { id: 2, appName: "Module 2" }
        ];

        const result = formattedModules({
            modules: mockModules,
            qualiteModule: [],
            devopsModulesData: [],
            meteoData: [],
            a11yDataModules: [],
            securiteModules: []
        });

        expect(result).toHaveLength(2);
        expect(result[0].applicationName).toBe("Module 1");
        expect(result[1].applicationName).toBe("Module 2");
    });
});
