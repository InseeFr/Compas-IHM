import type { IndicateurApplicationSynthese } from "models/indicateurs";
import {
    getApplications,
    getApplications1,
    getApplications2,
    getIndicateurQualiteByApplication,
    getIndicateurQualiteByModule,
    getIndicateurSecuriteByApplication,
    getMaturiteCloud,
    getModules1,
    getModules2,
    listerApplicationsMeteo,
    listerModulesA11y,
    type Application,
    type IndicateurApplicationGreenITView,
    type IndicateurApplicationMaturiteCloud,
    type IndicateurDevopsView,
    type IndicateurQualiteView,
    type IndicateurSecuriteView,
    type IndicateursModuleA11Y,
    type Meteo,
    type Module
} from "todos-api/client.gen";
import type { ModuleData } from "./preview/application-preview-config";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function fetchApplicationSynthesis() {
    try {
        const [
            apps,
            modules,
            qualiteApp,
            qualiteMod,
            devopsApp,
            devopsMod,
            meteo,
            greenIt,
            a11y,
            securityApp,
            securityMod,
            maturite
        ] = await Promise.all([
            getApplications1(),
            getModules1(),
            getIndicateurQualiteByApplication(),
            getIndicateurQualiteByModule(),
            getApplications2(),
            getModules2(),
            listerApplicationsMeteo(),
            getApplications(),
            listerModulesA11y(),
            getIndicateurSecuriteByApplication(),
            getIndicateurQualiteByModule(),
            getMaturiteCloud()
        ]);

        const formattedApplications: IndicateurApplicationSynthese[] = apps.map(app =>
            buildFormattedApp(app, qualiteApp, devopsApp, meteo, greenIt, securityApp, maturite)
        );
        const formattedMod: IndicateurApplicationSynthese[] = modules.map(mod =>
            buildFormattedMod(mod, qualiteMod, devopsMod, meteo, securityMod, a11y)
        );
        return [formattedApplications, formattedMod];
    } catch (error) {
        console.error("Erreur lors de la récupération pour la synthèse d'application: ", error);
        return [];
    }
}

const NR: string = "NR";

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

const getAttribute = (entity?: string): string => {
    return entity ?? NR;
};

const buildFormattedApp = (
    app: Application,
    qualiteApp: IndicateurQualiteView[],
    devopsApp: IndicateurDevopsView[],
    meteo: Meteo[],
    greenIt: IndicateurApplicationGreenITView[],
    securityApp: IndicateurSecuriteView[],
    maturite: IndicateurApplicationMaturiteCloud[]
): IndicateurApplicationSynthese => {
    const getMeteo = findByIdApp(meteo, app);
    const quality = findByIdApp(qualiteApp, app);
    const noteDistanceApp = findByIdApp(devopsApp, app);
    const greenApp = findByIdApp(greenIt, app);
    const securiteApp = findByIdApp(securityApp, app);
    const maturiteCloudApp = findByIdApp(maturite, app);

    const appData: IndicateurApplicationSynthese = {
        applicationId: app.idApplication ?? -1,
        applicationName: getAttribute(app.appName),
        sndi: getAttribute(app.sndi),
        domaine: getAttribute(app.domaineSndi),
        domaineFonc: getAttribute(app.domaineFonctionnel),
        lettreCouvertureTestUnitaire: getAttribute(quality?.lettreCouvertureTestUnitaire),
        lettreFiabilite: getAttribute(quality?.lettreFiabilite),
        lettreDetteTechnique: getAttribute(quality?.lettreDetteTechnique),
        lettreNiveauCve: getAttribute(securiteApp?.lettreGlobaleSecurite),
        pourcentageCouvertureTestUniaire: getAttribute(quality?.pourcentageCouvertureTestUnitaire),
        nbCveCritical: getAttribute(securiteApp?.nbCveCritical),
        nbCveHigh: getAttribute(securiteApp?.nbCveHigh),
        nbCveLow: getAttribute(securiteApp?.nbCveLow),
        nbCveMedium: getAttribute(securiteApp?.nbCveMedium),
        distanceNote: getAttribute(noteDistanceApp?.lettreDistanceCount),
        distanceValue: getAttribute(noteDistanceApp?.distanceCount),
        meteo: getMeteo ? getMeteo.valeurMeteo : -1,
        meteoCommentaire: getAttribute(getMeteo?.commentaire),
        dateMeteoCommentaire: getAttribute(getMeteo?.date),
        conso: getAttribute(greenApp?.conso),
        lettreGreen: getAttribute(greenApp?.lettreGreen),
        gaspillage: getAttribute(greenApp?.gaspillageScore),
        consoNormalized: getAttribute(greenApp?.consoScore),
        impactNormalized: getAttribute(greenApp?.impactScore),
        lettreA11y: NR,
        scoreAuditA11y: -1,
        lettreQualiteGenerale: getAttribute(quality?.lettreGlobalQualite),
        detteTechnique: getAttribute(quality?.detteTechnique).replace(/\.00$/, ""),
        maturite: getAttribute(maturiteCloudApp?.maturite),
        robustesse: getAttribute(maturiteCloudApp?.robustesse)
    };
    return appData;
};

const buildFormattedMod = (
    module: Module,
    qualiteMod: IndicateurQualiteView[],
    devopsMod: IndicateurDevopsView[],
    meteo: Meteo[],
    securityMod: IndicateurSecuriteView[],
    a11y: IndicateursModuleA11Y[]
): IndicateurApplicationSynthese => {
    const getMeteo = findByIdMod(meteo, module);
    const qualite = findByIdMod(qualiteMod, module);
    const noteDistanceMod = findByIdMod(devopsMod, module);
    const securiteMod = findByIdMod(securityMod, module);
    const getA11y = findByIdMod(a11y, module);

    const appData: IndicateurApplicationSynthese = {
        isModule: true,
        applicationId: module.id ?? -1,
        applicationName: getAttribute(module.modName),
        parentApplication: getAttribute(module.appName),
        sndi: getAttribute(module.sndi),
        domaine: getAttribute(module.domaineSndi),
        domaineFonc: getAttribute(module.domaineFonctionnel),
        lettreCouvertureTestUnitaire: getAttribute(qualite?.lettreCouvertureTestUnitaire),
        lettreFiabilite: getAttribute(qualite?.lettreFiabilite),
        lettreDetteTechnique: getAttribute(qualite?.lettreDetteTechnique),
        lettreNiveauCve: getAttribute(securiteMod?.lettreGlobaleSecurite),
        pourcentageCouvertureTestUniaire: getAttribute(qualite?.pourcentageCouvertureTestUnitaire),
        nbCveCritical: getAttribute(securiteMod?.nbCveCritical),
        nbCveHigh: getAttribute(securiteMod?.nbCveHigh),
        nbCveLow: getAttribute(securiteMod?.nbCveLow),
        nbCveMedium: getAttribute(securiteMod?.nbCveMedium),
        distanceNote: getAttribute(noteDistanceMod?.lettreDistanceCount),
        distanceValue: getAttribute(noteDistanceMod?.distanceCount),
        meteo: getMeteo ? getMeteo.valeurMeteo : -1,
        meteoCommentaire: getAttribute(getMeteo?.commentaire),
        dateMeteoCommentaire: getAttribute(getMeteo?.date),
        conso: NR,
        lettreGreen: NR,
        gaspillage: NR,
        consoNormalized: NR,
        impactNormalized: NR,
        lettreA11y: getAttribute(getA11y?.notation),
        scoreAuditA11y: getA11y ? getA11y.scoreAudit : 0,
        lettreQualiteGenerale: getAttribute(qualite?.lettreGlobalQualite),
        detteTechnique: getAttribute(qualite?.detteTechnique).replace(/\.00$/, "")
    };
    return appData;
};

const createCanvas = async (report: HTMLElement): Promise<HTMLCanvasElement> => {
    return await html2canvas(report, {
        scale: 2,
        useCORS: true
    });
};

const pdfConfig = (pdf: jsPDF, canvas: HTMLCanvasElement): jsPDF => {
    const imgData: string = canvas.toDataURL("image/png");

    const pageWidth: number = pdf.internal.pageSize.getWidth();
    const pageHeight: number = pdf.internal.pageSize.getHeight();
    const imgWidthPx: number = canvas.width;
    const imgHeightPx: number = canvas.height;

    const pxToMm = (px: number) => px * 0.264583;
    const imgWidthMm: number = pxToMm(imgWidthPx);
    const imgHeightMm: number = pxToMm(imgHeightPx);

    const ratio: number = Math.min(pageWidth / imgWidthMm, pageHeight / imgHeightMm);
    const pdfWidth: number = imgWidthMm * ratio;
    const pdfHeight: number = imgHeightMm * ratio;

    const marginX: number = (pageWidth - pdfWidth) / 2;
    const marginY: number = (pageHeight - pdfHeight) / 2;

    return pdf.addImage(imgData, "PNG", marginX, marginY, pdfWidth, pdfHeight);
};

export const handleGenerateReport = async (appName: string): Promise<void> => {
    let pdf = new jsPDF("p", "mm", "a4");
    const reportElement: HTMLElement | null = document.getElementById("app-report-pdf");
    if (!reportElement) return;
    const canvas: HTMLCanvasElement = await createCanvas(reportElement);
    pdf = pdfConfig(pdf, canvas);
    pdf.save(`rapport-${appName}.pdf`);
};

export const normalize = (value: undefined | number | string): string =>
    String(value ?? "")
        .trim()
        .toLowerCase();

const parseNumericValue = (value: string | undefined | null): number | undefined => {
    if (value == null) return undefined;
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
};
export const transformModuleData = (module: IndicateurApplicationSynthese): ModuleData => ({
    name: module.applicationName ?? "NR",
    qualite: module.lettreQualiteGenerale ?? "NR",
    couverture: module.pourcentageCouvertureTestUniaire,
    dette: parseNumericValue(module.detteTechnique),
    a11y: module.lettreA11y ?? "NR",
    distance: parseNumericValue(module.distanceValue),
    lettreGreen: module.lettreGreen ?? undefined,
    lettreNiveauCve: module.lettreNiveauCve ?? undefined
});
