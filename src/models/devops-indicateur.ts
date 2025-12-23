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
