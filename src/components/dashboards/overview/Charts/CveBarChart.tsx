import { useMemo } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import type { GlobalIndicator } from "models/indicateurs";

interface CveBarChartProps {
    data: GlobalIndicator[];
    topN?: number;
}

/**
 * Graphique à barres empilées : Top N applications avec le plus de CVE
 */
export function CveBarChart({ data, topN = 10 }: Readonly<CveBarChartProps>) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const chartData = useMemo(() => {
        // Calculer le total de CVE par application
        const appsWithCve = data
            .filter(d => !d.isModule) // Seulement les applications
            .map(d => ({
                name: d.applicationName,
                critical: parseInt(d.nbCveCritical ?? "0", 10),
                high: parseInt(d.nbCveHigh ?? "0", 10),
                medium: parseInt(d.nbCveMedium ?? "0", 10),
                low: parseInt(d.nbCveLow ?? "0", 10)
            }))
            .map(d => ({
                ...d,
                total: d.critical + d.high + d.medium + d.low
            }))
            .filter(d => d.total > 0)
            .sort((a, b) => b.total - a.total)
            .slice(0, topN);

        return {
            applications: appsWithCve.map(d => d.name),
            critical: appsWithCve.map(d => d.critical),
            high: appsWithCve.map(d => d.high),
            medium: appsWithCve.map(d => d.medium),
            low: appsWithCve.map(d => d.low)
        };
    }, [data, topN]);

    const option: EChartsOption = useMemo(
        () => ({
            backgroundColor: "transparent",
            tooltip: {
                trigger: "axis",
                axisPointer: {
                    type: "shadow"
                },
                backgroundColor: isDark ? "#1d1d1d" : "#fff",
                borderColor: isDark ? "#444" : "#ddd",
                textStyle: {
                    color: isDark ? "#fff" : "#000"
                }
            },
            legend: {
                data: ["Faible", "Moyen", "Élevé", "Critique"],
                bottom: 0,
                textStyle: {
                    color: isDark ? "#fff" : "#000"
                }
            },
            grid: {
                left: "3%",
                right: "4%",
                bottom: "15%",
                top: "5%",
                containLabel: true
            },
            xAxis: {
                type: "category",
                data: chartData.applications,
                axisLabel: {
                    rotate: 45,
                    color: isDark ? "#fff" : "#000",
                    fontSize: 11
                },
                axisLine: {
                    lineStyle: {
                        color: isDark ? "#555" : "#ccc"
                    }
                }
            },
            yAxis: {
                type: "value",
                nameTextStyle: {
                    color: isDark ? "#fff" : "#000"
                },
                axisLabel: {
                    color: isDark ? "#fff" : "#000"
                },
                axisLine: {
                    lineStyle: {
                        color: isDark ? "#555" : "#ccc"
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: isDark ? "#333" : "#eee"
                    }
                }
            },
            series: [
                {
                    name: "Faible",
                    type: "bar",
                    stack: "total",
                    emphasis: {
                        focus: "series"
                    },
                    itemStyle: {
                        color: "#388e3c"
                    },
                    data: chartData.low
                },
                {
                    name: "Moyen",
                    type: "bar",
                    stack: "total",
                    emphasis: {
                        focus: "series"
                    },
                    itemStyle: {
                        color: "#fbc02d"
                    },
                    data: chartData.medium
                },
                {
                    name: "Élevé",
                    type: "bar",
                    stack: "total",
                    emphasis: {
                        focus: "series"
                    },
                    itemStyle: {
                        color: "#f57c00"
                    },
                    data: chartData.high
                },
                {
                    name: "Critique",
                    type: "bar",
                    stack: "total",
                    emphasis: {
                        focus: "series"
                    },
                    itemStyle: {
                        color: "#d32f2f"
                    },
                    data: chartData.critical
                }
            ]
        }),
        [chartData, isDark]
    );

    return (
        <Box>
            <Typography variant="subtitle2" gutterBottom textAlign="center" color="text.primary">
                Top {topN} applications avec le plus de CVE
            </Typography>
            <ReactECharts
                option={option}
                style={{ height: "400px", width: "100%" }}
                opts={{ renderer: "canvas" }}
            />
        </Box>
    );
}
