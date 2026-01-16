import type { NavBarModel } from "../models/navbar-models";

export const WELCOME_MESSAGE: string = "Bienvenue sur COMPAS !";

export const CONTENT: string =
    "Vous pouvez consulter la documentation détaillant les différents indicateurs qualité suivis dans Compas en cliquant sur le lien suivant";
export const LINK: string =
    "https://gitlab.insee.fr/dsi/compas/documentation/compas-wiki/-/wikis/syntheses/indicateurs";

export type ViewMode = "global" | "prod" | "horsprod";

export const NAV_TEXTS: NavBarModel = {
    items: [
        {
            title: "Tableaux de bord",
            subItem: [
                { label: "Vue d'ensemble", to: "/dashboard/overview" },
                { label: "Synthèse par application", to: "/dashboard/synthese" },
                { label: "Maturité Cloud par application", to: "/dashboard/maturite" }
            ]
        },
        {
            title: "Indicateurs",
            subItem: [
                { label: "Indicateurs principaux", to: "/indicateur/mainIndicators" },
                { label: "Qualité", to: "/indicateur/qualiteTable" },
                { label: "Devops", to: "/indicateur/devopsTable" },
                { label: "Green IT", to: "/indicateur/greenITTable" },
                { label: "Sécurité", to: "/indicateur/securiteTable" },
                { label: "Accessibilité", to: "/indicateur/accessibiliteTable" },
                { label: "Dernières Méteo", to: "/indicateur/meteoTable" }
            ]
        },
        {
            title: "Saisie d'un projet",
            subItem: [
                { label: "Saisie météo", to: "/saisie/meteo" },
                { label: "Saisie accessibilité", to: "/saisie/accessibilité" }
            ]
        }
    ]
};
