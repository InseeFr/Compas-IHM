import type { GlobalIndicator } from "models/indicateurs";
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

const NR: string = "NR";
const SO: string = "SO";

interface ApplicationDataSources {
    apps: Application[];
    qualiteAppData: IndicateurQualiteView[];
    devopsAppData: IndicateurDevopsView[];
    meteoData: Meteo[];
    consoAppData: IndicateurApplicationGreenITView[];
    a11yDataApps: IndicateursModuleA11Y[];
    securiteApps: IndicateurSecuriteView[];
    maturiteCloudApps: IndicateurApplicationMaturiteCloud[];
}

interface ModuleDataSources {
    modules: Module[];
    qualiteModule: IndicateurQualiteView[];
    devopsModulesData: IndicateurDevopsView[];
    meteoData: Meteo[];
    a11yDataModules: IndicateursModuleA11Y[];
    securiteModules: IndicateurSecuriteView[];
}

export const findBy = <T, K extends string | number | symbol>(
    array: T[],
    key: (item: T) => K | undefined
): Record<K, T> => {
    return array.reduce(
        (acc, item) => {
            const k = key(item);
            if (k !== undefined) {
                acc[k] = item;
            }
            return acc;
        },
        {} as Record<K, T>
    );
};

const getValueOrDefault = <T>(value: T | undefined): T | typeof NR => value ?? NR;

const createQualiteIndicators = (
    qualite: IndicateurQualiteView | undefined
): Partial<GlobalIndicator> => ({
    lettreCouvertureTestUniaire: getValueOrDefault(qualite?.lettreCouvertureTestUniaire),
    lettreFiabilite: getValueOrDefault(qualite?.lettreFiabilite),
    lettreDetteTechnique: getValueOrDefault(qualite?.lettreDetteTechnique),
    lettreQualiteGenerale: getValueOrDefault(qualite?.lettreGlobalQualite),
    pourcentageCouvertureTestUniaire: getValueOrDefault(qualite?.pourcentageCouvertureTestUniaire),
    detteTechnique: getValueOrDefault(qualite?.detteTechnique?.replace(/\.00$/, ""))
});

const createSecuriteIndicators = (
    securite: IndicateurSecuriteView | undefined
): Partial<GlobalIndicator> => ({
    lettreGlobaleSecurite: getValueOrDefault(securite?.lettreGlobaleSecurite),
    lettreCve: getValueOrDefault(securite?.lettreCve),
    nbCveCritical: getValueOrDefault(securite?.nbCveCritical),
    nbCveHigh: getValueOrDefault(securite?.nbCveHigh),
    nbCveLow: getValueOrDefault(securite?.nbCveLow),
    nbCveMedium: getValueOrDefault(securite?.nbCveMedium),
    delaiVmNonMiseAjour: getValueOrDefault(securite?.delaiVmNonMiseAjour),
    nbVmNonMaj: getValueOrDefault(securite?.nbVmNonMaj)
});

const createDevopsIndicators = (devops: IndicateurDevopsView | undefined): Partial<GlobalIndicator> => ({
    lettreDistanceCount: getValueOrDefault(devops?.lettreDistanceCount),
    distanceCount: getValueOrDefault(devops?.distanceCount),
    lettreDeploymentCount: getValueOrDefault(devops?.lettreDeploymentCount),
    nbDeploymentCount: getValueOrDefault(devops?.nbDeploymentCount),
    lettreContributorCount: getValueOrDefault(devops?.lettreContributorCount),
    nbContributorCount: getValueOrDefault(devops?.nbContributorCount),
    lettreDevopsGenerale: getValueOrDefault(devops?.lettreGlobalDevops)
});

const createMeteoIndicators = (
    meteo: Meteo | undefined,
    isModule: boolean = false
): Partial<GlobalIndicator> => {
    console.log(meteo);
    return {
        meteo: meteo?.valeurMeteo ?? -1,
        meteoCommentaire: meteo?.commentaire ?? (isModule ? SO : NR),
        dateMeteoCommentaire: meteo?.date ?? (isModule ? SO : NR)
    };
};

const createGreenITIndicators = (
    greenApp: IndicateurApplicationGreenITView | undefined
): Partial<GlobalIndicator> => ({
    conso: getValueOrDefault(greenApp?.conso),
    lettreGreen: getValueOrDefault(greenApp?.lettreGreen),
    gaspillage: getValueOrDefault(greenApp?.gaspillageScore),
    consoNormalized: getValueOrDefault(greenApp?.consoScore),
    impactNormalized: getValueOrDefault(greenApp?.impactScore),
    ramAllocated: getValueOrDefault(greenApp?.ramAllocated),
    ramMaxi: getValueOrDefault(greenApp?.ramMaxi),
    diskAllocated: getValueOrDefault(greenApp?.diskAllocated),
    diskUsed: getValueOrDefault(greenApp?.diskUsed),
    cpuAllocated: getValueOrDefault(greenApp?.cpuAllocated),
    cpuMaxi: getValueOrDefault(greenApp?.cpuMaxi),
    nbVm: getValueOrDefault(greenApp?.nbVm),
    ramAllocatedProd: getValueOrDefault(greenApp?.ramAllocatedProd),
    ramMaxiProd: getValueOrDefault(greenApp?.ramMaxiProd),
    diskAllocatedProd: getValueOrDefault(greenApp?.diskAllocatedProd),
    diskUsedProd: getValueOrDefault(greenApp?.diskUsedProd),
    cpuAllocatedProd: getValueOrDefault(greenApp?.cpuAllocatedProd),
    cpuMaxiProd: getValueOrDefault(greenApp?.cpuMaxiProd),
    nbVmProd: getValueOrDefault(greenApp?.nbVmProd),
    consoProd: getValueOrDefault(greenApp?.consoProd)
});

const MODULE_GREEN_IT_DEFAULTS: Partial<GlobalIndicator> = {
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
};

const createA11yIndicators = (a11y: IndicateursModuleA11Y | undefined): Partial<GlobalIndicator> => ({
    lettreA11y: getValueOrDefault(a11y?.notation),
    scoreAuditA11y: a11y?.scoreAudit ?? 0,
    declarationA11y: a11y?.declaration ?? false,
    dateDeclarationA11y: a11y?.dateDeclaration
});

const createMaturiteCloudIndicators = (
    maturite: IndicateurApplicationMaturiteCloud | undefined
): Partial<GlobalIndicator> => ({
    maturite: getValueOrDefault(maturite?.maturite),
    robustesse: getValueOrDefault(maturite?.robustesse),
    scoreBenefice: getValueOrDefault(maturite?.scoreBenefice),
    scoreComplexite: getValueOrDefault(maturite?.scoreComplexite),
    scoreOrga: getValueOrDefault(maturite?.scoreOrga),
    scoreTechnique: getValueOrDefault(maturite?.scoreTechnique),
    progressionDeploy: getValueOrDefault(maturite?.progressionDeploy),
    progressionArchi: getValueOrDefault(maturite?.progressionArchi),
    progressionTechnos: getValueOrDefault(maturite?.progressionTechnos),
    progressionCloud: getValueOrDefault(maturite?.progressionCloud),
    progressionDevops: getValueOrDefault(maturite?.progressionDevops),
    progressionMateqip: getValueOrDefault(maturite?.progressionMateqip)
});

const MODULE_MATURITE_CLOUD_DEFAULTS: Partial<GlobalIndicator> = {
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
};

export const formattedApps = (sources: ApplicationDataSources): GlobalIndicator[] => {
    const qualiteById = findBy(sources.qualiteAppData, q => q.applicationId);
    const devopsById = findBy(sources.devopsAppData, d => d.applicationId);
    const meteoByName = findBy(sources.meteoData, m => m.idApplication);
    const consoByName = findBy(
        sources.consoAppData.filter(g => g.applicationName !== undefined),
        g => g.applicationName!
    );
    const a11yById = findBy(sources.a11yDataApps, a => a.idApplication);
    const securiteById = findBy(sources.securiteApps, s => s.applicationId);
    const maturiteById = findBy(sources.maturiteCloudApps, m => m.applicationId);

    return sources.apps.map(app => {
        const appId = app.idApplication;
        const appName = app.appName ?? NR;

        const qualite = appId ? qualiteById[appId] : undefined;
        const devops = appId ? devopsById[appId] : undefined;
        const meteo = appId ? meteoByName[appId] : undefined;
        const greenApp = consoByName[appName];
        const accessibiliteApp = appId ? a11yById[appId] : undefined;
        const securiteApp = appId ? securiteById[appId] : undefined;
        const maturiteCloudApp = appId ? maturiteById[appId] : undefined;

        return {
            idApplication: appId,
            applicationName: appName,
            sndi: app.sndi ?? NR,
            domaine: app.domaineSndi ?? NR,
            domaineFonc: app.domaineFonctionnel ?? NR,
            ...createQualiteIndicators(qualite),
            ...createSecuriteIndicators(securiteApp),
            ...createDevopsIndicators(devops),
            ...createMeteoIndicators(meteo, false),
            ...createGreenITIndicators(greenApp),
            ...createA11yIndicators(accessibiliteApp),
            ...createMaturiteCloudIndicators(maturiteCloudApp)
        } as GlobalIndicator;
    });
};

export const formattedModules = (sources: ModuleDataSources): GlobalIndicator[] => {
    const qualiteMod = findBy(sources.qualiteModule, q => q.moduleId);
    const devopsById = findBy(sources.devopsModulesData, d => d.moduleId);
    const meteoByName = findBy(
        sources.meteoData.filter(m => m.appName !== undefined),
        m => m.appName!
    );
    const a11yById = findBy(sources.a11yDataModules, a => a.idModule);
    const securiteById = findBy(sources.securiteModules, s => s.moduleId);

    return sources.modules.map(module => {
        const moduleId = module.id;
        const moduleName = module.modName ?? NR;

        const devops = moduleId ? devopsById[moduleId] : undefined;
        const meteo = meteoByName[moduleName];
        const accessibiliteModule = moduleId ? a11yById[moduleId] : undefined;
        const securiteModule = moduleId ? securiteById[moduleId] : undefined;
        const qualiteModule = moduleId ? qualiteMod[moduleId] : undefined;

        return {
            applicationName: moduleName,
            sndi: module.sndi ?? NR,
            domaine: module.domaineSndi ?? NR,
            domaineFonc: module.domaineFonctionnel ?? NR,
            isModule: true,
            parentApplication: module.appName ?? NR,
            ...createQualiteIndicators(qualiteModule),
            ...createSecuriteIndicators(securiteModule),
            ...createDevopsIndicators(devops),
            ...createMeteoIndicators(meteo, true),
            ...createA11yIndicators(accessibiliteModule),
            ...MODULE_GREEN_IT_DEFAULTS,
            ...MODULE_MATURITE_CLOUD_DEFAULTS
        } as GlobalIndicator;
    });
};
