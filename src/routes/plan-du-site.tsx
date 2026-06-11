import { createFileRoute, Link } from "@tanstack/react-router";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BarChartIcon from "@mui/icons-material/BarChart";
import EditIcon from "@mui/icons-material/Edit";
import HomeIcon from "@mui/icons-material/Home";

export const Route = createFileRoute("/plan-du-site")({
    component: PlanDuSite
});

const siteMap = [
    {
        section: "Accueil",
        path: "/",
        icon: <HomeIcon fontSize="small" aria-hidden={true} />
    },
    {
        section: "Dashboard",
        icon: <DashboardIcon fontSize="small" aria-hidden={true} />,
        pages: [
            { label: "Vue d'ensemble", path: "/dashboard/overview" },
            { label: "Synthèse", path: "/dashboard/synthese" },
            { label: "Accessibilité", path: "/dashboard/accessibilite" },
            { label: "Devops", path: "/dashboard/devops" },
            { label: "Green IT", path: "/dashboard/greenit" },
            { label: "Maturité", path: "/dashboard/maturite" },
            { label: "Météo", path: "/dashboard/meteo" },
            { label: "Qualité", path: "/dashboard/qualite" },
            { label: "Sécurité", path: "/dashboard/securite" }
        ]
    },
    {
        section: "Indicateurs",
        icon: <BarChartIcon fontSize="small" aria-hidden={true} />,
        pages: [
            { label: "Indicateurs principaux", path: "/indicateur/mainIndicators" },
            { label: "Accessibilité", path: "/indicateur/accessibiliteTable" },
            { label: "Devops", path: "/indicateur/devopsTable" },
            { label: "Green IT", path: "/indicateur/greenITTable" },
            { label: "Météo", path: "/indicateur/meteoTable" },
            { label: "Qualité", path: "/indicateur/qualiteTable" },
            { label: "Sécurité", path: "/indicateur/securiteTable" },
            { label: "Stratégie Cloud", path: "/indicateur/strategieCloudTable" }
        ]
    },
    {
        section: "Saisie",
        icon: <EditIcon fontSize="small" aria-hidden={true} />,
        pages: [
            { label: "Accessibilité", path: "/saisie/accessibilité" },
            { label: "Météo", path: "/saisie/meteo" },
            { label: "Stratégie Cloud", path: "/saisie/strategiecloud" }
        ]
    }
];

function PlanDuSite() {
    return (
        <main
            id="contenu-principal"
            style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto", paddingTop: "5em" }}
        >
            <h1>Plan du site</h1>
            <nav aria-label="Plan du site">
                <ul
                    style={{
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: "1.5rem"
                    }}
                >
                    {siteMap.map(item => (
                        <li key={item.section}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    marginBottom: "0.5rem"
                                }}
                            >
                                {item.icon}
                                {item.path ? (
                                    <Link to={item.path} style={{ fontWeight: 600, fontSize: "1rem" }}>
                                        {item.section}
                                    </Link>
                                ) : (
                                    <strong style={{ fontSize: "1rem" }}>{item.section}</strong>
                                )}
                            </div>

                            {item.pages && (
                                <ul
                                    style={{
                                        listStyle: "none",
                                        padding: "0 0 0 1.5rem",
                                        margin: 0,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "4px",
                                        borderLeft: "2px solid rgba(156,39,176,0.2)"
                                    }}
                                >
                                    {item.pages.map(page => (
                                        <li key={page.path}>
                                            <Link
                                                to={page.path}
                                                style={{
                                                    fontSize: "0.9rem",
                                                    textDecoration: "none",
                                                    color: "inherit"
                                                }}
                                            >
                                                {page.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
        </main>
    );
}
