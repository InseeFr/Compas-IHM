/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Typography, useTheme } from "@mui/material";
import ReactECharts from "echarts-for-react";
import type { GlobalIndicator } from "models/indicateurs";
import ChartTitle from "../ChartTitle";

// ─── Helpers ────────────────────────────────────────────────────────────────

const GRADE_A11Y_COLORS: Record<string, string> = {
    A: "#1b5e20",
    B: "#388e3c",
    C: "#8bc34a",
    D: "#fbc02d",
    E: "#f57c00",
    F: "#d32f2f"
};

function gradeA11yColor(g: string | undefined) {
    return GRADE_A11Y_COLORS[g?.toUpperCase() ?? ""] ?? "#90a4ae";
}

function scoreColor(s: number): string {
    if (s >= 80) return "#388e3c";
    if (s >= 60) return "#8bc34a";
    if (s >= 40) return "#fbc02d";
    return "#d32f2f";
}

interface A11yProps {
    data: GlobalIndicator[];
}

function ChartSubtitle({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <Typography variant="caption" textAlign="center" display="block" color="text.secondary" mb={1}>
            {children}
        </Typography>
    );
}

// Apps ayant réellement un score d audit (> 0)
function audited(data: GlobalIndicator[]) {
    return data.filter(
        a => a.scoreAuditA11y !== undefined && a.scoreAuditA11y !== null && a.scoreAuditA11y > 0
    );
}

// ─── 1. GAUGE — Couverture des audits ───────────────────────────────────────

export function AccessibiliteGaugeChart({ data }: Readonly<A11yProps>) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const auditedApps = audited(data);
    const total = data.length;
    const auditedCount = auditedApps.length;

    const scores = auditedApps.map(a => a.scoreAuditA11y!);
    const avg = scores.length > 0 ? scores.reduce((s, v) => s + v, 0) / scores.length : 0;
    const coverageRate = total > 0 ? (auditedCount / total) * 100 : 0;

    return (
        <Box>
            <ChartTitle>Couverture des audits accessibilité</ChartTitle>
            <ChartSubtitle>
                {auditedCount} application{auditedCount > 1 ? "s" : ""} auditée
                {auditedCount > 1 ? "s" : ""} sur {total}
            </ChartSubtitle>
            <ReactECharts
                option={{
                    backgroundColor: "transparent",
                    tooltip: { show: false },
                    series: [
                        // Gauge principal — couverture
                        {
                            type: "gauge",
                            center: ["30%", "62%"],
                            radius: "85%",
                            startAngle: 200,
                            endAngle: -20,
                            min: 0,
                            max: 100,
                            axisLine: {
                                lineStyle: {
                                    width: 18,
                                    color: [
                                        [coverageRate / 100, "#1565c0"],
                                        [1, isDark ? "#2a2a3a" : "#e0e0e0"]
                                    ]
                                }
                            },
                            pointer: {
                                icon: "path://M12.8,0.7l12,40.1H0.7L12.8,0.7z",
                                length: "12%",
                                width: 20,
                                offsetCenter: [0, "-60%"],
                                itemStyle: { color: "#1565c0" }
                            },
                            axisTick: { show: false },
                            splitLine: { show: false },
                            axisLabel: { show: false },
                            detail: {
                                valueAnimation: true,
                                fontSize: 28,
                                fontWeight: 700,
                                formatter: "{value}%",
                                color: "#1565c0",
                                offsetCenter: [0, "18%"]
                            },
                            title: {
                                offsetCenter: [0, "52%"],
                                fontSize: 12,
                                color: isDark ? "#aaa" : "#666"
                            },
                            data: [
                                {
                                    value: Number.parseFloat(coverageRate.toFixed(1)),
                                    name: "Applications auditées"
                                }
                            ]
                        },
                        // Mini gauge — score moyen des auditées
                        {
                            type: "gauge",
                            center: ["75%", "62%"],
                            radius: "50%",
                            startAngle: 200,
                            endAngle: -20,
                            min: 0,
                            max: 100,
                            axisLine: {
                                lineStyle: {
                                    width: 12,
                                    color: [
                                        [0.4, "#d32f2f"],
                                        [0.6, "#fbc02d"],
                                        [0.8, "#8bc34a"],
                                        [1, "#388e3c"]
                                    ]
                                }
                            },
                            pointer: {
                                icon: "path://M12.8,0.7l12,40.1H0.7L12.8,0.7z",
                                length: "12%",
                                width: 20,
                                offsetCenter: [0, "-60%"]
                            },
                            axisTick: { show: false },
                            splitLine: { show: false },
                            axisLabel: { show: false },
                            detail: {
                                valueAnimation: true,
                                fontSize: 22,
                                fontWeight: 700,
                                formatter: auditedCount > 0 ? "{value}%" : "—",
                                color: scoreColor(avg),
                                offsetCenter: [0, "12%"]
                            },
                            title: {
                                offsetCenter: [0, "56%"],
                                fontSize: 11,
                                color: isDark ? "#aaa" : "#666"
                            },
                            data: [
                                { value: Number.parseFloat(avg.toFixed(1)), name: "Score moyen audités" }
                            ]
                        }
                    ]
                }}
                style={{ height: "300px", width: "100%" }}
                opts={{ renderer: "svg" }}
            />
        </Box>
    );
}

// ─── 2. BARRES — Apps auditées uniquement (score > 0) ───────────────────────

export function AccessibiliteAuditedAppsChart({ data }: Readonly<A11yProps>) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const apps = audited(data)
        .map(a => ({
            name: a.applicationName ?? a.sndi ?? "—",
            score: a.scoreAuditA11y!,
            grade: a.lettreA11y?.toUpperCase() ?? "NR",
            hasDecla: a.declarationA11y === true,
            domaine: a.domaine ?? ""
        }))
        .sort((a, b) => a.score - b.score);

    if (apps.length === 0) {
        return (
            <Box p={6} textAlign="center">
                <Typography variant="body1" color="text.secondary" gutterBottom>
                    Aucune application n a encore passé d audit d accessibilité.
                </Typography>
                <Typography variant="caption" color="text.disabled">
                    Les résultats apparaîtront ici une fois les audits réalisés.
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <ChartTitle>Résultats des audits par application</ChartTitle>
            <ChartSubtitle>
                {apps.length} application{apps.length > 1 ? "s" : ""} auditée{apps.length > 1 ? "s" : ""}
            </ChartSubtitle>
            <ReactECharts
                option={{
                    backgroundColor: "transparent",
                    tooltip: {
                        trigger: "axis",
                        axisPointer: { type: "shadow" },
                        backgroundColor: isDark ? "#1e1e2e" : "#fff",
                        borderColor: isDark ? "#444" : "#e0e0e0",
                        textStyle: { color: isDark ? "#eee" : "#222" },
                        formatter: (params: any) => {
                            const a = apps[params[0].dataIndex];
                            return `<b>${a.name}</b><br/>
                                ${a.domaine}<br/>
                                Score : <b>${a.score} %</b><br/>
                                Note : <b>${a.grade}</b><br/>`;
                        }
                    },
                    grid: { left: "2%", right: "10%", top: "2%", bottom: "2%", containLabel: true },
                    xAxis: {
                        type: "value",
                        min: 0,
                        max: 100,
                        axisLabel: { color: isDark ? "#aaa" : "#666", formatter: "{value}%" },
                        splitLine: {
                            lineStyle: { color: isDark ? "#2a2a3a" : "#f0f0f0", type: "dashed" }
                        },
                        axisLine: { show: false }
                    },
                    yAxis: {
                        type: "category",
                        data: apps.map(a => a.name),
                        axisLabel: {
                            color: isDark ? "#ccc" : "#555",
                            fontSize: 11,
                            width: 150,
                            overflow: "truncate"
                        },
                        axisLine: { show: false },
                        axisTick: { show: false }
                    },
                    series: [
                        {
                            type: "bar",
                            data: apps.map(a => ({
                                value: a.score,
                                itemStyle: { color: gradeA11yColor(a.grade), borderRadius: [0, 4, 4, 0] }
                            })),
                            label: {
                                show: true,
                                position: "right",
                                formatter: (p: any) => {
                                    const a = apps[p.dataIndex];
                                    return `${a.score}%${a.hasDecla ? "  ✓" : ""}`;
                                },
                                color: isDark ? "#ccc" : "#555",
                                fontSize: 11,
                                fontWeight: "bold"
                            }
                        }
                    ]
                }}
                style={{ height: `${Math.max(160, apps.length * 38 + 40)}px`, width: "100%" }}
                opts={{ renderer: "svg" }}
            />
        </Box>
    );
}
