/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useEffect, useRef } from "react";
import { useTheme } from "@mui/material/styles";
import { Box } from "@mui/material";
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
    domaineFonctionnel?: string;
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

    const { appData, avgAll, avgDomain, domainName } = useMemo(() => {
        const appScores = pickSixAxisScores(app);

        const allRows = population.map(pickSixAxisScores);
        const allAvg = avgArrays(allRows);

        const domain = app.domaineFonctionnel ?? "NR";
        const domainRows = population
            .filter(p => (p.domaineFonctionnel ?? "NR") === domain)
            .map(pickSixAxisScores);
        const domainAvg = avgArrays(domainRows);

        return {
            appData: appScores,
            avgAll: allAvg,
            avgDomain: domainAvg,
            domainName: domain
        };
    }, [app, population]);

    const appColor = "#42a5f5";
    const allColor = "#ab47bc";
    const domainColor = "#26a69a";

    const option = useMemo(() => {
        const labels: string[] = [
            "Qualité",
            "Sécurité",
            "Fréquence MEP",
            "Fiabilité",
            "Green IT",
            "Maturité Cloud"
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
                formatter: (params: any) => {
                    const val = params.value;
                    return `${params.seriesName}: ${val.toFixed(2)} (${scoreToLetter(val)})`;
                }
            },
            legend: {
                data: [app.applicationName, "Moyenne globale", `Moyenne domaine (${domainName})`],
                bottom: 10,
                textStyle: { color: textColor }
            },
            radar: {
                indicator: labels.map(name => ({ name, max: 5 })),
                splitNumber: 5,
                name: {
                    textStyle: { color: textColor }
                },
                splitLine: {
                    lineStyle: { color: gridColor }
                },
                splitArea: {
                    show: false
                },
                axisLine: {
                    lineStyle: { color: gridColor }
                }
            },
            series: [
                {
                    name: app.applicationName,
                    type: "radar",
                    data: [
                        {
                            value: appData,
                            name: app.applicationName,
                            lineStyle: { color: appColor, width: 2 },
                            itemStyle: { color: appColor },
                            areaStyle: { color: "rgba(66,165,245,0.25)" }
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
                            lineStyle: { color: allColor, width: 2 },
                            itemStyle: { color: allColor },
                            areaStyle: { color: "rgba(171,71,188,0.18)" }
                        }
                    ]
                },
                {
                    name: `Moyenne domaine (${domainName})`,
                    type: "radar",
                    data: [
                        {
                            value: avgDomain,
                            name: `Moyenne domaine (${domainName})`,
                            lineStyle: { color: domainColor, width: 2 },
                            itemStyle: { color: domainColor },
                            areaStyle: { color: "rgba(38,166,154,0.18)" }
                        }
                    ]
                }
            ]
        };
    }, [app, appData, avgAll, avgDomain, domainName, title, textColor, gridColor]);

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
        <Box
            data-testid="radar-chart-container"
            ref={chartRef}
            sx={{
                width: 320,
                height: 340,
                position: "relative"
            }}
        />
    );
};

export default RadarQualiteChart;
