import { describe, it, expect } from "vitest";
import type { IndicateurApplicationSynthese } from "models/indicateurs";
import { generateNarrative } from "pages/dashboards/applications/preview/application-preview-config";

const baseApp: IndicateurApplicationSynthese = {
    applicationId: 1,
    applicationName: "My App",
    sndi: "",
    domaine: "",
    domaineFonc: "",
    lettreCouvertureTestUniaire: "",
    lettreNiveauCve: "",
    pourcentageCouvertureTestUniaire: "",
    nbCveCritical: "",
    nbCveHigh: "",
    nbCveLow: "",
    nbCveMedium: ""
};

describe("generateNarrative", () => {
    it("handles missing values (NR everywhere)", () => {
        const narrative = generateNarrative(baseApp);

        expect(narrative.debt).toContain("n'est pas renseignée");
        expect(narrative.tests).toContain("n'est pas renseignée");
        expect(narrative.security).toContain("Aucune information");
        expect(narrative.green).toContain("Aucune information");
        expect(narrative.cloud).toContain("Aucune donnée");
        expect(narrative.quality).toContain("Aucune donnée");
        expect(narrative.cloudMaturity).toContain("n'est pas renseignée");
        expect(narrative.summary).toContain("My App");
    });

    it("generates narrative for high technical debt", () => {
        const narrative = generateNarrative({
            ...baseApp,
            detteTechnique: "30000"
        });

        expect(narrative.debt).toContain("dette technique reste élevé");
    });

    it("generates narrative for low technical debt", () => {
        const narrative = generateNarrative({
            ...baseApp,
            detteTechnique: "1000"
        });

        expect(narrative.debt).toContain("dette technique est maîtrisée");
    });

    it("generates narrative for excellent test coverage", () => {
        const narrative = generateNarrative({
            ...baseApp,
            pourcentageCouvertureTestUniaire: "90"
        });

        expect(narrative.tests).toContain("excellente couverture");
    });

    it("generates narrative for poor test coverage", () => {
        const narrative = generateNarrative({
            ...baseApp,
            pourcentageCouvertureTestUniaire: "20"
        });

        expect(narrative.tests).toContain("insuffisante");
    });

    it("generates narrative for critical security issues", () => {
        const narrative = generateNarrative({
            ...baseApp,
            lettreNiveauCve: "E"
        });

        expect(narrative.security).toContain("vulnérabilités critiques");
    });

    it("generates narrative for good security level", () => {
        const narrative = generateNarrative({
            ...baseApp,
            lettreNiveauCve: "A"
        });

        expect(narrative.security).toContain("Aucune vulnérabilité critique");
    });

    it("generates narrative for green IT excellence", () => {
        const narrative = generateNarrative({
            ...baseApp,
            lettreGreen: "A"
        });

        expect(narrative.green).toContain("exemplaire");
    });

    it("generates narrative for poor green IT score", () => {
        const narrative = generateNarrative({
            ...baseApp,
            lettreGreen: "E"
        });

        expect(narrative.green).toContain("opportunités significatives");
    });

    it("generates narrative for low deployment frequency", () => {
        const narrative = generateNarrative({
            ...baseApp,
            distanceNote: "D"
        });

        expect(narrative.cloud).toContain("espacement entre les mises");
    });

    it("generates narrative for high quality software", () => {
        const narrative = generateNarrative({
            ...baseApp,
            lettreQualiteGenerale: "A"
        });

        expect(narrative.quality).toContain("excellent niveau");
    });

    it("generates narrative for low cloud maturity", () => {
        const narrative = generateNarrative({
            ...baseApp,
            maturite: "E"
        });

        expect(narrative.cloudMaturity).toContain("plan de modernisation");
    });

    describe("generateHomologationNarrative", () => {
        it("retourne non homologuée si statut est 'non'", () => {
            const narrative = generateNarrative({
                ...baseApp,
                statutHomologation: "non",
                homologationSI: undefined
            });
            expect(narrative.homologation).toBe("L'application n'a pas été homologuée.");
        });

        it("retourne non homologuée si statut est undefined", () => {
            const narrative = generateNarrative({
                ...baseApp,
                statutHomologation: undefined,
                homologationSI: undefined
            });
            expect(narrative.homologation).toBe("L'application n'a pas été homologuée.");
        });

        it("retourne non homologuée avec SI partiellement homologué et sensibilité 3", () => {
            const narrative = generateNarrative({
                ...baseApp,
                statutHomologation: "non",
                homologationSI: "partielle",
                sensitivity: "3"
            });
            expect(narrative.homologation).toContain(
                "n'a pas été homologuée mais son système d'information a été homologué partiellement"
            );
            expect(narrative.homologation).toContain("SI important");
        });

        it("retourne non homologuée avec SI partiellement homologué et sensibilité non déterminée", () => {
            const narrative = generateNarrative({
                ...baseApp,
                statutHomologation: "non",
                homologationSI: "partielle",
                sensitivity: "(nd)"
            });
            expect(narrative.homologation).toContain(
                "n'a pas été homologuée mais son système d'information a été homologué partiellement"
            );
            expect(narrative.homologation).toContain("sensibilité du SI n'est pas déterminée");
        });

        it("retourne homologuée avec SI complètement homologué et sensibilité 3", () => {
            const narrative = generateNarrative({
                ...baseApp,
                statutHomologation: "homologuée",
                homologationBeginDate: "20/06/2050",
                homologationEndDate: "20/06/2055",
                homologationSI: "complète",
                sensitivity: "3"
            });
            expect(narrative.homologation).toContain("a été homologuée le 20/06/2050");
            expect(narrative.homologation).toContain("valable jusqu'au 20/06/2055");
            expect(narrative.homologation).toContain("homologué complètement");
            expect(narrative.homologation).toContain("SI important");
        });

        it("retourne sensibilité non déterminée si sensitivity est '(nd)' en cas complète", () => {
            const narrative = generateNarrative({
                ...baseApp,
                statutHomologation: "homologuée",
                homologationBeginDate: "20/06/2050",
                homologationEndDate: "20/06/2055",
                homologationSI: "complète",
                sensitivity: "(nd)"
            });
            expect(narrative.homologation).toContain("homologué complètement");
            expect(narrative.homologation).toContain("sensibilité du SI n'est pas déterminée");
        });

        it.each([
            ["1", "SI peu ou pas sensible"],
            ["2", "SI Moyennement sensible"],
            ["3", "SI important"],
            ["4", "SI sensible"]
        ])("sensibilité %s retourne '%s' (cas homologuée + complète)", (sensitivity, expected) => {
            const narrative = generateNarrative({
                ...baseApp,
                statutHomologation: "homologuée",
                homologationBeginDate: "20/06/2050",
                homologationEndDate: "20/06/2055",
                homologationSI: "complète",
                sensitivity
            });
            expect(narrative.homologation).toContain(expected);
        });

        it.each([
            ["1", "SI peu ou pas sensible"],
            ["2", "SI Moyennement sensible"],
            ["3", "SI important"],
            ["4", "SI sensible"]
        ])("sensibilité %s retourne '%s' (cas homologuée + partielle)", (sensitivity, expected) => {
            const narrative = generateNarrative({
                ...baseApp,
                statutHomologation: "homologuée",
                homologationBeginDate: "20/06/2050",
                homologationEndDate: "20/06/2055",
                homologationSI: "partielle",
                sensitivity
            });
            expect(narrative.homologation).toContain(expected);
        });
    });
});
