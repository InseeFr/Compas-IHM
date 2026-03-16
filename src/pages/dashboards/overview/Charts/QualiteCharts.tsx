/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Typography, useTheme } from "@mui/material";
import ReactECharts from "echarts-for-react";
import type { GlobalIndicator } from "models/indicateurs";
import { QUALITE_COLORS, ORDERED_QUALITE } from "constantes/couleurs";

// Constantes pour les niveaux de couverture de test
const COUVERTURE_LEVELS = [
    { key: "X", label: "X (0%)", color: "#b71c1c" },
    { key: "range", min: 0, max: 20, label: "0-20%", color: "#f44336" },
    { key: "range", min: 20, max: 40, label: "20-40%", color: "#ff9800" },
    { key: "range", min: 40, max: 60, label: "40-60%", color: "#ffc107" },
    { key: "range", min: 60, max: 80, label: "60-80%", color: "#8bc34a" },
    { key: "range", min: 80, max: 101, label: "80-100%", color: "#4caf50" }
];

const QUALITY_ASPECTS = [
    { name: "Couverture", key: "lettreCouvertureTestUniaire" },
    { name: "Fiabilité", key: "lettreFiabilite" },
    { name: "Dette", key: "lettreDetteTechnique" },
    { name: "Qualité globale", key: "lettreQualiteGenerale" }
];

// Helpers partagés
const tooltipBase = (isDark: boolean) => ({
    backgroundColor: isDark ? "#1e1e1e" : "#ffffff",
    borderColor: isDark ? "#3a3a3a" : "#e0e0e0",
    borderWidth: 1,
    textStyle: { color: isDark ? "#e0e0e0" : "#333333", fontSize: 12 },
    extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 8px;"
});

const axisLabelStyle = (isDark: boolean) => ({
    color: isDark ? "#aaaaaa" : "#666666",
    fontSize: 11
});

const splitLineStyle = (isDark: boolean) => ({
    lineStyle: { color: isDark ? "#2e2e2e" : "#f0f0f0", type: "dashed" as const }
});

const axisLineStyle = (isDark: boolean) => ({
    lineStyle: { color: isDark ? "#3a3a3a" : "#e0e0e0" }
});

const axisNameStyle = (isDark: boolean) => ({
    color: isDark ? "#aaaaaa" : "#888888",
    fontSize: 11,
    fontWeight: "normal" as const
});

const noDataMessage = (label: string) => (
    <Box p={4} textAlign="center">
        <Typography variant="body1" color="text.secondary">
            {label}
        </Typography>
    </Box>
);

// ─────────────────────────────────────────────────────────────────────────────
// QualiteCoverageChart
// ─────────────────────────────────────────────────────────────────────────────

interface QualiteCoverageChartProps {
    data: GlobalIndicator[];
}

export function QualiteCoverageChart({ data }: Readonly<QualiteCoverageChartProps>) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const appsWithCoverage = data.filter(
        app =>
            app.pourcentageCouvertureTestUniaire !== "NR" &&
            app.pourcentageCouvertureTestUniaire !== undefined
    );

    const countByLevel = COUVERTURE_LEVELS.map(level => {
        if (level.key === "X") {
            return appsWithCoverage.filter(app => app.lettreCouvertureTestUniaire === "X").length;
        }
        return appsWithCoverage.filter(app => {
            if (app.lettreCouvertureTestUniaire === "X") return false;
            const coverage = Number.parseFloat(app.pourcentageCouvertureTestUniaire);
            if (Number.isNaN(coverage)) return false;
            return coverage >= (level.min ?? 0) && coverage < (level.max ?? 0);
        }).length;
    });

    const totalApps = data.length;
    const appsWithData = appsWithCoverage.length;

    if (appsWithData === 0) return noDataMessage("Aucune donnée de couverture de test disponible");

    return (
        <Box>
            <Typography
                variant="subtitle1"
                component="h3"
                gutterBottom
                textAlign="center"
                color="text.primary"
            >
                Répartition de la couverture de test
            </Typography>
            <ReactECharts
                option={{
                    backgroundColor: "transparent",
                    tooltip: {
                        trigger: "axis",
                        axisPointer: {
                            type: "shadow",
                            shadowStyle: {
                                color: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"
                            }
                        },
                        ...tooltipBase(isDark),
                        formatter: (params: any) => {
                            const levelIndex = params[0].dataIndex;
                            const level = COUVERTURE_LEVELS[levelIndex];
                            const count = countByLevel[levelIndex];
                            const pct = totalApps > 0 ? ((count / totalApps) * 100).toFixed(1) : "0";
                            const label =
                                level.key === "X" ? "Note X — aucun test déclaré" : level.label;
                            return `<strong>${label}</strong><br/>Applications : ${count}<br/>Part du total : ${pct}%`;
                        }
                    },
                    grid: { left: "3%", right: "4%", bottom: "18%", top: "12%", containLabel: true },
                    xAxis: {
                        type: "category",
                        data: COUVERTURE_LEVELS.map(l => l.label),
                        axisLabel: { ...axisLabelStyle(isDark), rotate: 0 },
                        axisLine: axisLineStyle(isDark),
                        axisTick: { show: false }
                    },
                    yAxis: {
                        type: "value",
                        name: "Applications",
                        nameTextStyle: axisNameStyle(isDark),
                        axisLabel: axisLabelStyle(isDark),
                        axisLine: { show: false },
                        axisTick: { show: false },
                        splitLine: splitLineStyle(isDark)
                    },
                    series: [
                        {
                            name: "Applications",
                            type: "bar",
                            barMaxWidth: 48,
                            itemStyle: { borderRadius: [6, 6, 0, 0] },
                            data: countByLevel.map((count, index) => ({
                                value: count,
                                itemStyle: {
                                    color: COUVERTURE_LEVELS[index].color,
                                    borderRadius: [6, 6, 0, 0]
                                }
                            })),
                            emphasis: { focus: "series" },
                            label: {
                                show: true,
                                position: "top",
                                formatter: (params: any) => {
                                    if (params.value === 0) return "";
                                    const pct =
                                        totalApps > 0
                                            ? ((params.value / totalApps) * 100).toFixed(0)
                                            : "0";
                                    return `${params.value}\n(${pct}%)`;
                                },
                                color: isDark ? "#cccccc" : "#555555",
                                fontSize: 11,
                                lineHeight: 16
                            }
                        }
                    ],
                    graphic: {
                        type: "text",
                        left: "center",
                        bottom: "2%",
                        style: {
                            text: `Total : ${totalApps} applications · Avec données : ${appsWithData} (${totalApps > 0 ? ((appsWithData / totalApps) * 100).toFixed(1) : "0"}%)`,
                            fontSize: 11,
                            fill: isDark ? "#777777" : "#aaaaaa"
                        }
                    }
                }}
                style={{ height: "350px", width: "100%" }}
                opts={{ renderer: "svg" }}
            />
        </Box>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// QualiteDetteChart
// ─────────────────────────────────────────────────────────────────────────────

interface QualiteDetteChartProps {
    data: GlobalIndicator[];
}

export function QualiteDetteChart({ data }: Readonly<QualiteDetteChartProps>) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const appsWithDette = data.filter(
        app =>
            app.detteTechnique !== undefined &&
            app.detteTechnique !== "NR" &&
            app.pourcentageCouvertureTestUniaire !== "NR" &&
            app.applicationName !== undefined
    );

    const scatterData = appsWithDette.map(app => ({
        name: app.applicationName ?? "Inconnu",
        dette: (Number.parseFloat(app.detteTechnique ?? "0") ?? 0) / 420,
        couverture: Number.parseFloat(app.pourcentageCouvertureTestUniaire ?? "0") ?? 0,
        lettre: app.lettreDetteTechnique ?? "NR",
        nbLigneCode: Number.parseFloat(app.nbLigneCode ?? "0") ?? 0
    }));

    if (scatterData.length === 0) return noDataMessage("Aucune donnée de dette technique disponible");

    return (
        <Box>
            <Typography
                variant="subtitle1"
                component="h3"
                gutterBottom
                textAlign="center"
                color="text.primary"
            >
                Dette technique vs Couverture de test
            </Typography>
            <ReactECharts
                option={{
                    backgroundColor: "transparent",
                    tooltip: {
                        trigger: "item",
                        ...tooltipBase(isDark),
                        formatter: (params: any) => {
                            const item = scatterData[params.dataIndex];
                            if (!item) return "Données non disponibles";
                            return `
                                <strong>${item.name}</strong><br/>
                                Dette technique : ${item.dette.toFixed(1)} j<br/>
                                Couverture : ${item.couverture.toFixed(1)}%<br/>
                                Lignes de code : ${item.nbLigneCode.toLocaleString("fr-FR")}<br/>
                                Note : <strong>${item.lettre}</strong>
                            `;
                        }
                    },
                    grid: { left: "10%", right: "8%", bottom: "12%", top: "12%", containLabel: true },
                    xAxis: {
                        type: "value",
                        name: "Couverture de test (%)",
                        nameLocation: "middle",
                        nameGap: 30,
                        nameTextStyle: axisNameStyle(isDark),
                        min: 0,
                        max: 100,
                        axisLabel: axisLabelStyle(isDark),
                        axisLine: axisLineStyle(isDark),
                        splitLine: splitLineStyle(isDark)
                    },
                    yAxis: {
                        type: "value",
                        name: "Dette technique (jours)",
                        nameLocation: "middle",
                        nameGap: 50,
                        nameTextStyle: axisNameStyle(isDark),
                        axisLabel: axisLabelStyle(isDark),
                        axisLine: { show: false },
                        axisTick: { show: false },
                        splitLine: splitLineStyle(isDark)
                    },
                    series: [
                        {
                            name: "Applications",
                            type: "scatter",
                            data: scatterData.map(item => [item.couverture, item.dette]),
                            symbolSize: (params: any) => {
                                const lignes = scatterData[params.dataIndex]?.nbLigneCode ?? 0;
                                if (lignes === 0) return 6;
                                return Math.max(6, Math.min(18, Math.log10(lignes + 1) * 4));
                            },
                            itemStyle: {
                                color: (params: any) => {
                                    const lettre = scatterData[params.dataIndex]?.lettre ?? "NR";
                                    return QUALITE_COLORS[lettre] ?? QUALITE_COLORS.NR;
                                },
                                opacity: 0.75,
                                borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                                borderWidth: 1
                            },
                            emphasis: {
                                itemStyle: {
                                    opacity: 1,
                                    borderColor: theme.palette.primary.light,
                                    borderWidth: 2,
                                    shadowBlur: 8,
                                    shadowColor: "rgba(0,0,0,0.2)"
                                }
                            }
                        }
                    ]
                }}
                style={{ height: "400px", width: "100%" }}
                opts={{ renderer: "canvas" }}
            />
        </Box>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// QualiteRadarChart  →  Stacked bar distribution
// ─────────────────────────────────────────────────────────────────────────────

interface QualiteRadarChartProps {
    data: GlobalIndicator[];
}

export function QualiteRadarChart({ data }: Readonly<QualiteRadarChartProps>) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const aspectDistribution = QUALITY_ASPECTS.map(aspect => {
        const counts = ORDERED_QUALITE.reduce(
            (acc, letter) => {
                acc[letter] = data.filter(
                    app => (app[aspect.key as keyof GlobalIndicator] ?? "NR") === letter
                ).length;
                return acc;
            },
            {} as Record<string, number>
        );
        return { name: aspect.name, counts };
    });

    const hasValidData = aspectDistribution.some(a => Object.values(a.counts).some(v => v > 0));
    if (!hasValidData) return noDataMessage("Aucune donnée de qualité disponible");

    const series = ORDERED_QUALITE.map(letter => ({
        name: letter === "NR" ? "Non renseigné" : `Note ${letter}`,
        type: "bar" as const,
        stack: "total",
        barMaxWidth: 52,
        data: aspectDistribution.map(a => a.counts[letter] ?? 0),
        itemStyle: {
            color: QUALITE_COLORS[letter as keyof typeof QUALITE_COLORS] ?? QUALITE_COLORS.NR
        },
        label: {
            show: true,
            formatter: (params: any) => (params.value > 0 ? String(params.value) : ""),
            color: "#ffffff",
            fontWeight: "bold" as const,
            fontSize: 11,
            textShadowBlur: 3,
            textShadowColor: "rgba(0,0,0,0.4)"
        }
    }));

    return (
        <Box>
            <Typography
                variant="subtitle1"
                component="h3"
                gutterBottom
                textAlign="center"
                color="text.primary"
            >
                Distribution des notes par aspect qualité
            </Typography>
            <ReactECharts
                option={{
                    backgroundColor: "transparent",
                    tooltip: {
                        trigger: "axis",
                        axisPointer: {
                            type: "shadow",
                            shadowStyle: {
                                color: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"
                            }
                        },
                        ...tooltipBase(isDark),
                        formatter: (params: any[]) => {
                            const aspect = params[0].name;
                            const total = params.reduce((s: number, p: any) => s + p.value, 0);
                            const lines = params
                                .filter(p => p.value > 0)
                                .map(
                                    p =>
                                        `${p.marker} ${p.seriesName}: <strong>${p.value}</strong> (${
                                            total > 0 ? ((p.value / total) * 100).toFixed(0) : 0
                                        }%)`
                                )
                                .join("<br/>");
                            return `<strong>${aspect}</strong><br/>${lines}<br/><span style="color:${isDark ? "#888" : "#aaa"}">Total : ${total}</span>`;
                        }
                    },
                    legend: {
                        bottom: 0,
                        left: "center",
                        itemWidth: 12,
                        itemHeight: 12,
                        itemGap: 16,
                        textStyle: {
                            color: isDark ? "#aaaaaa" : "#666666",
                            fontSize: 11
                        }
                    },
                    grid: { left: "3%", right: "4%", bottom: "20%", top: "8%", containLabel: true },
                    xAxis: {
                        type: "category",
                        data: aspectDistribution.map(a => a.name),
                        axisLabel: { ...axisLabelStyle(isDark), fontSize: 12 },
                        axisLine: axisLineStyle(isDark),
                        axisTick: { show: false }
                    },
                    yAxis: {
                        type: "value",
                        name: "Applications",
                        nameTextStyle: axisNameStyle(isDark),
                        axisLabel: axisLabelStyle(isDark),
                        axisLine: { show: false },
                        axisTick: { show: false },
                        splitLine: splitLineStyle(isDark)
                    },
                    series
                }}
                style={{ height: "350px", width: "100%" }}
                opts={{ renderer: "svg" }}
            />
        </Box>
    );
}
