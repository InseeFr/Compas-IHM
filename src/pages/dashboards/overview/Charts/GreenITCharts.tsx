/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Typography, useTheme, Chip, Stack } from "@mui/material";
import ReactECharts from "echarts-for-react";
import type { GlobalIndicator } from "models/indicateurs";
import ChartTitle from "../ChartTitle";

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseNum(v: string | undefined): number | null {
    if (!v || v === "NR" || v === "SO") return null;
    const n = Number.parseFloat(v);
    return Number.isNaN(n) ? null : n;
}

function fmt(v: number, unit = ""): string {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M${unit}`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k${unit}`;
    return `${v.toFixed(1)}${unit}`;
}

interface BubbleChartProps {
    data: GlobalIndicator[];
}

// ─── 1. GROUPED BAR — Prod vs Hors-Prod par ressource ─────────────────────

export function GreenITProdHorsProdGroupedChart({ data }: Readonly<BubbleChartProps>) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    type Resource = {
        label: string;
        totalKey: keyof GlobalIndicator;
        prodKey: keyof GlobalIndicator;
        unit: string;
        color: string;
        colorProd: string;
    };

    const RESOURCES: Resource[] = [
        {
            label: "Conso (Wh)",
            totalKey: "conso",
            prodKey: "consoProd",
            unit: "Wh",
            color: "#ef5350",
            colorProd: "#b71c1c"
        },
        {
            label: "CPU (GHz)",
            totalKey: "cpuAllocated",
            prodKey: "cpuAllocatedProd",
            unit: "GHz",
            color: "#42a5f5",
            colorProd: "#1565c0"
        },
        {
            label: "RAM (Go)",
            totalKey: "ramAllocated",
            prodKey: "ramAllocatedProd",
            unit: "Go",
            color: "#66bb6a",
            colorProd: "#1b5e20"
        },
        {
            label: "Disque (Go)",
            totalKey: "diskAllocated",
            prodKey: "diskAllocatedProd",
            unit: "Go",
            color: "#ffa726",
            colorProd: "#e65100"
        },
        {
            label: "VMs",
            totalKey: "nbVm",
            prodKey: "nbVmProd",
            unit: "",
            color: "#ab47bc",
            colorProd: "#6a1b9a"
        }
    ];

    const stats = RESOURCES.map(r => {
        const appsOk = data.filter(app => parseNum(app[r.totalKey] as string) !== null);
        const total = appsOk.reduce((s, a) => s + (parseNum(a[r.totalKey] as string) ?? 0), 0);
        const prod = appsOk.reduce((s, a) => s + (parseNum(a[r.prodKey] as string) ?? 0), 0);
        const horsProd = total - prod;
        const pct = total > 0 ? (prod / total) * 100 : 0;
        return { ...r, total, prod, horsProd, pct, count: appsOk.length };
    }).filter(r => r.total > 0);

    if (stats.length === 0) {
        return <EmptyState label="Aucune donnée Prod/Hors-Prod disponible" />;
    }

    // Normaliser à 100% pour montrer la proportion
    const option = {
        backgroundColor: "transparent",
        tooltip: {
            trigger: "axis",
            axisPointer: { type: "shadow" },
            backgroundColor: isDark ? "#1e1e2e" : "#fff",
            borderColor: isDark ? "#444" : "#e0e0e0",
            textStyle: { color: isDark ? "#eee" : "#222" },
            formatter: (params: any) => {
                const idx = params[0].dataIndex;
                const s = stats[idx];
                return `
                    <b style="font-size:13px">${s.label}</b><br/>
                    <span style="color:#999">Applicatifs avec données : ${s.count}</span><br/><br/>
                    <span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${s.colorProd};margin-right:6px"></span>
                    <b>Production</b> : ${fmt(s.prod, " " + s.unit)} (${s.pct.toFixed(1)}%)<br/>
                    <span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${s.color};margin-right:6px"></span>
                    <b>Hors-Prod</b> : ${fmt(s.horsProd, " " + s.unit)} (${(100 - s.pct).toFixed(1)}%)<br/>
                    <hr style="border:0;border-top:1px solid #444;margin:4px 0"/>
                    <b>Total</b> : ${fmt(s.total, " " + s.unit)}
                `;
            }
        },
        legend: {
            data: ["Production", "Hors-Production"],
            bottom: 0,
            textStyle: { color: isDark ? "#ccc" : "#555", fontSize: 12 }
        },
        grid: { left: "3%", right: "4%", bottom: "12%", top: "8%", containLabel: true },
        xAxis: {
            type: "category",
            data: stats.map(s => s.label),
            axisLabel: { color: isDark ? "#ccc" : "#555", fontSize: 12 },
            axisLine: { lineStyle: { color: isDark ? "#444" : "#ddd" } },
            axisTick: { show: false }
        },
        yAxis: {
            type: "value",
            name: "Part (%)",
            min: 0,
            max: 100,
            axisLabel: { color: isDark ? "#aaa" : "#666", formatter: "{value}%" },
            splitLine: { lineStyle: { color: isDark ? "#2a2a3a" : "#f0f0f0", type: "dashed" } }
        },
        series: [
            {
                name: "Production",
                type: "bar",
                stack: "total",
                data: stats.map(s => ({
                    value: s.pct,
                    itemStyle: { color: s.colorProd, borderRadius: [0, 0, 4, 4] }
                })),
                label: {
                    show: true,
                    position: "inside",
                    formatter: (p: any) => (p.value > 8 ? `${p.value.toFixed(0)}%` : ""),
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 12
                }
            },
            {
                name: "Hors-Production",
                type: "bar",
                stack: "total",
                data: stats.map(s => ({
                    value: 100 - s.pct,
                    itemStyle: { color: s.color, opacity: 0.75, borderRadius: [4, 4, 0, 0] }
                })),
                label: {
                    show: true,
                    position: "inside",
                    formatter: (p: any) => (p.value > 8 ? `${p.value.toFixed(0)}%` : ""),
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 12
                }
            }
        ]
    };

    return (
        <Box>
            <ChartTitle>Répartition Prod vs Hors-Prod par ressource</ChartTitle>
            <ChartSubtitle>
                Part des ressources allouées en environnement de production vs hors-production
            </ChartSubtitle>
            <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" mb={1}>
                {stats.map(s => (
                    <Chip
                        key={s.label}
                        label={`${s.label} : ${fmt(s.total, " " + s.unit)} total`}
                        size="small"
                        sx={{
                            fontSize: 11,
                            bgcolor: isDark ? "#2a2a3a" : "#f5f5f5",
                            color: isDark ? "#ccc" : "#555"
                        }}
                    />
                ))}
            </Stack>
            <ReactECharts
                option={option}
                style={{ height: "360px", width: "100%" }}
                opts={{ renderer: "svg" }}
            />
        </Box>
    );
}

// ─── 2. WATERFALL Prod vs Hors-Prod par DOMAINE ─────────────────────────────

export function GreenITDomainProdChart({ data }: Readonly<BubbleChartProps>) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    // Agréger par domaine
    const domainMap = new Map<string, { prod: number; horsProd: number; count: number }>();

    data.forEach(app => {
        const conso = parseNum(app.conso);
        const consoProd = parseNum(app.consoProd);
        if (conso === null) return;

        const domaine = app.domaine ?? "Inconnu";
        const entry = domainMap.get(domaine) ?? { prod: 0, horsProd: 0, count: 0 };
        const prodVal = consoProd ?? 0;
        entry.prod += prodVal;
        entry.horsProd += conso - prodVal;
        entry.count += 1;
        domainMap.set(domaine, entry);
    });

    const domains = Array.from(domainMap.entries())
        .map(([name, v]) => ({ name, ...v, total: v.prod + v.horsProd }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 15);

    if (domains.length === 0) {
        return <EmptyState label="Aucune donnée par domaine disponible" />;
    }

    return (
        <Box>
            <ChartTitle>Consommation par domaine — Prod vs Hors-Prod</ChartTitle>
            <ChartSubtitle>
                Consommation totale (Wh) agrégée par domaine fonctionnel, décomposée en production et
                hors-production
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
                            const idx = params[0].dataIndex;
                            const d = domains[idx];
                            return `
                                <b style="font-size:13px">${d.name}</b>
                                <div style="color:#999;font-size:11px;margin-bottom:4px">${d.count} application${d.count > 1 ? "s" : ""}</div>
                                <span style="display:inline-block;width:10px;height:10px;background:#b71c1c;margin-right:6px;border-radius:2px"></span>
                                <b>Production</b> : ${fmt(d.prod, " Wh")} (${d.total > 0 ? ((d.prod / d.total) * 100).toFixed(1) : 0}%)<br/>
                                <span style="display:inline-block;width:10px;height:10px;background:#ef9a9a;margin-right:6px;border-radius:2px"></span>
                                <b>Hors-Prod</b> : ${fmt(d.horsProd, " Wh")} (${d.total > 0 ? ((d.horsProd / d.total) * 100).toFixed(1) : 0}%)<br/>
                                <hr style="border:0;border-top:1px solid #444;margin:4px 0"/>
                                <b>Total</b> : ${fmt(d.total, " Wh")}
                            `;
                        }
                    },
                    legend: {
                        data: ["Production", "Hors-Production"],
                        right: 0,
                        top: 0,
                        textStyle: { color: isDark ? "#ccc" : "#555", fontSize: 11 }
                    },
                    grid: { left: "2%", right: "2%", bottom: "22%", top: "10%", containLabel: true },
                    xAxis: {
                        type: "category",
                        data: domains.map(d => d.name),
                        axisLabel: {
                            color: isDark ? "#ccc" : "#555",
                            fontSize: 11,
                            rotate: 35,
                            interval: 0,
                            width: 100,
                            overflow: "truncate",
                            ellipsis: "…"
                        },
                        axisLine: { lineStyle: { color: isDark ? "#444" : "#ddd" } },
                        axisTick: { show: false }
                    },
                    yAxis: {
                        type: "value",
                        name: "Consommation (Wh)",
                        nameTextStyle: { color: isDark ? "#aaa" : "#666", fontSize: 11 },
                        axisLabel: {
                            color: isDark ? "#aaa" : "#666",
                            formatter: (v: number) => fmt(v)
                        },
                        splitLine: {
                            lineStyle: { color: isDark ? "#2a2a3a" : "#f0f0f0", type: "dashed" }
                        }
                    },
                    series: [
                        {
                            name: "Production",
                            type: "bar",
                            stack: "conso",
                            data: domains.map(d => d.prod),
                            itemStyle: { color: "#b71c1c", borderRadius: [0, 0, 3, 3] },
                            label: {
                                show: true,
                                position: "inside",
                                formatter: (p: any) => {
                                    const d = domains[p.dataIndex];
                                    const pct = d.total > 0 ? (d.prod / d.total) * 100 : 0;
                                    return pct > 15 ? `${pct.toFixed(0)}%` : "";
                                },
                                color: "#ffcdd2",
                                fontSize: 10,
                                fontWeight: "bold"
                            }
                        },
                        {
                            name: "Hors-Production",
                            type: "bar",
                            stack: "conso",
                            data: domains.map(d => d.horsProd),
                            itemStyle: { color: "#ef9a9a", borderRadius: [3, 3, 0, 0] },
                            label: {
                                show: true,
                                position: "inside",
                                formatter: (p: any) => {
                                    const d = domains[p.dataIndex];
                                    const pct = d.total > 0 ? (d.horsProd / d.total) * 100 : 0;
                                    return pct > 15 ? `${pct.toFixed(0)}%` : "";
                                },
                                color: "#b71c1c",
                                fontSize: 10,
                                fontWeight: "bold"
                            }
                        }
                    ]
                }}
                style={{ height: "400px", width: "100%" }}
                opts={{ renderer: "svg" }}
            />
        </Box>
    );
}

// ─── Composants utilitaires ────────────────────────────────────────────────

function ChartSubtitle({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <Typography variant="caption" textAlign="center" display="block" color="text.secondary" mb={1}>
            {children}
        </Typography>
    );
}

function EmptyState({ label }: Readonly<{ label: string }>) {
    return (
        <Box p={4} textAlign="center">
            <Typography variant="body2" color="text.secondary">
                {label}
            </Typography>
        </Box>
    );
}
