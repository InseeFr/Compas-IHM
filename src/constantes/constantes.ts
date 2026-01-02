import type { NavBarModel } from "../models/navbar-models";

export const WELCOME_MESSAGE: string = "Bienvenue sur COMPAS !";

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
                { label: "Indicateurs principaux", to: "/indicateurs/principaux" },
                { label: "Qualité", to: "/indicateur/qualite" },
                { label: "Devops", to: "/indicateur/devopsTable" },
                { label: "Green IT", to: "/indicateur/green-it" },
                { label: "Sécurité", to: "/indicateur/securite" },
                { label: "Accessibilité", to: "/indicateur/accessibilite" },
                { label: "Dernières Méteo", to: "/indicateur/meteo" }
            ]
        },
        {
            title: "Saisie de la météo",
            to: "/saisie/meteo"
        },
        {
            title: "Saisie de l'accessibilité",
            to: "/saisie/accessibilite"
        }
    ]
};
