export interface DevopsIndicateur {
    applicationName: string;
    sndi: string;
    domaine: string;
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
    lettreCouvertureTestUniaire: string;
    lettreFiabilite?: string;
    lettreDetteTechnique?: string;
    pourcentageCouvertureTestUnitaire: string;
    grade?: string;
    isModule?: boolean;
    parentApplication?: string;
    detteTechnique?: string;
    lettreQualiteGenerale?: string;
}

export interface GreenITIndicateur {
    applicationName: string;
    sndi: string;
    domaine: string;

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
    domaineSndi: string;
    notation?: string;
    lettreIssueAccessibilite?: string;
    nbIssueAccessibilite?: string;
}

export interface MeteoPoint {
    date: string;
    valeur: string;
    commentaire?: string;
}
export interface MeteoIndicateur {
    idApp: number;
    applicationName: string;
    sndi: string;
    domaine: string;
    byMonth: Record<string, MeteoPoint[]>;
}
