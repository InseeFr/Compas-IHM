import type { NavBarModel } from "../models/navbar-models";

export const WELCOME_MESSAGE: string = "Bienvenue sur COMPAS !";

export type ViewMode = "global" | "prod" | "horsprod";

export const NAV_TEXTS: NavBarModel = {
    items: [
        {
            title: "Tableaux de bord",
            subItem: ["Vue d'ensemble", "Synthèse par application", "Maturité Cloud par application"]
        },
        {
            title: "Indicateurs",
            subItem: [
                "Indicateurs principaux",
                "Qualité",
                "Devops",
                "Green IT",
                "Sécurité",
                "Accessibilité",
                "Dernières Méteo"
            ]
        },
        {
            title: "Saisie de la météo"
        },
        {
            title: "Saisie de l'accessibilité"
        }
    ]
};

