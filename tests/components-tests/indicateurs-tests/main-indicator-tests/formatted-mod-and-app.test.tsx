/* eslint-disable @typescript-eslint/no-explicit-any */
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
    findBy,
    formattedApps,
    formattedModules
} from "components/indicateurs/main-indicator/formatted-mod-and-app";

const NR = "NR";
const SO = "SO";

describe("findBy", () => {
    it("transforme un tableau en dictionnaire indexé par clé", () => {
        const items = [
            { id: 1, name: "A" },
            { id: 2, name: "B" },
            { id: 3, name: "C" }
        ];

        const result = findBy(items, item => item.id);

        expect(result).toEqual({
            1: { id: 1, name: "A" },
            2: { id: 2, name: "B" },
            3: { id: 3, name: "C" }
        });
    });

    it("ignore les éléments avec clé undefined", () => {
        const items = [
            { id: 1, name: "A" },
            { id: undefined, name: "B" },
            { id: 3, name: "C" }
        ];

        const result = findBy(items, item => item.id);

        expect(result).toEqual({
            1: { id: 1, name: "A" },
            3: { id: 3, name: "C" }
        });
    });

    it("gère un tableau vide", () => {
        const result = findBy([], item => (item as any).id);
        expect(result).toEqual({});
    });

    it("écrase les doublons avec le dernier élément", () => {
        const items = [
            { id: 1, name: "A" },
            { id: 1, name: "B" },
            { id: 1, name: "C" }
        ];

        const result = findBy(items, item => item.id);

        expect(result).toEqual({
            1: { id: 1, name: "C" }
        });
    });

    it("fonctionne avec des clés de type string", () => {
        const items = [
            { code: "FR", country: "France" },
            { code: "US", country: "USA" }
        ];

        const result = findBy(items, item => item.code);

        expect(result).toEqual({
            FR: { code: "FR", country: "France" },
            US: { code: "US", country: "USA" }
        });
    });
});

describe("formattedApps", () => {
    const createMockApp = (id: number, name: string, sndi: string = "SNDI1"): Application => ({
        idApplication: id,
        appName: name,
        sndi,
        domaineSndi: "DOM1",
        domaineFonctionnel: "FUNC1"
    });

    describe("informations de base", () => {
        it("formate une application sans indicateurs", () => {
            const sources = {
                apps: [createMockApp(1, "App1")],
                qualiteAppData: [],
                devopsAppData: [],
                meteoData: [],
                consoAppData: [],
                a11yDataApps: [],
                securiteApps: [],
                maturiteCloudApps: []
            };

            const result = formattedApps(sources);

            expect(result).toHaveLength(1);
            expect(result[0]).toMatchObject({
                idApplication: 1,
                applicationName: "App1",
                sndi: "SNDI1",
                domaine: "DOM1",
                domaineFonc: "FUNC1"
            });
        });

        it("gère les valeurs nulles dans l'application", () => {
            const sources = {
                apps: [
                    {
                        idApplication: 1,
                        appName: null,
                        sndi: null,
                        domaineSndi: null,
                        domaineFonctionnel: null
                    } as any
                ],
                qualiteAppData: [],
                devopsAppData: [],
                meteoData: [],
                consoAppData: [],
                a11yDataApps: [],
                securiteApps: [],
                maturiteCloudApps: []
            };

            const result = formattedApps(sources);

            expect(result[0]).toMatchObject({
                applicationName: NR,
                sndi: NR,
                domaine: NR,
                domaineFonc: NR
            });
        });
    });

    describe("indicateurs de qualité", () => {
        it("intègre les données de qualité", () => {
            const qualiteData: IndicateurQualiteView = {
                applicationId: 1,
                lettreCouvertureTestUniaire: "A",
                lettreFiabilite: "B",
                lettreDetteTechnique: "C",
                lettreGlobalQualite: "B",
                pourcentageCouvertureTestUniaire: "85",
                detteTechnique: "1234.00"
            };

            const sources = {
                apps: [createMockApp(1, "App1")],
                qualiteAppData: [qualiteData],
                devopsAppData: [],
                meteoData: [],
                consoAppData: [],
                a11yDataApps: [],
                securiteApps: [],
                maturiteCloudApps: []
            };

            const result = formattedApps(sources);

            expect(result[0]).toMatchObject({
                lettreCouvertureTestUniaire: "A",
                lettreFiabilite: "B",
                lettreDetteTechnique: "C",
                lettreQualiteGenerale: "B",
                pourcentageCouvertureTestUniaire: "85",
                detteTechnique: "1234"
            });
        });

        it("utilise NR quand les données de qualité sont absentes", () => {
            const sources = {
                apps: [createMockApp(1, "App1")],
                qualiteAppData: [],
                devopsAppData: [],
                meteoData: [],
                consoAppData: [],
                a11yDataApps: [],
                securiteApps: [],
                maturiteCloudApps: []
            };

            const result = formattedApps(sources);

            expect(result[0]).toMatchObject({
                lettreCouvertureTestUniaire: NR,
                lettreFiabilite: NR,
                lettreDetteTechnique: NR,
                lettreQualiteGenerale: NR,
                pourcentageCouvertureTestUniaire: NR,
                detteTechnique: NR
            });
        });

        it("retire les .00 de la dette technique", () => {
            const qualiteData: IndicateurQualiteView = {
                applicationId: 1,
                detteTechnique: "5678.00"
            } as any;

            const sources = {
                apps: [createMockApp(1, "App1")],
                qualiteAppData: [qualiteData],
                devopsAppData: [],
                meteoData: [],
                consoAppData: [],
                a11yDataApps: [],
                securiteApps: [],
                maturiteCloudApps: []
            };

            const result = formattedApps(sources);

            expect(result[0].detteTechnique).toBe("5678");
        });
    });

    describe("indicateurs de sécurité", () => {
        it("intègre les données de sécurité", () => {
            const securiteData: IndicateurSecuriteView = {
                applicationId: 1,
                lettreGlobaleSecurite: "A",
                lettreCve: "B",
                nbCveCritical: "2",
                nbCveHigh: "5",
                nbCveMedium: "10",
                nbCveLow: "3",
                delaiVmNonMiseAjour: "30",
                nbVmNonMaj: "4"
            };

            const sources = {
                apps: [createMockApp(1, "App1")],
                qualiteAppData: [],
                devopsAppData: [],
                meteoData: [],
                consoAppData: [],
                a11yDataApps: [],
                securiteApps: [securiteData],
                maturiteCloudApps: []
            };

            const result = formattedApps(sources);

            expect(result[0]).toMatchObject({
                lettreGlobaleSecurite: "A",
                lettreCve: "B",
                nbCveCritical: "2",
                nbCveHigh: "5",
                nbCveMedium: "10",
                nbCveLow: "3",
                delaiVmNonMiseAjour: "30",
                nbVmNonMaj: "4"
            });
        });

        it("utilise NR quand les données de sécurité sont absentes", () => {
            const sources = {
                apps: [createMockApp(1, "App1")],
                qualiteAppData: [],
                devopsAppData: [],
                meteoData: [],
                consoAppData: [],
                a11yDataApps: [],
                securiteApps: [],
                maturiteCloudApps: []
            };

            const result = formattedApps(sources);

            expect(result[0]).toMatchObject({
                lettreGlobaleSecurite: NR,
                lettreCve: NR,
                nbCveCritical: NR,
                nbCveHigh: NR,
                nbCveMedium: NR,
                nbCveLow: NR
            });
        });
    });

    describe("indicateurs DevOps", () => {
        it("intègre les données DevOps", () => {
            const devopsData: IndicateurDevopsView = {
                applicationId: 1,
                lettreDistanceCount: "B",
                distanceCount: "15",
                lettreDeploymentCount: "A",
                nbDeploymentCount: "50",
                lettreContributorCount: "C",
                nbContributorCount: "8",
                lettreGlobalDevops: "B"
            };

            const sources = {
                apps: [createMockApp(1, "App1")],
                qualiteAppData: [],
                devopsAppData: [devopsData],
                meteoData: [],
                consoAppData: [],
                a11yDataApps: [],
                securiteApps: [],
                maturiteCloudApps: []
            };

            const result = formattedApps(sources);

            expect(result[0]).toMatchObject({
                lettreDistanceCount: "B",
                distanceCount: "15",
                lettreDeploymentCount: "A",
                nbDeploymentCount: "50",
                lettreContributorCount: "C",
                nbContributorCount: "8",
                lettreDevopsGenerale: "B"
            });
        });

        it("utilise NR quand les données DevOps sont absentes", () => {
            const sources = {
                apps: [createMockApp(1, "App1")],
                qualiteAppData: [],
                devopsAppData: [],
                meteoData: [],
                consoAppData: [],
                a11yDataApps: [],
                securiteApps: [],
                maturiteCloudApps: []
            };

            const result = formattedApps(sources);

            expect(result[0]).toMatchObject({
                lettreDistanceCount: NR,
                distanceCount: NR,
                lettreDeploymentCount: NR,
                nbDeploymentCount: NR,
                lettreContributorCount: NR,
                nbContributorCount: NR,
                lettreDevopsGenerale: NR
            });
        });
    });

    describe("indicateurs météo", () => {
        it("intègre les données météo pour une application", () => {
            const meteoData: Meteo = {
                idApplication: 1,
                valeurMeteo: 3,
                commentaire: "Beau temps",
                date: "2026-01-12"
            };

            const sources = {
                apps: [createMockApp(1, "App1")],
                qualiteAppData: [],
                devopsAppData: [],
                meteoData: [meteoData],
                consoAppData: [],
                a11yDataApps: [],
                securiteApps: [],
                maturiteCloudApps: []
            };

            const result = formattedApps(sources);

            expect(result[0]).toMatchObject({
                meteo: 3,
                meteoCommentaire: "Beau temps",
                dateMeteoCommentaire: "2026-01-12"
            });
        });

        it("utilise des valeurs par défaut pour applications sans météo", () => {
            const sources = {
                apps: [createMockApp(1, "App1")],
                qualiteAppData: [],
                devopsAppData: [],
                meteoData: [],
                consoAppData: [],
                a11yDataApps: [],
                securiteApps: [],
                maturiteCloudApps: []
            };

            const result = formattedApps(sources);

            expect(result[0]).toMatchObject({
                meteo: -1,
                meteoCommentaire: NR,
                dateMeteoCommentaire: NR
            });
        });
    });

    describe("indicateurs GreenIT", () => {
        it("intègre les données GreenIT complètes", () => {
            const greenData: IndicateurApplicationGreenITView = {
                applicationName: "App1",
                conso: "1500",
                lettreGreen: "B",
                gaspillageScore: "25",
                consoScore: "80",
                impactScore: "70",
                ramAllocated: "16384",
                ramMaxi: "12288",
                diskAllocated: "500",
                diskUsed: "300",
                cpuAllocated: "8",
                cpuMaxi: "6",
                nbVm: "4",
                ramAllocatedProd: "32768",
                ramMaxiProd: "24576",
                diskAllocatedProd: "1000",
                diskUsedProd: "600",
                cpuAllocatedProd: "16",
                cpuMaxiProd: "12",
                nbVmProd: "8",
                consoProd: "3000"
            };

            const sources = {
                apps: [createMockApp(1, "App1")],
                qualiteAppData: [],
                devopsAppData: [],
                meteoData: [],
                consoAppData: [greenData],
                a11yDataApps: [],
                securiteApps: [],
                maturiteCloudApps: []
            };

            const result = formattedApps(sources);

            expect(result[0]).toMatchObject({
                conso: "1500",
                lettreGreen: "B",
                gaspillage: "25",
                consoNormalized: "80",
                impactNormalized: "70",
                ramAllocated: "16384",
                ramMaxi: "12288",
                diskAllocated: "500",
                diskUsed: "300",
                cpuAllocated: "8",
                cpuMaxi: "6",
                nbVm: "4",
                ramAllocatedProd: "32768",
                ramMaxiProd: "24576",
                diskAllocatedProd: "1000",
                diskUsedProd: "600",
                cpuAllocatedProd: "16",
                cpuMaxiProd: "12",
                nbVmProd: "8",
                consoProd: "3000"
            });
        });

        it("utilise NR quand les données GreenIT sont absentes", () => {
            const sources = {
                apps: [createMockApp(1, "App1")],
                qualiteAppData: [],
                devopsAppData: [],
                meteoData: [],
                consoAppData: [],
                a11yDataApps: [],
                securiteApps: [],
                maturiteCloudApps: []
            };

            const result = formattedApps(sources);

            expect(result[0]).toMatchObject({
                conso: NR,
                lettreGreen: NR,
                gaspillage: NR,
                consoNormalized: NR,
                impactNormalized: NR
            });
        });
    });

    describe("indicateurs d'accessibilité", () => {
        it("intègre les données d'accessibilité", () => {
            const a11yData: IndicateursModuleA11Y = {
                idApplication: 1,
                notation: "A",
                scoreAudit: 95,
                declaration: true,
                dateDeclaration: "2025-12-01"
            };

            const sources = {
                apps: [createMockApp(1, "App1")],
                qualiteAppData: [],
                devopsAppData: [],
                meteoData: [],
                consoAppData: [],
                a11yDataApps: [a11yData],
                securiteApps: [],
                maturiteCloudApps: []
            };

            const result = formattedApps(sources);

            expect(result[0]).toMatchObject({
                lettreA11y: "A",
                scoreAuditA11y: 95,
                declarationA11y: true,
                dateDeclarationA11y: "2025-12-01"
            });
        });

        it("utilise des valeurs par défaut quand les données A11Y sont absentes", () => {
            const sources = {
                apps: [createMockApp(1, "App1")],
                qualiteAppData: [],
                devopsAppData: [],
                meteoData: [],
                consoAppData: [],
                a11yDataApps: [],
                securiteApps: [],
                maturiteCloudApps: []
            };

            const result = formattedApps(sources);

            expect(result[0]).toMatchObject({
                lettreA11y: NR,
                scoreAuditA11y: 0,
                declarationA11y: false
            });
        });
    });

    describe("indicateurs de maturité cloud", () => {
        it("intègre les données de maturité cloud", () => {
            const maturiteData: IndicateurApplicationMaturiteCloud = {
                applicationId: 1,
                maturite: "3",
                robustesse: "B",
                scoreBenefice: "75",
                scoreComplexite: "60",
                scoreOrga: "80",
                scoreTechnique: "70",
                progressionDeploy: "5",
                progressionArchi: "4",
                progressionTechnos: "3",
                progressionCloud: "4",
                progressionDevops: "5",
                progressionMateqip: "4"
            };

            const sources = {
                apps: [createMockApp(1, "App1")],
                qualiteAppData: [],
                devopsAppData: [],
                meteoData: [],
                consoAppData: [],
                a11yDataApps: [],
                securiteApps: [],
                maturiteCloudApps: [maturiteData]
            };

            const result = formattedApps(sources);

            expect(result[0]).toMatchObject({
                maturite: "3",
                robustesse: "B",
                scoreBenefice: "75",
                scoreComplexite: "60",
                scoreOrga: "80",
                scoreTechnique: "70",
                progressionDeploy: "5",
                progressionArchi: "4",
                progressionTechnos: "3",
                progressionCloud: "4",
                progressionDevops: "5",
                progressionMateqip: "4"
            });
        });

        it("utilise NR quand les données de maturité sont absentes", () => {
            const sources = {
                apps: [createMockApp(1, "App1")],
                qualiteAppData: [],
                devopsAppData: [],
                meteoData: [],
                consoAppData: [],
                a11yDataApps: [],
                securiteApps: [],
                maturiteCloudApps: []
            };

            const result = formattedApps(sources);

            expect(result[0]).toMatchObject({
                maturite: NR,
                robustesse: NR,
                scoreBenefice: NR,
                scoreComplexite: NR
            });
        });
    });

    describe("scénarios multiples", () => {
        it("formate plusieurs applications avec indicateurs mixtes", () => {
            const sources = {
                apps: [createMockApp(1, "App1"), createMockApp(2, "App2"), createMockApp(3, "App3")],
                qualiteAppData: [
                    { applicationId: 1, lettreGlobalQualite: "A" } as any,
                    { applicationId: 3, lettreGlobalQualite: "C" } as any
                ],
                devopsAppData: [{ applicationId: 2, lettreGlobalDevops: "B" } as any],
                meteoData: [],
                consoAppData: [],
                a11yDataApps: [],
                securiteApps: [],
                maturiteCloudApps: []
            };

            const result = formattedApps(sources);

            expect(result).toHaveLength(3);
            expect(result[0].lettreQualiteGenerale).toBe("A");
            expect(result[1].lettreDevopsGenerale).toBe("B");
            expect(result[2].lettreQualiteGenerale).toBe("C");
        });
    });
});

describe("formattedModules", () => {
    const createMockModule = (id: number, name: string, appName: string = "ParentApp"): Module => ({
        id,
        modName: name,
        sndi: "SNDI1",
        domaineSndi: "DOM1",
        domaineFonctionnel: "FUNC1",
        appName
    });

    describe("informations de base", () => {
        it("formate un module sans indicateurs", () => {
            const sources = {
                modules: [createMockModule(1, "Module1")],
                qualiteModule: [],
                devopsModulesData: [],
                meteoData: [],
                a11yDataModules: [],
                securiteModules: []
            };

            const result = formattedModules(sources);

            expect(result).toHaveLength(1);
            expect(result[0]).toMatchObject({
                applicationName: "Module1",
                sndi: "SNDI1",
                domaine: "DOM1",
                domaineFonc: "FUNC1",
                isModule: true,
                parentApplication: "ParentApp"
            });
        });

        it("gère les valeurs nulles dans le module", () => {
            const sources = {
                modules: [
                    {
                        id: 1,
                        modName: null,
                        sndi: null,
                        domaineSndi: null,
                        domaineFonctionnel: null,
                        appName: null
                    } as any
                ],
                qualiteModule: [],
                devopsModulesData: [],
                meteoData: [],
                a11yDataModules: [],
                securiteModules: []
            };

            const result = formattedModules(sources);

            expect(result[0]).toMatchObject({
                applicationName: NR,
                sndi: NR,
                domaine: NR,
                domaineFonc: NR,
                parentApplication: NR
            });
        });
    });

    describe("indicateurs spécifiques aux modules", () => {
        it("utilise SO pour les indicateurs GreenIT", () => {
            const sources = {
                modules: [createMockModule(1, "Module1")],
                qualiteModule: [],
                devopsModulesData: [],
                meteoData: [],
                a11yDataModules: [],
                securiteModules: []
            };

            const result = formattedModules(sources);

            expect(result[0]).toMatchObject({
                conso: SO,
                lettreGreen: SO,
                gaspillage: SO,
                consoNormalized: SO,
                impactNormalized: SO,
                ramAllocated: SO,
                ramMaxi: SO,
                diskAllocated: SO,
                diskUsed: SO,
                cpuAllocated: SO,
                cpuMaxi: SO,
                nbVm: SO,
                ramAllocatedProd: SO,
                ramMaxiProd: SO,
                diskAllocatedProd: SO,
                diskUsedProd: SO,
                cpuAllocatedProd: SO,
                cpuMaxiProd: SO,
                nbVmProd: SO,
                consoProd: SO
            });
        });

        it("utilise SO pour les indicateurs de maturité cloud", () => {
            const sources = {
                modules: [createMockModule(1, "Module1")],
                qualiteModule: [],
                devopsModulesData: [],
                meteoData: [],
                a11yDataModules: [],
                securiteModules: []
            };

            const result = formattedModules(sources);

            expect(result[0]).toMatchObject({
                maturite: SO,
                robustesse: SO,
                scoreBenefice: SO,
                scoreComplexite: SO,
                scoreOrga: SO,
                scoreTechnique: SO,
                progressionDeploy: SO,
                progressionArchi: SO,
                progressionTechnos: SO,
                progressionCloud: SO,
                progressionDevops: SO,
                progressionMateqip: SO
            });
        });

        it("utilise SO pour météo absente (module)", () => {
            const sources = {
                modules: [createMockModule(1, "Module1")],
                qualiteModule: [],
                devopsModulesData: [],
                meteoData: [],
                a11yDataModules: [],
                securiteModules: []
            };

            const result = formattedModules(sources);

            expect(result[0]).toMatchObject({
                meteo: -1,
                meteoCommentaire: SO,
                dateMeteoCommentaire: SO
            });
        });
    });

    describe("indicateurs de qualité pour modules", () => {
        it("intègre les données de qualité", () => {
            const qualiteData: IndicateurQualiteView = {
                moduleId: 1,
                lettreCouvertureTestUniaire: "A",
                lettreFiabilite: "B",
                lettreGlobalQualite: "A"
            } as any;

            const sources = {
                modules: [createMockModule(1, "Module1")],
                qualiteModule: [qualiteData],
                devopsModulesData: [],
                meteoData: [],
                a11yDataModules: [],
                securiteModules: []
            };

            const result = formattedModules(sources);

            expect(result[0]).toMatchObject({
                lettreCouvertureTestUniaire: "A",
                lettreFiabilite: "B",
                lettreQualiteGenerale: "A"
            });
        });
    });

    describe("indicateurs de sécurité pour modules", () => {
        it("intègre les données de sécurité", () => {
            const securiteData: IndicateurSecuriteView = {
                moduleId: 1,
                lettreGlobaleSecurite: "B",
                lettreCve: "C",
                nbCveCritical: "1"
            } as any;

            const sources = {
                modules: [createMockModule(1, "Module1")],
                qualiteModule: [],
                devopsModulesData: [],
                meteoData: [],
                a11yDataModules: [],
                securiteModules: [securiteData]
            };

            const result = formattedModules(sources);

            expect(result[0]).toMatchObject({
                lettreGlobaleSecurite: "B",
                lettreCve: "C",
                nbCveCritical: "1"
            });
        });
    });

    describe("indicateurs DevOps pour modules", () => {
        it("intègre les données DevOps", () => {
            const devopsData: IndicateurDevopsView = {
                moduleId: 1,
                lettreGlobalDevops: "A",
                distanceCount: "10"
            } as any;

            const sources = {
                modules: [createMockModule(1, "Module1")],
                qualiteModule: [],
                devopsModulesData: [devopsData],
                meteoData: [],
                a11yDataModules: [],
                securiteModules: []
            };

            const result = formattedModules(sources);

            expect(result[0]).toMatchObject({
                lettreDevopsGenerale: "A",
                distanceCount: "10"
            });
        });
    });

    describe("indicateurs météo pour modules", () => {
        it("intègre les données météo en utilisant appName", () => {
            const meteoData: Meteo = {
                appName: "Module1",
                valeurMeteo: 2,
                commentaire: "Ensoleillé",
                date: "2026-01-12"
            };

            const sources = {
                modules: [createMockModule(1, "Module1")],
                qualiteModule: [],
                devopsModulesData: [],
                meteoData: [meteoData],
                a11yDataModules: [],
                securiteModules: []
            };

            const result = formattedModules(sources);

            expect(result[0]).toMatchObject({
                meteo: 2,
                meteoCommentaire: "Ensoleillé",
                dateMeteoCommentaire: "2026-01-12"
            });
        });

        it("filtre correctement les données météo par appName", () => {
            const sources = {
                modules: [createMockModule(1, "Module1")],
                qualiteModule: [],
                devopsModulesData: [],
                meteoData: [
                    { appName: "Module2", valeurMeteo: 3 } as any,
                    { appName: undefined, valeurMeteo: 4 } as any
                ],
                a11yDataModules: [],
                securiteModules: []
            };

            const result = formattedModules(sources);

            expect(result[0].meteo).toBe(-1);
        });
    });

    describe("indicateurs d'accessibilité pour modules", () => {
        it("intègre les données d'accessibilité", () => {
            const a11yData: IndicateursModuleA11Y = {
                idModule: 1,
                notation: "B",
                scoreAudit: 85,
                declaration: false
            };

            const sources = {
                modules: [createMockModule(1, "Module1")],
                qualiteModule: [],
                devopsModulesData: [],
                meteoData: [],
                a11yDataModules: [a11yData],
                securiteModules: []
            };

            const result = formattedModules(sources);

            expect(result[0]).toMatchObject({
                lettreA11y: "B",
                scoreAuditA11y: 85,
                declarationA11y: false
            });
        });
    });

    describe("scénarios multiples", () => {
        it("formate plusieurs modules avec indicateurs mixtes", () => {
            const sources = {
                modules: [
                    createMockModule(1, "Module1", "App1"),
                    createMockModule(2, "Module2", "App2"),
                    createMockModule(3, "Module3", "App1")
                ],
                qualiteModule: [
                    { moduleId: 1, lettreGlobalQualite: "A" } as any,
                    { moduleId: 3, lettreGlobalQualite: "B" } as any
                ],
                devopsModulesData: [{ moduleId: 2, lettreGlobalDevops: "C" } as any],
                meteoData: [],
                a11yDataModules: [],
                securiteModules: []
            };

            const result = formattedModules(sources);

            expect(result).toHaveLength(3);
            expect(result[0]).toMatchObject({
                applicationName: "Module1",
                parentApplication: "App1",
                lettreQualiteGenerale: "A",
                isModule: true
            });
            expect(result[1]).toMatchObject({
                applicationName: "Module2",
                parentApplication: "App2",
                lettreDevopsGenerale: "C",
                isModule: true
            });
            expect(result[2]).toMatchObject({
                applicationName: "Module3",
                parentApplication: "App1",
                lettreQualiteGenerale: "B",
                isModule: true
            });
        });
    });
});
