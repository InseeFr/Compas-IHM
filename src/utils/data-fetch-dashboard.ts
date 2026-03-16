import { formattedApps } from "pages/indicateurs/main-indicator/formatted-mod-and-app";
import {
    getApplications1,
    getIndicateurQualiteByApplication,
    getApplications2,
    listerApplicationsMeteo,
    getApplications,
    listerApplicationA11y,
    getIndicateurSecuriteByApplication,
    getMaturiteCloud
} from "todos-api/client.gen";

export const fetchData = async () => {
    try {
        const [
            apps,
            qualiteAppData,
            devopsAppData,
            meteoData,
            consoAppData,
            a11yDataApps,
            securiteApps,
            maturiteCloudApps
        ] = await Promise.all([
            getApplications1(),
            getIndicateurQualiteByApplication(),
            getApplications2(),
            listerApplicationsMeteo(),
            getApplications(),
            listerApplicationA11y(),
            getIndicateurSecuriteByApplication(),
            getMaturiteCloud()
        ]);
        const formattedApplications = formattedApps({
            apps,
            qualiteAppData,
            devopsAppData,
            meteoData,
            consoAppData,
            a11yDataApps,
            securiteApps,
            maturiteCloudApps
        });
        return formattedApplications;
    } catch (error) {
        console.error("Erreur chargement données qualité:", error);
    }
};
