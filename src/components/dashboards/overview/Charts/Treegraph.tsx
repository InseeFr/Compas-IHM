/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import { useTheme } from "@mui/material";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

type Row = {
    applicationName: string;
    sndi?: string;
    nbCveCritical?: string;
};

interface TreeGraphCveCritiquesProps {
    data: Row[];
    maxAppsPerSndi?: number;
    height?: number | string;
}

const ALLOWED_SNDI = ["SNDI Paris", "SNDI Nantes", "SNDI Lille", "SNDI Orléans", "SNSSI"];

function toInt(v: unknown): number {
    if (v === null || v === undefined) return 0;
    const n = parseInt(String(v), 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
}

const TreeGraphCveCritiques: React.FC<TreeGraphCveCritiquesProps> = ({
    data,
    maxAppsPerSndi = 30,
    height = "80vh"
}) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const treeData = useMemo(() => {
        // 1) Agrégation par SNDI puis par Application
        const sndiMap = new Map<string, { total: number; apps: Map<string, number> }>();

        for (const row of data) {
            const sndi = row.sndi?.trim() || "NR";
            const app = row.applicationName?.trim() || "NR";
            const crit = toInt(row.nbCveCritical);

            if (!sndiMap.has(sndi)) {
                sndiMap.set(sndi, { total: 0, apps: new Map() });
            }
            const agg = sndiMap.get(sndi)!;
            agg.total += crit;
            agg.apps.set(app, (agg.apps.get(app) ?? 0) + crit);
        }

        // 2) Sélection des SNDI
        let chosen = [...sndiMap.entries()].filter(([sndi]) => ALLOWED_SNDI.includes(sndi));

        if (chosen.length === 0) {
            chosen = [...sndiMap.entries()].sort((a, b) => b[1].total - a[1].total).slice(0, 5);
        } else {
            chosen.sort((a, b) => {
                const idxA = ALLOWED_SNDI.indexOf(a[0]);
                const idxB = ALLOWED_SNDI.indexOf(b[0]);
                if (idxA !== idxB) return idxA - idxB;
                return b[1].total - a[1].total;
            });
        }

        const grandTotal = [...sndiMap.values()].reduce((acc, v) => acc + v.total, 0);
        const isSingleSndi = chosen.length === 1;

        const children = chosen.map(([sndi, agg]) => {
            let appsToShow = [...agg.apps.entries()]
                .filter(([, crit]) => crit > 0)
                .sort((a, b) => b[1] - a[1]);

            if (!isSingleSndi) {
                appsToShow = appsToShow.filter(([, crit]) => crit > 0);
            }

            appsToShow = appsToShow.slice(0, maxAppsPerSndi);

            return {
                name: `${sndi} (${agg.total})`,
                value: agg.total,
                children: appsToShow.map(([appName, crit]) => ({
                    name: `${appName} (${crit})`,
                    value: crit
                }))
            };
        });

        return {
            name: `CVE critiques (Total: ${grandTotal})`,
            value: grandTotal,
            children
        };
    }, [data, maxAppsPerSndi]);

    const option: EChartsOption = useMemo(
        () => ({
            backgroundColor: "transparent",
            tooltip: {
                trigger: "item",
                triggerOn: "mousemove",
                backgroundColor: isDark ? "#1d1d1d" : "#fff",
                borderColor: isDark ? "#444" : "#ddd",
                textStyle: {
                    color: isDark ? "#fff" : "#000"
                },
                formatter: (params: any) => params.name
            },
            series: [
                {
                    type: "tree",
                    data: [treeData],
                    top: "5%",
                    bottom: "5%",
                    left: "10%",
                    right: "20%",
                    layout: "orthogonal",
                    orient: "LR",
                    symbol: "rect",
                    symbolSize: 8,
                    initialTreeDepth: 2,
                    expandAndCollapse: true,
                    animationDuration: 550,
                    animationDurationUpdate: 750,
                    label: {
                        position: "right",
                        verticalAlign: "middle",
                        align: "left",
                        fontSize: 12,
                        color: isDark ? "#fff" : "#000",
                        backgroundColor: "transparent"
                    },
                    leaves: {
                        label: {
                            position: "right",
                            verticalAlign: "middle",
                            align: "left"
                        }
                    },
                    emphasis: {
                        focus: "descendant"
                    },
                    itemStyle: {
                        color: theme.palette.primary.main,
                        borderColor: isDark ? "#444" : "#ccc",
                        borderWidth: 1
                    },
                    lineStyle: {
                        color: isDark ? "#555" : "#ccc",
                        width: 1.5,
                        curveness: 0.5
                    }
                }
            ]
        }),
        [treeData, isDark, theme.palette.primary.main]
    );

    return (
        <ReactECharts
            option={option}
            style={{ height: typeof height === "number" ? `${height}px` : height, width: "100%" }}
            opts={{ renderer: "canvas" }}
        />
    );
};

export default TreeGraphCveCritiques;
