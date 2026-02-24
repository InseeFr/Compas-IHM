/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";
import * as echarts from "echarts";
import { pickSixAxisScores, avgArrays, scoreToLetter } from "./radar-config";

export interface AppForRadar {
    applicationName: string;
    lettreQualiteGenerale?: string;
    lettreNiveauCve?: string;
    distanceNote?: string;
    lettreFiabilite?: string;
    lettreGreen?: string;
    maturite?: string;
    domaineFonc?: string;
}

interface Props {
    app: AppForRadar;
    population: AppForRadar[];
    title?: string;
}

const LABELS = ["Maturité Cloud", "Sécurité", "Freq MEP", "Fiabilité", "Green IT", "Qualité"] as const;

const srOnly = {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0,0,0,0)",
    whiteSpace: "nowrap",
    border: 0
} as const;

type VisibilityKey = "app" | "global" | "domain";

const RadarQualiteChart: React.FC<Props> = ({ app, population, title }: Readonly<Props>) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const textColor = isDark ? "#fff" : "#000";
    const gridColor = isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)";

    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useRef<echarts.ECharts | null>(null);

    const [visible, setVisible] = useState<Record<VisibilityKey, boolean>>({
        app: true,
        global: true,
        domain: true
    });

    const toggle = (key: VisibilityKey) => setVisible(prev => ({ ...prev, [key]: !prev[key] }));

    const appScores = pickSixAxisScores(app);
    const allRows = population.map(pickSixAxisScores);
    const allAvg = avgArrays(allRows);
    const domain = app.domaineFonc ?? "NR";
    const domainRows = population.filter(p => (p.domaineFonc ?? "NR") === domain).map(pickSixAxisScores);
    const domainAvg = avgArrays(domainRows);

    const appData = appScores;
    const avgAll = allAvg;
    const avgDomain = domainAvg;

    const appColor = "#c01313ff";
    const allColor = "#19cf28ff";
    const domainColor = "#5112e4ff";

    const sectionTitleId = `radar-title-${app.applicationName.replaceAll(/\s+/g, "-")}`;
    const tableId = `radar-table-${app.applicationName.replaceAll(/\s+/g, "-")}`;
    const chartLabel = title
        ? `${title} — ${app.applicationName}`
        : `Graphique radar qualité pour ${app.applicationName}`;

    const legendItems: { key: VisibilityKey; label: string; color: string }[] = [
        { key: "app", label: app.applicationName, color: appColor },
        { key: "global", label: "Moyenne globale", color: allColor },
        { key: "domain", label: "Moyenne domaine", color: domainColor }
    ];

    useEffect(() => {
        if (!chartRef.current) return;

        chartInstanceRef.current ??= echarts.init(chartRef.current);

        const canvas = chartRef.current.querySelector("canvas");
        if (canvas) {
            canvas.setAttribute("role", "img");
            canvas.setAttribute(
                "aria-label",
                `${chartLabel}. Trois séries comparées : ${app.applicationName}, Moyenne globale, Moyenne domaine. Voir le tableau de données pour les valeurs détaillées.`
            );
            canvas.setAttribute("aria-describedby", tableId);
            canvas.setAttribute("tabindex", "0");
        }

        const opacity = (key: VisibilityKey) => (visible[key] ? 1 : 0);
        const areaOpacity = (key: VisibilityKey, base: number) => (visible[key] ? base : 0);

        chartInstanceRef.current.setOption({
            title: title
                ? {
                      text: title,
                      left: "center",
                      textStyle: { color: textColor }
                  }
                : undefined,
            legend: { show: false },
            tooltip: {
                trigger: "item",
                backgroundColor: isDark ? "rgba(50,50,50,0.95)" : "rgba(255,255,255,0.95)",
                borderColor: isDark ? "#666" : "#ccc",
                borderWidth: 1,
                textStyle: { color: textColor },
                formatter: (params: any) => {
                    if (!params.value || !Array.isArray(params.value)) return "";
                    const seriesName = params.seriesName;
                    let html = `<div style="font-weight:bold;margin-bottom:8px;">${seriesName}</div>`;
                    params.value.forEach((val: number, idx: number) => {
                        const letter = scoreToLetter(val);
                        html += `
                            <div style="display:flex;justify-content:space-between;gap:16px;margin:4px 0;">
                                <span>${LABELS[idx]}:</span>
                                <span style="font-weight:bold;">${val.toFixed(2)} (${letter})</span>
                            </div>`;
                    });
                    return html;
                }
            },
            radar: {
                center: ["50%", "50%"],
                radius: "60%",
                indicator: LABELS.map(name => ({ name, max: 5 })),
                splitNumber: 5,
                name: {
                    color: textColor,
                    fontSize: 12,
                    formatter: (value: string) => value,
                    padding: [4, 4]
                },
                splitLine: { lineStyle: { color: gridColor } },
                splitArea: { show: false },
                axisLine: { lineStyle: { color: gridColor } }
            },
            series: [
                {
                    name: app.applicationName,
                    type: "radar",
                    data: [
                        {
                            value: appData,
                            name: app.applicationName,
                            lineStyle: { color: appColor, width: 2, opacity: opacity("app") },
                            itemStyle: { color: appColor, opacity: opacity("app") },
                            areaStyle: { color: `rgba(192,19,19,${areaOpacity("app", 0.25)})` }
                        }
                    ]
                },
                {
                    name: "Moyenne globale",
                    type: "radar",
                    data: [
                        {
                            value: avgAll,
                            name: "Moyenne globale",
                            lineStyle: { color: allColor, width: 2, opacity: opacity("global") },
                            itemStyle: { color: allColor, opacity: opacity("global") },
                            areaStyle: { color: `rgba(25,207,40,${areaOpacity("global", 0.18)})` }
                        }
                    ]
                },
                {
                    name: "Moyenne domaine",
                    type: "radar",
                    data: [
                        {
                            value: avgDomain,
                            name: "Moyenne domaine",
                            lineStyle: { color: domainColor, width: 2, opacity: opacity("domain") },
                            itemStyle: { color: domainColor, opacity: opacity("domain") },
                            areaStyle: { color: `rgba(81,18,228,${areaOpacity("domain", 0.18)})` }
                        }
                    ]
                }
            ]
        });

        const patchCanvas = () => {
            const canvas = chartRef.current?.querySelector("canvas");
            if (canvas) {
                canvas.setAttribute("role", "img");
                canvas.setAttribute(
                    "aria-label",
                    `${chartLabel}. Trois séries comparées : ${app.applicationName}, Moyenne globale, Moyenne domaine. Voir le tableau de données pour les valeurs détaillées.`
                );
                canvas.setAttribute("aria-describedby", tableId);
                canvas.setAttribute("tabindex", "0");
            }
        };

        patchCanvas();
        const raf = requestAnimationFrame(patchCanvas);

        return () => {
            cancelAnimationFrame(raf);
            chartInstanceRef.current?.dispose();
            chartInstanceRef.current = null;
        };
    }, [
        app.applicationName,
        appData,
        avgAll,
        avgDomain,
        chartLabel,
        gridColor,
        isDark,
        tableId,
        textColor,
        title,
        visible
    ]);

    return (
        <Box
            component="section"
            aria-labelledby={sectionTitleId}
            sx={{
                width: "100%",
                height: "100%",
                position: "relative",
                display: "flex",
                flexDirection: "column"
            }}
        >
            <Typography id={sectionTitleId} component="h2" variant="subtitle1" sx={srOnly}>
                {title ?? `Radar qualité — ${app.applicationName}`}
            </Typography>

            {/* Chart */}
            <Box data-testid="radar-chart-container" ref={chartRef} sx={{ flex: 1, minHeight: 0 }} />

            {/* Légende HTML accessible */}
            <Box
                component="ul"
                aria-label="Légende du graphique radar"
                sx={{
                    display: "flex",
                    gap: 2,
                    flexWrap: "wrap",
                    justifyContent: "center",
                    p: 0,
                    m: 0,
                    mb: 1,
                    listStyle: "none"
                }}
            >
                {legendItems.map(({ key, label, color }) => (
                    <li key={key}>
                        <Box
                            component="button"
                            onClick={() => toggle(key)}
                            aria-pressed={visible[key]}
                            title={visible[key] ? `Masquer ${label}` : `Afficher ${label}`}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                opacity: visible[key] ? 1 : 0.4,
                                color: textColor,
                                fontSize: 12,
                                p: "4px 8px",
                                borderRadius: "4px",
                                transition: "opacity 0.2s",
                                "&:focus-visible": {
                                    outline: `2px solid ${color}`,
                                    outlineOffset: "2px"
                                }
                            }}
                        >
                            <Box
                                aria-hidden="true"
                                sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: "2px",
                                    backgroundColor: color,
                                    flexShrink: 0
                                }}
                            />
                            {label}
                        </Box>
                    </li>
                ))}
            </Box>

            {/* Hint visible */}
            <Typography
                component="p"
                variant="caption"
                aria-hidden="true"
                sx={{
                    textAlign: "right",
                    pr: 2,
                    pb: 0.5,
                    color: "text.secondary",
                    fontStyle: "italic"
                }}
            >
                💡 Cliquez sur les carrés de la légende pour afficher/masquer les courbes
            </Typography>

            {/* Hint accessible SR */}
            <Typography component="p" variant="caption" sx={srOnly}>
                Astuce : les séries peuvent être affichées ou masquées via les boutons de la légende.
            </Typography>

            {/* Table SR */}
            <Box component="table" id={tableId} sx={srOnly}>
                <caption>
                    {chartLabel}. Trois séries : {app.applicationName} (rouge), Moyenne globale (vert),
                    Moyenne domaine (violet).
                </caption>
                <thead>
                    <tr>
                        <th scope="col">Axe</th>
                        <th scope="col">{app.applicationName}</th>
                        <th scope="col">Moyenne globale</th>
                        <th scope="col">Moyenne domaine</th>
                    </tr>
                </thead>
                <tbody>
                    {LABELS.map((label, i) => (
                        <tr key={label}>
                            <th scope="row">{label}</th>
                            <td>
                                {appData[i] == null
                                    ? "N/A"
                                    : `${appData[i].toFixed(2)} (${scoreToLetter(appData[i])})`}
                            </td>
                            <td>
                                {avgAll[i] == null
                                    ? "N/A"
                                    : `${avgAll[i].toFixed(2)} (${scoreToLetter(avgAll[i])})`}
                            </td>
                            <td>
                                {avgDomain[i] == null
                                    ? "N/A"
                                    : `${avgDomain[i].toFixed(2)} (${scoreToLetter(avgDomain[i])})`}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Box>
        </Box>
    );
};

export default RadarQualiteChart;
