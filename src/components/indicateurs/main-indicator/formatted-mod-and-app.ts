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

const findByIdApp = <T extends { applicationId?: number; idApplication?: number }>(
    indicateur: T[],
    app: Application
): T | undefined => {
    return indicateur.find(
        i => i.applicationId === app.idApplication || i.idApplication === app.idApplication
    );
};

const findByIdMod = <T extends { moduleId?: number; appName?: string; idModule?: number }>(
    indicateur: T[],
    module: Module
): T | undefined => {
    return indicateur.find(
        i => i.moduleId === module.id || i.appName === module.appName || i.idModule === module.id
    );
};

const numberOrDefault = (value?: number | null): number | undefined =>
    value ?? -1;

const stringOrNR = (value?: string | null): string  =>
    value ?? NR;

const createQualiteIndicators = (
    qualite?: IndicateurQualiteView
) => ({
    lettreCouvertureTestUniaire: stringOrNR(qualite?.lettreCouvertureTestUniaire),
    lettreFiabilite: stringOrNR(qualite?.lettreFiabilite),
    lettreDetteTechnique: stringOrNR(qualite?.lettreDetteTechnique),
    lettreQualiteGenerale: stringOrNR(qualite?.lettreGlobalQualite),
    pourcentageCouvertureTestUniaire: stringOrNR(qualite?.pourcentageCouvertureTestUniaire),
    detteTechnique: qualite?.detteTechnique
        ? qualite.detteTechnique.replace(/\.00$/, "")
        : NR
});

const createSecuriteIndicators = (
    securite?: IndicateurSecuriteView
) => ({
    lettreGlobaleSecurite: stringOrNR(securite?.lettreGlobaleSecurite),
    lettreCve: stringOrNR(securite?.lettreCve),

    nbCveCritical: stringOrNR(securite?.nbCveCritical?.toString()),
    nbCveHigh: stringOrNR(securite?.nbCveHigh?.toString()),
    nbCveLow: stringOrNR(securite?.nbCveLow?.toString()),
    nbCveMedium: stringOrNR(securite?.nbCveMedium?.toString()),

    delaiVmNonMiseAjour: stringOrNR(securite?.delaiVmNonMiseAjour),
    nbVmNonMaj: stringOrNR(securite?.nbVmNonMaj)
});

const createDevopsIndicators = (
    devops?: IndicateurDevopsView
) => ({
    lettreDistanceCount: stringOrNR(devops?.lettreDistanceCount),
    lettreDeploymentCount: stringOrNR(devops?.lettreDeploymentCount),
    lettreContributorCount: stringOrNR(devops?.lettreContributorCount),
    lettreDevopsGenerale: stringOrNR(devops?.lettreGlobalDevops),

    distanceCount: stringOrNR(devops?.distanceCount?.toString()),
    nbDeploymentCount: stringOrNR(devops?.nbDeploymentCount?.toString()),
    nbContributorCount: stringOrNR(devops?.nbContributorCount?.toString())
});

const createMeteoIndicators = (
    meteo?: Meteo,
    isModule = false
) => ({
    meteo: numberOrDefault(meteo?.valeurMeteo),
    meteoCommentaire: meteo?.commentaire ?? (isModule ? SO : NR),
    dateMeteoCommentaire: meteo?.date ?? (isModule ? SO : NR)
});

const createGreenITIndicators = (
    greenApp?: IndicateurApplicationGreenITView
) => ({
    conso: stringOrNR(greenApp?.conso),
    lettreGreen: stringOrNR(greenApp?.lettreGreen),
    gaspillage: stringOrNR(greenApp?.gaspillageScore),
    consoNormalized: stringOrNR(greenApp?.consoScore),
    impactNormalized: stringOrNR(greenApp?.impactScore),

    ramAllocated: stringOrNR(greenApp?.ramAllocated),
    ramMaxi: stringOrNR(greenApp?.ramMaxi),
    diskAllocated: stringOrNR(greenApp?.diskAllocated),
    diskUsed: stringOrNR(greenApp?.diskUsed),
    cpuAllocated: stringOrNR(greenApp?.cpuAllocated),
    cpuMaxi: stringOrNR(greenApp?.cpuMaxi),
    nbVm: stringOrNR(greenApp?.nbVm),

    ramAllocatedProd: stringOrNR(greenApp?.ramAllocatedProd),
    ramMaxiProd: stringOrNR(greenApp?.ramMaxiProd),
    diskAllocatedProd: stringOrNR(greenApp?.diskAllocatedProd),
    diskUsedProd: stringOrNR(greenApp?.diskUsedProd),
    cpuAllocatedProd: stringOrNR(greenApp?.cpuAllocatedProd),
    cpuMaxiProd: stringOrNR(greenApp?.cpuMaxiProd),
    nbVmProd: stringOrNR(greenApp?.nbVmProd),
    consoProd: stringOrNR(greenApp?.consoProd)
});

const MODULE_GREEN_IT_DEFAULTS = {
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

const createA11yIndicators = (
    a11y?: IndicateursModuleA11Y
) => ({
    lettreA11y: stringOrNR(a11y?.notation),
    scoreAuditA11y: numberOrDefault(a11y?.scoreAudit),
    declarationA11y: a11y?.declaration ?? undefined,
    dateDeclarationA11y:  stringOrNR(a11y?.dateDeclaration)
});

const createMaturiteCloudIndicators = (
    maturite?: IndicateurApplicationMaturiteCloud
) => ({
    maturite: stringOrNR(maturite?.maturite),
    robustesse: stringOrNR(maturite?.robustesse),
    scoreBenefice: stringOrNR(maturite?.scoreBenefice),
    scoreComplexite: stringOrNR(maturite?.scoreComplexite),
    scoreOrga: stringOrNR(maturite?.scoreOrga),
    scoreTechnique: stringOrNR(maturite?.scoreTechnique),

    progressionDeploy: stringOrNR(maturite?.progressionDeploy),
    progressionArchi: stringOrNR(maturite?.progressionArchi),
    progressionTechnos: stringOrNR(maturite?.progressionTechnos),
    progressionCloud: stringOrNR(maturite?.progressionCloud),
    progressionDevops: stringOrNR(maturite?.progressionDevops),
    progressionMateqip: stringOrNR(maturite?.progressionMateqip)
});


const MODULE_MATURITE_CLOUD_DEFAULTS = {
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
    return sources.apps.map(app => {
        const qualiteByName = findByIdApp(sources.qualiteAppData, app);
        const meteoByName = findByIdApp(sources.meteoData, app);
        const devopsByName = findByIdApp(sources.devopsAppData, app);
        const greenIt = findByIdApp(sources.consoAppData, app);
        const a11y = findByIdApp(sources.a11yDataApps , app);
        const maturiteByName = findByIdApp(sources.maturiteCloudApps, app);
        const securiteApp = findByIdApp(sources.securiteApps, app);


        const result: GlobalIndicator =  {
            idApplication: app.idApplication,
            applicationName: app.appName ?? "",
            sndi: app.sndi ?? NR,
            domaine: app.domaineSndi ?? NR,
            domaineFonc: app.domaineFonctionnel ?? NR,
            ...createGreenITIndicators(greenIt),
            ...createMeteoIndicators(meteoByName),
            ...createDevopsIndicators(devopsByName),
            ...createMaturiteCloudIndicators(maturiteByName),
            ...createQualiteIndicators(qualiteByName),
            ...createSecuriteIndicators(securiteApp),
            ...createA11yIndicators(a11y)
        };
        return result;
    });
};

export const formattedModules = (sources: ModuleDataSources): GlobalIndicator[] => {
    return sources.modules.map(module => {
        const qualiteMod = findByIdMod(sources.qualiteModule, module);
        const devopsById = findByIdMod(sources.devopsModulesData, module);
        const meteoByName = findByIdMod(sources.meteoData, module);
        const a11yById = findByIdMod(sources.a11yDataModules, module);
        const securiteById = findByIdMod(sources.securiteModules, module);
        return {
            applicationName: module.appName ?? "",
            sndi: module.sndi ?? NR,
            domaine: module.domaineSndi ?? NR,
            domaineFonc: module.domaineFonctionnel ?? NR,
            isModule: true,
            parentApplication: module.appName ?? NR,
            ...createQualiteIndicators(qualiteMod),
            ...createSecuriteIndicators(securiteById),
            ...createDevopsIndicators(devopsById),
            ...createMeteoIndicators(meteoByName, true),
            ...createA11yIndicators(a11yById),
            ...MODULE_GREEN_IT_DEFAULTS,
            ...MODULE_MATURITE_CLOUD_DEFAULTS
        };
    });
};
