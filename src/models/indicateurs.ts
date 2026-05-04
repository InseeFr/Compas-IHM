import type { Trend } from "constantes/trend.utils";

export interface IndicateurApplicationMaturite {
    applicationId?: number;
    sndi: string;
    domaine: string;
    domaineFonc: string;
    maturite?: string;
    robustesse?: string;

    scoreBenefice?: string;
    scoreComplexite?: string;
    scoreOrga?: string;
    scoreTechnique?: string;

    progressionDeploy?: string;
    progressionArchi?: string;
    progressionTechnos?: string;
    progressionCloud?: string;
    progressionDevops?: string;
    progressionMateqip?: string;

    applicationName?: string;
}

export interface DevopsIndicateur {
    applicationName: string;
    sndi: string;
    domaine: string;
    domaineFonc: string;
    lettreContributorCount: string;
    lettreDeploymentCount: string;
    lettreDistanceCount: string;
    lettreGlobalDevops: string;
    distanceCount: string;
    nbDeploymentCount: string;
    nbContributorCount: string;
    grade?: string;
    isModule?: boolean;
    parentApplication?: string;
}

export interface QualiteIndicateur {
    applicationId?: number;
    applicationName: string;
    sndi: string;
    domaine: string;
    domaineFonc: string;
    lettreCouvertureTestUnitaire: string;
    lettreFiabilite?: string;
    lettreDetteTechnique?: string;
    pourcentageCouvertureTestUnitaire: string;
    grade?: string;
    isModule?: boolean;
    parentApplication?: string;
    detteTechnique?: string;
    lettreQualiteGenerale?: string;
    tendanceTestUnitaire: Trend;
    tendanceFiabilite: Trend;
    tendanceDetteTechnique: Trend;
}

export interface GreenITIndicateur {
    applicationName: string;
    sndi: string;
    domaine: string;
    domaineFonc: string;

    consoGlobal: string;
    cpuAllocatedGlobal: string;
    diskAllocatedGlobal: string;
    ramAllocatedGlobal: string;
    nbVMGlobal: string;

    consoProd: string;
    cpuAllocatedProd: string;
    diskAllocatedProd: string;
    ramAllocatedProd: string;
    nbVMProd: string;

    consoNormalized: string;
    impactNormalized: string;
    gaspillage: string;
    lettreGreen: string;

    isModule?: boolean;
    parentApplication?: string;

    _conso?: string;
    _cpu?: string;
    _ram?: string;
    _disk?: string;
    _nbVm?: string;

    _consoSort?: number | null;
    _cpuSort?: number | null;
    _ramSort?: number | null;
    _diskSort?: number | null;
    _nbVmSort?: number | null;
}

export interface SecuriteIndicateur {
    applicationId?: number;
    moduleId?: number;
    applicationName: string;
    sndi: string;
    domaine: string;
    domaineFonc: string;
    nbCveCritical?: string;
    nbCveHigh?: string;
    nbCveMedium?: string;
    nbCveLow?: string;
    nbVmNonMaj?: string;
    lettreCve?: string;
    delaiVmNonMiseAjour?: string;
    lettreMajVm?: string;
    lettreGlobaleSecurite?: string;
    lettreGlobale?: string;
    isModule?: boolean;
    parentApplication?: string;
    lettreNiveauCve?: string;
}

export interface A11yIndicateur {
    modName: string;
    sndi: string;
    domaine: string;
    domaineFonc: string;
    notation?: string;
    lettreIssueAccessibilite?: string;
    nbIssueAccessibilite?: string;
    declaration?: {
        hasDeclaration: boolean;
        dateDeclaration: string;
    };
    audit: {
        score: string;
        auditType: string;
        dateAudit: string;
    };
}

export interface MeteoPoint {
    date: string;
    valeur: number;
    commentaire?: string;
}
export interface MeteoIndicateur {
    idApp: number;
    applicationName: string;
    sndi: string;
    domaine: string;
    domaineFonc: string;
    byMonth: Record<string, MeteoPoint[]>;
}

export interface AppsIndicateur {
    idApplication: number;
    appName: string;
    domaine: string;
    domaineFonc: string;
    sndi: string;
}

export interface FilterableItem {
    isModule?: boolean;
    sndi?: string;
    domaine?: string;
    domaineFonc?: string;
}

export interface ModsIndicateur {
    id?: number;
    nomTechnique?: string;
    applicationTechnique?: string;
    sourceCreation?: string;
    modName?: string;
    idApplication?: number;
    appName?: string;
    domaine: string;
    domaineFonc: string;
    keySonar?: string;
    sndi: string;
    statut?: string;
    dateDerniereLivraisonEnProduction?: string;
    typeLivrable?: string;
    urlCodeSource?: string;
}

export interface DemandeCreationStrategieCloud {
    idsModule: number[];
    strategieCloud: string;
    envCibleProd: string;
    commentaire: string;
}

export interface GlobalIndicator {
    idApplication?: number;
    applicationName: string;
    sndi: string;
    domaine: string;
    domaineFonc: string;
    lettreCouvertureTestUnitaire: string;
    lettreFiabilite?: string;
    lettreDetteTechnique?: string;
    lettreGlobaleSecurite: string;
    pourcentageCouvertureTestUniaire: string;
    nbLigneCode?: string;
    nbCveCritical: string;
    nbCveHigh: string;
    nbCveLow: string;
    nbCveMedium: string;
    lettreCve: string;
    delaiVmNonMiseAjour?: string;
    nbVmNonMaj?: string;
    grade?: string;
    isModule?: boolean;
    parentApplication?: string;
    lettreContributorCount?: string;
    lettreDeploymentCount?: string;
    lettreDistanceCount?: string;
    distanceCount?: string;
    nbDeploymentCount?: string;
    nbContributorCount?: string;
    meteo?: number;
    meteoCommentaire?: string;
    dateMeteoCommentaire?: string;
    declarationA11y?: boolean;
    dateDeclarationA11y?: string;

    conso?: string;
    consoNormalized: string;
    impactNormalized: string;
    gaspillage: string;
    lettreGreen?: string;

    ramAllocated?: string;
    ramMaxi?: string;
    diskAllocated?: string;
    diskUsed?: string;
    cpuAllocated?: string;
    cpuMaxi?: string;
    nbVm?: string;

    ramAllocatedProd?: string;
    ramMaxiProd?: string;
    diskAllocatedProd?: string;
    diskUsedProd?: string;
    cpuAllocatedProd?: string;
    cpuMaxiProd?: string;
    nbVmProd?: string;
    consoProd?: string;

    lettreA11y?: string;
    scoreAuditA11y?: number;
    typeAuditA11yId?: number;
    typeAuditA11yLibelle?: string;
    lettreQualiteGenerale?: string;
    lettreDevopsGenerale?: string;
    detteTechnique?: string;

    maturite?: string;
    robustesse?: string;
    scoreBenefice?: string;
    scoreComplexite?: string;
    scoreOrga?: string;
    scoreTechnique?: string;

    progressionDeploy?: string;
    progressionArchi?: string;
    progressionTechnos?: string;
    progressionCloud?: string;
    progressionDevops?: string;
    progressionMateqip?: string;
}

export interface IndicateurApplicationSynthese {
    applicationId: number;
    applicationName: string;
    sndi: string;
    domaine: string;
    domaineFonc: string;
    lettreCouvertureTestUnitaire: string;
    lettreFiabilite?: string;
    lettreDetteTechnique?: string;
    lettreNiveauCve: string;
    pourcentageCouvertureTestUniaire: string;
    nbCveCritical: string;
    nbCveHigh: string;
    nbCveLow: string;
    nbCveMedium: string;
    grade?: string;
    isModule?: boolean;
    parentApplication?: string;
    distanceNote?: string;
    distanceValue?: string;
    meteo?: number;
    conso?: string;
    lettreGreen?: string;
    lettreA11y?: string;
    scoreAuditA11y?: number;
    lettreQualiteGenerale?: string;
    detteTechnique?: string;
    meteoCommentaire?: string;
    dateMeteoCommentaire?: string;
    maturite?: string;
    robustesse?: string;
    gaspillage?: string;
    consoNormalized?: string;
    impactNormalized?: string;
    sensitivity?: string;
    statutHomologation?: string;
    homologationBeginDate?: string;
    homologationEndDate?: string;
    homologationSI?: string;
}

export interface StrategieCloudIndicateur {
    applicationName: string;
    commentaire: string;
    ecartCible: string;
    envActuelProd: string;
    envCibleProd: string;
    idApp: number;
    idModule: number;
    isModule?: boolean;
    maturiteCloud: string;
    sndi: string;
    domaine: string;
    domaineFonc: string;
    stratCloud: string;
    tauxCloud: string;
    parentApplication?: string;
}

export type AllIndicators =
    | MeteoIndicateur
    | QualiteIndicateur
    | SecuriteIndicateur
    | DevopsIndicateur
    | GreenITIndicateur
    | A11yIndicateur
    | AppsIndicateur
    | ModsIndicateur
    | IndicateurApplicationMaturite
    | IndicateurApplicationSynthese
    | GlobalIndicator
    | StrategieCloudIndicateur;
