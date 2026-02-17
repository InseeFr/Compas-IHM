/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useEffect, useRef } from "react";
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

const RadarQualiteChart: React.FC<Props> = ({ app, population, title }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const textColor = isDark ? "#fff" : "#000";
    const gridColor = isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)";

    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useRef<echarts.ECharts | null>(null);

    const { appData, avgAll, avgDomain } = useMemo(() => {
        const appScores = pickSixAxisScores(app);

        const allRows = population.map(pickSixAxisScores);
        const allAvg = avgArrays(allRows);

        const domain = app.domaineFonc ?? "NR";
        const domainRows = population
            .filter(p => (p.domaineFonc ?? "NR") === domain)
            .map(pickSixAxisScores);
        const domainAvg = avgArrays(domainRows);

        return {
            appData: appScores,
            avgAll: allAvg,
            avgDomain: domainAvg,
            domainName: domain
        };
    }, [app, population]);

    const appColor = "#c01313ff";
    const allColor = "#19cf28ff";
    const domainColor = "#5112e4ff";

    const option = useMemo(() => {
        const labels: string[] = [
            "Maturité Cloud",
            "Sécurité",
            "Freq MEP",
            "Fiabilité",
            "Green IT",
            "Qualité"
        ];
    
        return {
            title: title
                ? {
                    text: title,
                    left: "center",
                    textStyle: { color: textColor }
                }
                : undefined,
            tooltip: {
                trigger: "item",
                backgroundColor: isDark ? "rgba(50,50,50,0.95)" : "rgba(255,255,255,0.95)",
                borderColor: isDark ? "#666" : "#ccc",
                borderWidth: 1,
                textStyle: {
                    color: textColor
                },
                formatter: (params: any) => {
                    if (!params.value || !Array.isArray(params.value)) {
                        return "";
                    }
                    
                    const seriesName = params.seriesName;
                    let html = `<div style="font-weight: bold; margin-bottom: 8px;">${seriesName}</div>`;
                    
                    params.value.forEach((val: number, idx: number) => {
                        const letter = scoreToLetter(val);
                        const labelName = labels[idx];
                        html += `
                            <div style="display: flex; justify-content: space-between; gap: 16px; margin: 4px 0;">
                                <span>${labelName}:</span>
                                <span style="font-weight: bold;">${val.toFixed(2)} (${letter})</span>
                            </div>
                        `;
                    });
                    
                    return html;
                }
            },
            legend: {
                data: [
                    app.applicationName,
                    "Moyenne globale",
                    "Moyenne domaine"
                ],
                bottom: 20,
                itemGap: 12,
                textStyle: { color: textColor }
            },
            radar: {
                center: ["50%", "40%"],
                radius: "52%",
    
                indicator: labels.map(name => ({
                    name,
                    max: 5
                })),
    
                splitNumber: 5,
    
                name: {
                    color: textColor,
                    fontSize: 12,
                    formatter: (value: string) => value,
                    padding: [4, 4]
                },
    
                splitLine: {
                    lineStyle: { color: gridColor }
                },
                splitArea: { show: false },
                axisLine: {
                    lineStyle: { color: gridColor }
                }
            },
            series: [
                {
                    name: app.applicationName,
                    type: "radar",
                    itemStyle: { color: appColor },
                    data: [
                        {
                            value: appData,
                            name: app.applicationName,
                            lineStyle: { color: appColor, width: 2 },
                            itemStyle: { color: appColor },
                            areaStyle: { color: "rgba(245, 132, 66, 0.25)" }
                        }
                    ]
                },
                {
                    name: "Moyenne globale",
                    type: "radar",
                    itemStyle: { color: allColor },
                    data: [
                        {
                            value: avgAll,
                            name: "Moyenne globale",
                            lineStyle: { color: allColor, width: 2 },
                            itemStyle: { color: allColor },
                            areaStyle: { color: "rgba(171,71,188,0.18)" }
                        }
                    ]
                },
                {
                    name: "Moyenne domaine",
                    type: "radar",
                    itemStyle: { color: domainColor },
                    data: [
                        {
                            value: avgDomain,
                            name: "Moyenne domaine",
                            lineStyle: { color: domainColor, width: 2 },
                            itemStyle: { color: domainColor },
                            areaStyle: { color: "rgba(38,166,154,0.18)" }
                        }
                    ]
                }
            ]
        };
    }, [app, appData, avgAll, avgDomain, title, textColor, gridColor, isDark, appColor, allColor, domainColor]);

    useEffect(() => {
        if (!chartRef.current) return;

        chartInstanceRef.current ??= echarts.init(chartRef.current);

        chartInstanceRef.current.setOption(option);

        return () => {
            chartInstanceRef.current?.dispose();
            chartInstanceRef.current = null;
        };
    }, [option]);

    return (
        <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
            <Box
                data-testid="radar-chart-container"
                ref={chartRef}
                sx={{
                    width: "100%",
                    height: "100%",
                    padding: "24px"
                }}
            />
            <Typography
                variant="caption"
                sx={{
                    position: "absolute",
                    bottom: -20,
                    right: 16,
                    color: "text.secondary",
                    fontStyle: "italic"
                }}
            >
                💡 Cliquez sur les carrés de la légende pour afficher/masquer les courbes
            </Typography>
        </Box>
    );
}

export default RadarQualiteChart;
