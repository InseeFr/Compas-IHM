import { describe, expect, it } from "vitest";
import { getStrategieCommune } from "pages/indicateurs/strategiecloud/strategieCloudUtils.tsx";

describe("getStrategieCommune", () => {

    it("retourne la stratégie commune lorsque tous les modules ont les mêmes valeurs", () => {

        const strategie = {
            idMod: 1,
            strategieCloud: "En cours",
            envCibleProd: "Cloud Externe",
            commentaire: "Commentaire"
        };

        expect(
            getStrategieCommune([
                strategie,
                { ...strategie, idMod: 2 },
                { ...strategie, idMod: 3 }
            ])
        ).toEqual(strategie);

    });

    it("retourne null lorsque la stratégie cloud est différente", () => {

        expect(
            getStrategieCommune([
                {
                    idMod: 1,
                    strategieCloud: "En cours",
                    envCibleProd: "Cloud Externe",
                    commentaire: "Commentaire"
                },
                {
                    idMod: 2,
                    strategieCloud: "Validée",
                    envCibleProd: "Cloud Externe",
                    commentaire: "Commentaire"
                }
            ])
        ).toBeNull();

    });

    it("retourne null lorsque l'environnement cible est différent", () => {

        expect(
            getStrategieCommune([
                {
                    idMod: 1,
                    strategieCloud: "En cours",
                    envCibleProd: "Cloud Externe",
                    commentaire: "Commentaire"
                },
                {
                    idMod: 2,
                    strategieCloud: "En cours",
                    envCibleProd: "Kube",
                    commentaire: "Commentaire"
                }
            ])
        ).toBeNull();

    });

    it("retourne null lorsque le commentaire est différent", () => {

        expect(
            getStrategieCommune([
                {
                    idMod: 1,
                    strategieCloud: "En cours",
                    envCibleProd: "Cloud Externe",
                    commentaire: "Commentaire A"
                },
                {
                    idMod: 2,
                    strategieCloud: "En cours",
                    envCibleProd: "Cloud Externe",
                    commentaire: "Commentaire B"
                }
            ])
        ).toBeNull();

    });

    it("retourne null lorsqu'un module n'a jamais eu de stratégie", () => {

        expect(
            getStrategieCommune([
                {
                    idMod: 1,
                    strategieCloud: "En cours",
                    envCibleProd: "Cloud Externe",
                    commentaire: "Commentaire"
                },
                {
                    idMod: 2,
                    strategieCloud: undefined,
                    envCibleProd: undefined,
                    commentaire: undefined
                }
            ])
        ).toBeNull();

    });

    it("retourne null lorsque la liste est vide", () => {

        expect(getStrategieCommune([])).toBeNull();

    });

    it("retourne la stratégie lorsqu'un seul module est présent", () => {

        const strategie = {
            idMod: 1,
            strategieCloud: "A instruire",
            envCibleProd: "Kube",
            commentaire: undefined
        };

        expect(
            getStrategieCommune([strategie])
        ).toEqual(strategie);

    });

});