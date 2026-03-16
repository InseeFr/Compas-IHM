/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Typography, useTheme } from "@mui/material";
import ReactECharts from "echarts-for-react";
import type { GlobalIndicator } from "models/indicateurs";

interface DonutChartData {
    name: string;
    value: number;
    color: string;
    [key: string]: any;
}

interface GenericDonutProps {
    data: GlobalIndicator[];
    title: string;
    dataTransformer: (data: GlobalIndicator[]) => DonutChartData[];
}

/**
 * Composant Donut générique réutilisable avec ECharts
 */
export function GenericDonut({ data, title, dataTransformer }: Readonly<GenericDonutProps>) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const chartData = dataTransformer(data).filter(d => d.value > 0);

    return (
        <Box>
            <Typography
                variant="subtitle1"
                component="p"
                gutterBottom
                textAlign="center"
                color="text.primary"
            >
                {title}
            </Typography>
            <figure>
                <ReactECharts
                    option={{
                        backgroundColor: "transparent",
                        tooltip: {
                            trigger: "item",
                            formatter: "{b}: <strong>{c}</strong> ({d}%)",
                            backgroundColor: isDark ? "#1d1d1d" : "#fff",
                            borderColor: isDark ? "#444" : "#ddd",
                            textStyle: {
                                color: isDark ? "#fff" : "#000"
                            }
                        },
                        legend: {
                            orient: "horizontal",
                            bottom: 0,
                            left: "center",
                            textStyle: {
                                color: isDark ? "#fff" : "#000",
                                fontSize: 12
                            },
                            formatter: (name: string) => {
                                const item = chartData.find(d => d.name === name);
                                return item ? `${name} (${item.value})` : name;
                            }
                        },
                        series: [
                            {
                                type: "pie",
                                radius: ["50%", "70%"],
                                center: ["50%", "45%"],
                                avoidLabelOverlap: true,
                                itemStyle: {
                                    borderRadius: 4,
                                    borderColor: isDark ? "#121212" : "#fff",
                                    borderWidth: 2
                                },
                                label: {
                                    show: false
                                },
                                emphasis: {
                                    label: {
                                        show: false
                                    },
                                    itemStyle: {
                                        shadowBlur: 10,
                                        shadowOffsetX: 0,
                                        shadowColor: "rgba(0, 0, 0, 0.5)"
                                    }
                                },
                                data: chartData.map(item => ({
                                    name: item.name,
                                    value: item.value,
                                    itemStyle: {
                                        color: item.color
                                    }
                                }))
                            }
                        ]
                    }}
                    style={{ height: "280px", width: "100%" }}
                    opts={{ renderer: "svg" }}
                />
            </figure>
        </Box>
    );
}
