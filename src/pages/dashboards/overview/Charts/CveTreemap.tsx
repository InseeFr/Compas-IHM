import { useState } from "react";
import {
    Box,
    Typography,
    useTheme,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    type SelectChangeEvent
} from "@mui/material";
import ReactECharts from "echarts-for-react";
import type { GlobalIndicator } from "models/indicateurs";

interface CveTreemapProps {
    data: GlobalIndicator[];
    topN?: number;
}

type ColorMetric = "dette" | "mep";

// Catégorisation dette technique (minutes → jours)
function getDetteBucket(minutesStr?: string): string {
    const val = Number.parseFloat(minutesStr ?? "-1");
    if (Number.isNaN(val) || val < 0) return "NR";
    const jours = val / 420;
    if (jours <= 5) return "0-5j";
    if (jours <= 15) return "6-15j";
    if (jours <= 30) return "16-30j";
    if (jours <= 90) return "31-90j";
    return ">90j";
}

// Catégorisation MEP (jours)
function getMepBucket(days?: number | string): string {
    const num = days !== undefined && days !== null ? Number(days) : -1;
    if (Number.isNaN(num) || num === -1) return "NR";
    if (num <= 30) return "0-30j";
    if (num <= 60) return "31-60j";
    if (num <= 90) return "61-90j";
    if (num <= 180) return "91-180j";
    return ">180j";
}

const DETTE_COLORS: Record<string, string> = {
    "0-5j": "#388e3c",
    "6-15j": "#66bb6a",
    "16-30j": "#fbc02d",
    "31-90j": "#f57c00",
    ">90j": "#d32f2f",
    NR: "#bdbdbd"
};

const MEP_COLORS: Record<string, string> = {
    "0-30j": "#388e3c",
    "31-60j": "#8bc34a",
    "61-90j": "#ffee58",
    "91-180j": "#ffa726",
    ">180j": "#e53935",
    NR: "#bdbdbd"
};

/**
 * Treemap des applications avec CVE critiques, coloré par dette ou MEP
 */
export function CveTreemap({ data, topN = 25 }: Readonly<CveTreemapProps>) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const [colorMetric, setColorMetric] = useState<ColorMetric>("dette");

    const handleColorMetricChange = (e: SelectChangeEvent<ColorMetric>) => {
        setColorMetric(e.target.value as ColorMetric);
    };

    // Top N applications avec CVE critiques
    const apps = data
        .filter(d => !d.isModule && Number.parseInt(d.nbCveCritical ?? "0", 10) > 0)
        .map(d => ({
            name: d.applicationName,
            critical: Number.parseInt(d.nbCveCritical ?? "0", 10),
            high: Number.parseInt(d.nbCveHigh ?? "0", 10),
            medium: Number.parseInt(d.nbCveMedium ?? "0", 10),
            low: Number.parseInt(d.nbCveLow ?? "0", 10),
            detteBucket: getDetteBucket(d.detteTechnique),
            mepBucket: getMepBucket(d.distanceCount)
        }))
        .sort((a, b) => b.critical - a.critical)
        .slice(0, topN);

    const chartData = apps.map(app => ({
        name: app.name,
        value: app.critical,
        itemStyle: {
            color: colorMetric === "dette" ? DETTE_COLORS[app.detteBucket] : MEP_COLORS[app.mepBucket]
        },
        tooltip: {
            formatter: () => {
                const bucket = colorMetric === "dette" ? app.detteBucket : app.mepBucket;
                const metricLabel = colorMetric === "dette" ? "Dette tech." : "Dernière MEP";
                return `
                        <strong>${app.name}</strong><br/>
                        CVE Critiques: <strong>${app.critical}</strong><br/>
                        CVE Élevées: <strong>${app.high}</strong><br/>
                        CVE Moyennes: <strong>${app.medium}</strong><br/>
                        CVE Faibles: <strong>${app.low}</strong><br/>
                        <hr style="margin: 4px 0;"/>
                        ${metricLabel}: <strong>${bucket}</strong>
                    `;
            }
        }
    }));

    const legendColors = colorMetric === "dette" ? DETTE_COLORS : MEP_COLORS;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" component="h3" color="text.primary">
                    Les {topN} applications avec CVE critiques
                </Typography>
                <FormControl size="small" sx={{ minWidth: 220 }}>
                    <InputLabel id="color-metric-label">Colorier par</InputLabel>
                    <Select
                        labelId="color-metric-label"
                        id="color-metric-select"
                        label="Colorier par"
                        value={colorMetric}
                        onChange={handleColorMetricChange}
                    >
                        <MenuItem value="dette">Dette technique (jours)</MenuItem>
                        <MenuItem value="mep">Dernière MEP (jours)</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <figure
                aria-label={`Treemap des ${topN} applications avec CVE critiques, coloré par ${colorMetric === "dette" ? "dette technique" : "dernière MEP"}`}
            >
                <ReactECharts
                    option={{
                        backgroundColor: "transparent",
                        tooltip: {
                            trigger: "item",
                            backgroundColor: isDark ? "#1d1d1d" : "#fff",
                            borderColor: isDark ? "#444" : "#ddd",
                            textStyle: {
                                color: isDark ? "#fff" : "#000"
                            }
                        },
                        series: [
                            {
                                type: "treemap",
                                data: chartData,
                                left: "2%",
                                right: "2%",
                                top: "2%",
                                bottom: "2%",
                                roam: false,
                                nodeClick: false,
                                breadcrumb: {
                                    show: false
                                },
                                label: {
                                    show: true,
                                    formatter: "{b}\n{c}",
                                    color: "#fff",
                                    fontWeight: "bold",
                                    fontSize: 11,
                                    overflow: "truncate"
                                },
                                itemStyle: {
                                    borderColor: isDark ? "#121212" : "#fff",
                                    borderWidth: 2,
                                    gapWidth: 2
                                },
                                emphasis: {
                                    label: {
                                        show: true,
                                        fontSize: 13
                                    },
                                    itemStyle: {
                                        shadowBlur: 10,
                                        shadowColor: "rgba(0,0,0,0.5)"
                                    }
                                },
                                levels: [
                                    {
                                        itemStyle: {
                                            borderWidth: 0,
                                            gapWidth: 2
                                        }
                                    }
                                ]
                            }
                        ]
                    }}
                    style={{ height: "400px", width: "100%" }}
                    opts={{ renderer: "canvas" }}
                />
            </figure>
            {/* Légende des couleurs */}
            <Box display="flex" flexWrap="wrap" gap={1.5} mt={2} justifyContent="center">
                {Object.entries(legendColors).map(([label, color]) => (
                    <Box key={label} display="flex" alignItems="center" gap={0.5}>
                        <Box
                            sx={{
                                width: 12,
                                height: 12,
                                borderRadius: "3px",
                                bgcolor: color,
                                border: theme => `1px solid ${theme.palette.divider}`
                            }}
                        />
                        <Typography variant="caption" color="text.secondary">
                            {label}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
