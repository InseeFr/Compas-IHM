/* eslint-disable react/prop-types */
import {
    Button,
    Box,
    useTheme,
    Typography,
    Divider,
    alpha,
    Alert,
    CircularProgress
} from "@mui/material";
import { generateNarrative, type Props } from "./application-preview-config";
import RadarQualiteChart from "../RadarChart/RadarQualiteChar";
import { useState } from "react";

export function ButtonGenerateReport({
    handle,
    appName
}: Readonly<{ handle: (appName: string) => Promise<void>; appName: string }>) {
    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        setAlert(null);

        try {
            await handle(appName);
            setAlert({
                type: "success",
                message: `Rapport ${appName} généré avec succès`
            });
        } catch (error) {
            console.error(error);
            setAlert({
                type: "error",
                message: `Erreur lors de la génération de Rapport ${appName}`
            });
        } finally {
            setLoading(false);
        }

        setTimeout(() => setAlert(null), 5000);
    };

    return (
        <Box mt={2} textAlign={"center"}>
            {alert && (
                <Alert severity={alert.type} sx={{ mb: 2 }}>
                    {alert.message}
                </Alert>
            )}
            <Button
                variant="contained"
                color="secondary"
                onClick={handleClick}
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} color="info" />}
            >
                {loading ? "Génération en cours..." : "Générer le rapport"}
            </Button>
        </Box>
    );
}

const ApplicationReportPreview: React.FC<Props> = ({ appDetails, modules, population }) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                p: 4,
                maxWidth: "800px",
                margin: "0 auto",
                fontFamily: "Arial, sans-serif",
                bgcolor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                borderRadius: 4,
                boxShadow: 2
            }}
            id="app-report-pdf"
        >
            <Box display="flex" justifyContent="space-between">
                <Box sx={{ my: 2, borderColor: theme.palette.divider }}>
                    <Typography
                        variant="h2"
                        fontSize={40}
                        gutterBottom
                        color="secondary"
                        aria-label={`Rapport d'application : ${appDetails.applicationName}`}
                        tabIndex={0}
                    >
                        Rapport d&apos;application : {appDetails.applicationName}
                    </Typography>

                    <Typography tabIndex={0}>
                        <strong>SNDI :</strong> {appDetails.sndi ?? "NR"}
                    </Typography>
                    <Typography tabIndex={0}>
                        <strong>Domaine fonctionnel :</strong> {appDetails.domaineFonc ?? "NR"}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        width: 320,
                        height: 340,
                        ml: 2,
                        mt: 0,
                        flexShrink: 0
                    }}
                >
                    <RadarQualiteChart app={appDetails} population={population} />
                </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h3" tabIndex={0} fontSize={32} gutterBottom>
                Indicateurs & Interprétations
            </Typography>

            {(() => {
                const narrative = generateNarrative(appDetails);

                const indicateurs = [
                    {
                        titre: "Lettre qualité",
                        valeur: appDetails.lettreQualiteGenerale ?? "NR",
                        texte: narrative.quality
                    },
                    {
                        titre: "Dette technique",
                        valeur:
                            appDetails.detteTechnique === undefined
                                ? "NR"
                                : `${(Number.parseFloat(appDetails.detteTechnique) / 420).toFixed(1)} jours`,
                        texte: narrative.debt
                    },
                    {
                        titre: "Couverture test",
                        valeur: appDetails.pourcentageCouvertureTestUniaire ?? "NR",
                        texte: narrative.tests
                    },
                    {
                        titre: "Sécurité",
                        valeur: appDetails.lettreNiveauCve ?? "NR",
                        texte: `${narrative.security}`,
                        texte2: `Homologation : ${narrative.homologation}`
                    },
                    {
                        titre: "Green IT",
                        valeur: appDetails.lettreGreen ?? "NR",
                        texte: narrative.green
                    },
                    {
                        titre: "Fréquence MEP",
                        valeur: appDetails.distanceNote ?? "NR",
                        texte: narrative.cloud
                    },
                    {
                        titre: "Maturité cloud",
                        valeur: appDetails.maturite ?? "NR",
                        texte: narrative.cloudMaturity
                    }
                ];

                return (
                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mt={2}>
                        {indicateurs.map(item => (
                            <Box
                                tabIndex={0}
                                key={item.titre}
                                sx={{
                                    p: 2,
                                    border: 1,
                                    borderColor: "divider",
                                    borderRadius: 2,
                                    bgcolor: "background.paper",
                                    color: "text.primary",

                                    boxShadow:
                                        theme.palette.mode === "dark"
                                            ? `0 1px 3px ${alpha(theme.palette.common.black, 0.6)}`
                                            : `0 1px 3px ${alpha(theme.palette.common.black, 0.1)}`
                                }}
                            >
                                <Typography fontWeight="bold">
                                    {item.titre} : {item.valeur}
                                </Typography>
                                <Typography variant="body2" mt={0.5}>
                                    {item.texte}
                                    <br />
                                    {item.texte2}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                );
            })()}

            <Box mt={4}>
                <Typography variant="body2" fontStyle="italic" tabIndex={0}>
                    Ce rapport met en évidence les principaux leviers de progression pour{" "}
                    {appDetails.applicationName}.
                </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h3" fontSize={32} gutterBottom tabIndex={0}>
                Modules associés
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
                {modules.map(mod => (
                    <li key={mod.name}>
                        <Typography tabIndex={0}>
                            <strong>{mod.name}</strong> – Qualité: {mod.qualite ?? "NR"}, Dette:{" "}
                            {typeof mod.dette === "number" && mod.dette >= 0
                                ? (mod.dette / 420).toFixed(1) + " j"
                                : "NR"}
                            , Couverture: {mod.couverture ?? "NR"}
                        </Typography>
                    </li>
                ))}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="body2" fontStyle="italic" color="textSecondary" tabIndex={0}>
                Rapport généré automatiquement depuis COMPAS consolidées.
            </Typography>
        </Box>
    );
};

export default ApplicationReportPreview;
