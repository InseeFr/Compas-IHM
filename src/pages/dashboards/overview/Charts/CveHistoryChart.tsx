/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
    Box,
    Typography,
    useTheme,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack
} from "@mui/material";
import ReactECharts from "echarts-for-react";
import type { GlobalIndicator } from "models/indicateurs";

interface CveHistoryChartProps {
    data: GlobalIndicator[];
    monthlyData: any[];
    maxApps?: number;
}

/**
 * Graphique en ligne : Évolution mensuelle des CVE critiques
 */
export function CveHistoryChart({ data, monthlyData, maxApps = 6 }: Readonly<CveHistoryChartProps>) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const [selectedApp, setSelectedApp] = useState<string>("all");

    const appsWithCve = data
        .filter(d => !d.isModule && Number.parseInt(d.nbCveCritical ?? "0", 10) > 0)
        .map(d => ({
            id: d.idApplication?.toString() ?? d.applicationName,
            name: d.applicationName,
            critical: Number.parseInt(d.nbCveCritical ?? "0", 10)
        }))
        .sort((a, b) => b.critical - a.critical);

    const topApps = appsWithCve.slice(0, maxApps);

    const availableApps = appsWithCve.map(a => ({ id: a.id, name: a.name }));

    const monthlyByApp = new Map<string, Map<string, number>>();
    const allMonths = new Set<string>();

    monthlyData.forEach((item: any) => {
        const appId = item.applicationId?.toString() ?? item.applicationName;
        const month = new Date(item.month).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "short"
        });
        const cveCount = Number.parseInt(item.nbCveCritical ?? "0", 10);

        if (!monthlyByApp.has(appId)) {
            monthlyByApp.set(appId, new Map());
        }
        monthlyByApp.get(appId)!.set(month, cveCount);
        allMonths.add(month);
    });

    const months = Array.from(allMonths).sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateA.getTime() - dateB.getTime();
    });

    const last6Months = months.slice(-6);

    const series =
        selectedApp === "all"
            ? topApps.map(app => ({
                  name: app.name,
                  data: last6Months.map(month => monthlyByApp.get(app.id)?.get(month) ?? 0)
              }))
            : [
                  {
                      name: appsWithCve.find(a => a.id === selectedApp)?.name ?? "Application",
                      data: last6Months.map(month => monthlyByApp.get(selectedApp)?.get(month) ?? 0)
                  }
              ];

    const chartData = { months: last6Months, series, availableApps };

    return (
        <Box>
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                mb={2}
                alignItems="center"
                justifyContent="space-between"
            >
                <Typography variant="subtitle1" component="h3" color="text.primary">
                    Évolution mensuelle des CVE critiques
                </Typography>
                <FormControl size="small" sx={{ minWidth: 260 }}>
                    <InputLabel>Application</InputLabel>
                    <Select
                        label="Application"
                        value={selectedApp}
                        onChange={e => setSelectedApp(e.target.value)}
                    >
                        <MenuItem value="all">Les {maxApps} applications avec le plus de CVE</MenuItem>
                        {chartData.availableApps.map(app => (
                            <MenuItem key={app.id} value={app.id}>
                                {app.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Stack>
            <figure>
                <ReactECharts
                    option={{
                        backgroundColor: "transparent",
                        tooltip: {
                            trigger: "axis",
                            backgroundColor: isDark ? "#1d1d1d" : "#fff",
                            borderColor: isDark ? "#444" : "#ddd",
                            textStyle: {
                                color: isDark ? "#fff" : "#000"
                            }
                        },
                        legend: {
                            data: chartData.series.map(s => s.name),
                            top: 0,
                            textStyle: {
                                color: isDark ? "#fff" : "#000"
                            },
                            type: selectedApp === "all" ? "scroll" : "plain"
                        },
                        grid: {
                            left: "3%",
                            right: "4%",
                            bottom: "10%",
                            top: selectedApp === "all" ? "15%" : "10%",
                            containLabel: true
                        },
                        xAxis: {
                            type: "category",
                            boundaryGap: false,
                            data: chartData.months,
                            axisLabel: {
                                color: isDark ? "#fff" : "#000"
                            },
                            axisLine: {
                                lineStyle: {
                                    color: isDark ? "#555" : "#ccc"
                                }
                            }
                        },
                        yAxis: {
                            type: "value",
                            name: "CVE critiques",
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
                        series: chartData.series.map(s => ({
                            name: s.name,
                            type: "line",
                            smooth: true,
                            emphasis: {
                                focus: "series"
                            },
                            data: s.data,
                            lineStyle: {
                                width: 2
                            },
                            itemStyle: {
                                borderWidth: 2
                            }
                        }))
                    }}
                    style={{ height: "350px", width: "100%" }}
                    opts={{ renderer: "canvas" }}
                />
            </figure>
        </Box>
    );
}
