/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Typography, useTheme } from "@mui/material";
import ReactECharts from "echarts-for-react";
import type { GlobalIndicator } from "models/indicateurs";
import { METEO_COLORS, METEO_LABELS, ORDERED_METEO } from "constantes/couleurs";
import { frMonthLabel } from "pages/indicateurs/meteo/meteo-config";
import { useQuery } from "@tanstack/react-query";
import { getHistory } from "todos-api/client.gen";

function normalizeMeteoValue(meteo: number | string | undefined): number | "NR" | undefined {
    if (meteo === undefined) return undefined;
    if (meteo === "NR") return "NR";
    if (typeof meteo === "number") return meteo;
    return Number.parseInt(meteo);
}

interface MeteoDistributionChartProps {
    data: GlobalIndicator[];
}

export function MeteoDistributionChart({ data }: Readonly<MeteoDistributionChartProps>) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const countByMeteo = ORDERED_METEO.map(meteoValue => {
        if (meteoValue === "NR") {
            return data.filter(
                app =>
                    normalizeMeteoValue(app.meteo) === "NR" ||
                    normalizeMeteoValue(app.meteo) === undefined
            ).length;
        }
        const meteoNum = Number.parseInt(meteoValue);
        return data.filter(app => {
            const normalizedMeteo = normalizeMeteoValue(app.meteo);
            return typeof normalizedMeteo === "number" && normalizedMeteo === meteoNum;
        }).length;
    });

    const totalApps = data.length;
    const appsWithMeteo = data.filter(
        app => normalizeMeteoValue(app.meteo) !== undefined && normalizeMeteoValue(app.meteo) !== "NR"
    );
    const appsWithData = appsWithMeteo.length;

    const meteoValues = appsWithMeteo.map(app => {
        const normalized = normalizeMeteoValue(app.meteo);
        return normalized === "NR" ? 0 : (normalized as number);
    });
    const avgMeteo =
        meteoValues.length > 0 ? meteoValues.reduce((sum, val) => sum + val, 0) / meteoValues.length : 0;

    if (appsWithData === 0) {
        return (
            <Box p={4} textAlign="center">
                <Typography variant="body1" color="text.secondary">
                    Aucune donnée météo disponible
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography
                variant="subtitle1"
                component="h3"
                gutterBottom
                textAlign="center"
                color="text.primary"
            >
                Météo actuelle
            </Typography>
            <Typography variant="caption" textAlign="center" display="block" gutterBottom>
                Météo moyenne: {avgMeteo.toFixed(1)}/4
            </Typography>
            <ReactECharts
                option={{
                    backgroundColor: "transparent",
                    tooltip: {
                        trigger: "axis",
                        confine: true,
                        axisPointer: { type: "shadow" },
                        backgroundColor: isDark ? "#1d1d1d" : "#fff",
                        borderColor: isDark ? "#444" : "#ddd",
                        textStyle: { color: isDark ? "#fff" : "#000" },
                        formatter: (params: any) => {
                            const meteoIndex = params[0].dataIndex;
                            const meteoValue = ORDERED_METEO[meteoIndex];
                            const count = countByMeteo[meteoIndex];
                            const percentage =
                                totalApps > 0 ? ((count / totalApps) * 100).toFixed(1) : "0";
                            const label =
                                meteoValue === "NR"
                                    ? "Non renseigné"
                                    : METEO_LABELS[meteoValue as string];
                            return `
                                <strong>${label}</strong><br/>
                                Applications: ${count}<br/>
                                Pourcentage: ${percentage}%
                            `;
                        }
                    },
                    grid: { left: "3%", right: "4%", bottom: "20%", top: "20%", containLabel: true },
                    xAxis: {
                        type: "category",
                        data: ORDERED_METEO.map(m =>
                            m === "NR" ? "Non renseigné" : METEO_LABELS[m as string]
                        ),
                        axisLabel: { color: isDark ? "#ccc" : "#666", fontSize: 11, rotate: 45 },
                        axisLine: { lineStyle: { color: isDark ? "#555" : "#ddd" } }
                    },
                    yAxis: {
                        type: "value",
                        name: "Nombre d'applications",
                        axisLabel: { color: isDark ? "#ccc" : "#666" },
                        splitLine: { lineStyle: { color: isDark ? "#444" : "#eee" } }
                    },
                    series: [
                        {
                            name: "Applications",
                            type: "bar",
                            data: countByMeteo.map((count, index) => ({
                                value: count,
                                itemStyle: {
                                    color: METEO_COLORS[
                                        ORDERED_METEO[index] as keyof typeof METEO_COLORS
                                    ]
                                }
                            })),
                            emphasis: { focus: "series" },
                            label: {
                                show: true,
                                position: "top",
                                formatter: (params: any) => {
                                    const percentage =
                                        totalApps > 0
                                            ? ((params.value / totalApps) * 100).toFixed(1)
                                            : "0";
                                    return `${params.value} (${percentage}%)`;
                                },
                                color: isDark ? "#fff" : "#333",
                                fontWeight: "bold"
                            }
                        }
                    ],
                    graphic: {
                        type: "text",
                        left: "center",
                        bottom: "5%",
                        style: {
                            text: `Total: ${totalApps} applications | Avec données: ${appsWithData} (${totalApps > 0 ? ((appsWithData / totalApps) * 100).toFixed(1) : "0"}%)`,
                            fontSize: 11,
                            fill: isDark ? "#ccc" : "#666",
                            fontWeight: "bold"
                        }
                    }
                }}
                style={{ height: "400px", width: "100%" }}
                opts={{ renderer: "svg" }}
            />
        </Box>
    );
}

export function MeteoEvolutionChart() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const {
        data: historyData,
        isLoading,
        isError
    } = useQuery({
        queryKey: ["meteoHistory"],
        queryFn: () => getHistory()
    });

    if (isLoading) {
        return (
            <Box p={4} textAlign="center">
                <Typography variant="body1" color="text.secondary">
                    Chargement des données…
                </Typography>
            </Box>
        );
    }

    if (isError || !historyData) {
        return (
            <Box p={4} textAlign="center">
                <Typography variant="body1" color="text.secondary">
                    Erreur lors du chargement des données météo
                </Typography>
            </Box>
        );
    }

    // Regrouper les entrées par application et trier par date croissante
    const appEntries = new Map<number, { date: string; valeurMeteo: number; appName: string }[]>();
    historyData.forEach(m => {
        if (m.idApplication === undefined || m.valeurMeteo === undefined || !m.date) return;
        if (!appEntries.has(m.idApplication)) appEntries.set(m.idApplication, []);
        appEntries.get(m.idApplication)!.push({
            date: m.date,
            valeurMeteo: m.valeurMeteo,
            appName: m.appName ?? `App #${m.idApplication}`
        });
    });

    const improved: string[] = [];
    const degraded: string[] = [];
    const unchanged: string[] = [];

    // On collecte les dates pour construire un titre représentatif
    const prevDates: string[] = [];
    const lastDates: string[] = [];

    appEntries.forEach(entries => {
        if (entries.length < 2) return;
        entries.sort((a, b) => a.date.localeCompare(b.date));

        const last = entries[entries.length - 1];
        const prev = entries[entries.length - 2];

        prevDates.push(prev.date);
        lastDates.push(last.date);

        if (last.valeurMeteo > prev.valeurMeteo) {
            improved.push(last.appName);
        } else if (last.valeurMeteo < prev.valeurMeteo) {
            degraded.push(last.appName);
        } else {
            unchanged.push(last.appName);
        }
    });

    const categories = [
        { label: "Éclaircie", apps: improved, color: "#4caf50" },
        { label: "Temps stable", apps: unchanged, color: "#9e9e9e" },
        { label: "Dégradation", apps: degraded, color: "#f44336" }
    ];

    const totalTracked = improved.length + unchanged.length + degraded.length;

    if (totalTracked === 0) {
        return (
            <Box p={4} textAlign="center">
                <Typography variant="body1" color="text.secondary">
                    Aucune application avec au moins deux mesures disponibles
                </Typography>
            </Box>
        );
    }

    // Titre : mois médian des avant-dernières mesures → mois médian des dernières mesures
    const medianDate = (dates: string[]) =>
        dates.toSorted((a, b) => a.localeCompare(b))[Math.floor(dates.length / 2)];
    const prevLabel = frMonthLabel(medianDate([...prevDates]).slice(0, 7));
    const lastLabel = frMonthLabel(medianDate([...lastDates]).slice(0, 7));

    return (
        <Box>
            <Typography
                variant="subtitle1"
                component="h3"
                gutterBottom
                textAlign="center"
                color="text.primary"
            >
                Évolution météo: {prevLabel} → {lastLabel}
            </Typography>
            <Typography variant="caption" textAlign="center" display="block" gutterBottom>
                {totalTracked} application{totalTracked > 1 ? "s" : ""} comparée
                {totalTracked > 1 ? "s" : ""} (avant-dernière vs dernière mesure)
            </Typography>
            <ReactECharts
                option={{
                    backgroundColor: "transparent",
                    tooltip: {
                        trigger: "axis",
                        confine: true,
                        axisPointer: { type: "shadow" },
                        backgroundColor: isDark ? "#1d1d1d" : "#fff",
                        borderColor: isDark ? "#444" : "#ddd",
                        textStyle: { color: isDark ? "#fff" : "#000" },
                        formatter: (params: any) => {
                            const idx = params[0].dataIndex;
                            const cat = categories[idx];
                            const percentage =
                                totalTracked > 0
                                    ? ((cat.apps.length / totalTracked) * 100).toFixed(1)
                                    : "0";
                            const appList =
                                cat.apps.length <= 10
                                    ? cat.apps.join(", ")
                                    : cat.apps.slice(0, 10).join(", ") + ` … (+${cat.apps.length - 10})`;
                            return `
                                <strong>${cat.label}</strong><br/>
                                Applications: ${cat.apps.length} (${percentage}%)<br/>
                                <span style="font-size:11px">${appList}</span>
                            `;
                        }
                    },
                    grid: { left: "3%", right: "4%", bottom: "10%", top: "20%", containLabel: true },
                    xAxis: {
                        type: "category",
                        data: categories.map(c => c.label),
                        axisLabel: { color: isDark ? "#ccc" : "#666", fontSize: 13, fontWeight: "bold" },
                        axisLine: { lineStyle: { color: isDark ? "#555" : "#ddd" } }
                    },
                    yAxis: {
                        type: "value",
                        name: "Nombre d'applications",
                        axisLabel: { color: isDark ? "#ccc" : "#666" },
                        splitLine: { lineStyle: { color: isDark ? "#444" : "#eee" } },
                        minInterval: 1
                    },
                    series: [
                        {
                            name: "Applications",
                            type: "bar",
                            barMaxWidth: 80,
                            data: categories.map(cat => ({
                                value: cat.apps.length,
                                itemStyle: { color: cat.color }
                            })),
                            emphasis: { focus: "series" },
                            label: {
                                show: true,
                                position: "top",
                                formatter: (params: any) => {
                                    const percentage =
                                        totalTracked > 0
                                            ? ((params.value / totalTracked) * 100).toFixed(1)
                                            : "0";
                                    return `${params.value}\n(${percentage}%)`;
                                },
                                color: isDark ? "#fff" : "#333",
                                fontWeight: "bold",
                                fontSize: 12
                            }
                        }
                    ]
                }}
                style={{ height: "380px", width: "100%" }}
                opts={{ renderer: "svg" }}
            />
        </Box>
    );
}
