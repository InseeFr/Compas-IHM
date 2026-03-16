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
    Stack,
    Chip
} from "@mui/material";
import ReactECharts from "echarts-for-react";
import type { GlobalIndicator } from "models/indicateurs";

interface CorrelationChartProps {
    data: GlobalIndicator[];
}

type MetricKey = "cveCritical" | "testCoverage" | "vmDelay" | "mep" | "dette";

interface MetricOption {
    key: MetricKey;
    label: string;
    getValue: (item: GlobalIndicator) => number;
    unit: string;
}

const METRICS: MetricOption[] = [
    {
        key: "cveCritical",
        label: "CVE critiques",
        getValue: d => Number.parseInt(d.nbCveCritical ?? "0", 10),
        unit: "CVE"
    },
    {
        key: "testCoverage",
        label: "Couverture tests unitaires",
        getValue: d => Number.parseFloat(d.pourcentageCouvertureTestUniaire ?? "0"),
        unit: "%"
    },
    {
        key: "vmDelay",
        label: "Délai VM non mise à jour",
        getValue: d => Number.parseFloat(d.delaiVmNonMiseAjour ?? "0"),
        unit: "jours"
    },
    {
        key: "mep",
        label: "Dernière MEP",
        getValue: d => {
            const val =
                d.distanceCount !== undefined && d.distanceCount !== null ? Number(d.distanceCount) : -1;
            return Number.isNaN(val) || val === -1 ? 0 : val;
        },
        unit: "jours"
    },
    {
        key: "dette",
        label: "Dette technique",
        getValue: d => {
            const val = Number.parseFloat(d.detteTechnique ?? "-1");
            return Number.isNaN(val) || val < 0 ? 0 : val / 420; // minutes → jours
        },
        unit: "jours"
    }
];

/**
 * Calcule la corrélation de Pearson entre deux séries
 */
function calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    if (n === 0) return 0;

    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denomX = 0;
    let denomY = 0;

    for (let i = 0; i < n; i++) {
        const diffX = x[i] - meanX;
        const diffY = y[i] - meanY;
        numerator += diffX * diffY;
        denomX += diffX * diffX;
        denomY += diffY * diffY;
    }

    const denom = Math.sqrt(denomX * denomY);
    return denom === 0 ? 0 : numerator / denom;
}

/**
 * Calcule la régression linéaire (y = ax + b)
 */
function calculateRegression(x: number[], y: number[]): { slope: number; intercept: number } {
    const n = x.length;
    if (n === 0) return { slope: 0, intercept: 0 };

    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
        const diffX = x[i] - meanX;
        numerator += diffX * (y[i] - meanY);
        denominator += diffX * diffX;
    }

    const slope = denominator === 0 ? 0 : numerator / denominator;
    const intercept = meanY - slope * meanX;

    return { slope, intercept };
}

/**
 * Graphique de corrélation croisée avec scatter plot et régression
 */
export function CorrelationChart({ data }: Readonly<CorrelationChartProps>) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const [metricX, setMetricX] = useState<MetricKey>("testCoverage");
    const [metricY, setMetricY] = useState<MetricKey>("cveCritical");

    const metricXConfig = METRICS.find(m => m.key === metricX)!;
    const metricYConfig = METRICS.find(m => m.key === metricY)!;

    // Extraire les données (seulement applications, exclure valeurs nulles)
    const points = data
        .filter(d => !d.isModule)
        .map(d => ({
            name: d.applicationName,
            x: metricXConfig.getValue(d),
            y: metricYConfig.getValue(d)
        }))
        .filter(p => p.x > 0 && p.y > 0); // Exclure les valeurs nulles/négatives

    const xValues = points.map(p => p.x);
    const yValues = points.map(p => p.y);

    // Calculs statistiques
    const correlation = calculateCorrelation(xValues, yValues);
    const { slope, intercept } = calculateRegression(xValues, yValues);

    // Points de la ligne de régression
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const regressionLine = [
        [minX, slope * minX + intercept],
        [maxX, slope * maxX + intercept]
    ];

    const chartData = {
        points,
        correlation,
        regressionLine,
        metricXConfig,
        metricYConfig
    };

    return (
        <Box>
            <Stack spacing={2} mb={2}>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Typography variant="h3" color="text.primary">
                        Analyse de corrélation croisée
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        <FormControl size="small" sx={{ minWidth: 180 }}>
                            <InputLabel>Axe X</InputLabel>
                            <Select
                                label="Axe X"
                                value={metricX}
                                onChange={e => setMetricX(e.target.value as MetricKey)}
                            >
                                {METRICS.map(m => (
                                    <MenuItem key={m.key} value={m.key}>
                                        {m.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 180 }}>
                            <InputLabel>Axe Y</InputLabel>
                            <Select
                                label="Axe Y"
                                value={metricY}
                                onChange={e => setMetricY(e.target.value as MetricKey)}
                            >
                                {METRICS.map(m => (
                                    <MenuItem key={m.key} value={m.key}>
                                        {m.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>
                </Stack>

                {/* Indicateurs de corrélation */}
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                    <Chip
                        label={`Corrélation: ${chartData.correlation.toFixed(3)}`}
                        size="small"
                        sx={{ fontWeight: 600 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                        {chartData.points.length} applications analysées
                    </Typography>
                </Stack>
            </Stack>
            <figure>
                <ReactECharts
                    option={{
                        backgroundColor: "transparent",
                        tooltip: {
                            trigger: "item",
                            backgroundColor: isDark ? "#1d1d1d" : "#fff",
                            borderColor: isDark ? "#444" : "#ddd",
                            textStyle: {
                                color: isDark ? "#fff" : "#000"
                            },
                            formatter: (params: any) => {
                                if (params.seriesName === "Régression") return "";
                                const point = chartData.points[params.dataIndex];
                                return `
                            <strong>${point.name}</strong><br/>
                            ${chartData.metricXConfig.label}: <strong>${point.x.toFixed(1)} ${chartData.metricXConfig.unit}</strong><br/>
                            ${chartData.metricYConfig.label}: <strong>${point.y.toFixed(1)} ${chartData.metricYConfig.unit}</strong>
                        `;
                            }
                        },
                        grid: {
                            left: "10%",
                            right: "5%",
                            bottom: "12%",
                            top: "8%",
                            containLabel: true
                        },
                        xAxis: {
                            type: "value",
                            name: `${chartData.metricXConfig.label} (${chartData.metricXConfig.unit})`,
                            nameLocation: "middle",
                            nameGap: 30,
                            nameTextStyle: {
                                color: isDark ? "#fff" : "#000",
                                fontSize: 12
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
                        yAxis: {
                            type: "value",
                            name: `${chartData.metricYConfig.label} (${chartData.metricYConfig.unit})`,
                            nameLocation: "middle",
                            nameGap: 50,
                            nameTextStyle: {
                                color: isDark ? "#fff" : "#000",
                                fontSize: 12
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
                                name: "Applications",
                                type: "scatter",
                                data: chartData.points.map(p => [p.x, p.y]),
                                symbolSize: 8,
                                itemStyle: {
                                    color: theme.palette.primary.main,
                                    opacity: 0.7
                                },
                                emphasis: {
                                    itemStyle: {
                                        color: theme.palette.primary.dark,
                                        opacity: 1,
                                        borderColor: theme.palette.primary.light,
                                        borderWidth: 2
                                    }
                                }
                            },
                            {
                                name: "Régression",
                                type: "line",
                                data: chartData.regressionLine,
                                lineStyle: {
                                    color: theme.palette.error.main,
                                    width: 2,
                                    type: "dashed"
                                },
                                symbol: "none",
                                tooltip: {
                                    show: false
                                }
                            }
                        ]
                    }}
                    style={{ height: "400px", width: "100%" }}
                    opts={{ renderer: "canvas" }}
                />
            </figure>
        </Box>
    );
}
