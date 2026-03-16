/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Typography, useTheme } from "@mui/material";
import ReactECharts from "echarts-for-react";
import type { GlobalIndicator } from "models/indicateurs";
import { QUALITE_COLORS, ORDERED_QUALITE } from "constantes/couleurs";
import { DEVOPS_HEADERS } from "constantes/constantes-headers";

// Constantes pour les niveaux de fraîcheur MEP
const MEP_LEVELS = [
    { min: 0, max: 30, label: "0-30 jours", color: "#388e3c" },
    { min: 31, max: 60, label: "31-60 jours", color: "#8bc34a" },
    { min: 61, max: 90, label: "61-90 jours", color: "#ffee58" },
    { min: 91, max: 180, label: "91-180 jours", color: "#ffa726" },
    { min: 181, max: 1000, label: ">180 jours", color: "#e53935" }
];

const DEVOPS_ASPECTS = [
    { name: "Contributeurs", key: "lettreContributorCount" },
    { name: "Déploiements", key: "lettreDeploymentCount" },
    { name: "Distance", key: "lettreDistanceCount" },
    { name: "DevOps global", key: "lettreDevopsGenerale" }
];

interface DevopsMEPChartProps {
    data: GlobalIndicator[];
}

export function DevopsMEPChart({ data }: Readonly<DevopsMEPChartProps>) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    // Filtrer les applications avec données de distance
    const appsWithDistance = data.filter(
        app =>
            app.distanceCount !== "NR" && app.distanceCount !== undefined && app.distanceCount !== "SO"
    );

    // Compter par niveau de fraîcheur MEP
    const countByLevel = MEP_LEVELS.map(level => {
        return appsWithDistance.filter(app => {
            const distance = Number.parseFloat(app.distanceCount ?? "0");
            return distance >= level.min && distance < level.max;
        }).length;
    });

    const totalApps = data.length;
    const appsWithData = appsWithDistance.length;

    // Si aucune donnée valide, afficher un message
    if (appsWithData === 0) {
        return (
            <Box p={4} textAlign="center">
                <Typography variant="body1" color="text.secondary">
                    Aucune donnée de fraîcheur MEP disponible
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h3" gutterBottom textAlign="center" color="text.primary">
                {DEVOPS_HEADERS.NIVEAU_FRAICHEUR_MEP}
            </Typography>
            <ReactECharts
                option={{
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
                        },
                        formatter: (params: any) => {
                            const levelIndex = params[0].dataIndex;
                            const level = MEP_LEVELS[levelIndex];
                            const count = countByLevel[levelIndex];
                            const percentage =
                                totalApps > 0 ? ((count / totalApps) * 100).toFixed(1) : "0";
                            return `
                                <strong>${level.label}</strong><br/>
                                Applications: ${count}<br/>
                                Pourcentage: ${percentage}%
                            `;
                        }
                    },
                    grid: {
                        left: "3%",
                        right: "4%",
                        bottom: "15%",
                        top: "15%",
                        containLabel: true
                    },
                    xAxis: {
                        type: "category",
                        data: MEP_LEVELS.map(level => level.label),
                        axisLabel: {
                            color: isDark ? "#ccc" : "#666",
                            fontSize: 11,
                            rotate: 45
                        },
                        axisLine: {
                            lineStyle: {
                                color: isDark ? "#555" : "#ddd"
                            }
                        }
                    },
                    yAxis: {
                        type: "value",
                        name: "Nombre d'applications",
                        axisLabel: {
                            color: isDark ? "#ccc" : "#666"
                        },
                        splitLine: {
                            lineStyle: {
                                color: isDark ? "#444" : "#eee"
                            }
                        }
                    },
                    series: [
                        {
                            name: "Applications",
                            type: "bar",
                            data: countByLevel.map((count, index) => ({
                                value: count,
                                itemStyle: {
                                    color: MEP_LEVELS[index].color
                                }
                            })),
                            emphasis: {
                                focus: "series"
                            },
                            label: {
                                show: true,
                                position: "top",
                                formatter: (params: any) => {
                                    const percentage =
                                        totalApps > 0
                                            ? ((params.value / totalApps) * 100).toFixed(1)
                                            : "0";
                                    return `${params.value} (${percentage}%)`;
                                },
                                color: isDark ? "#fff" : "#333",
                                fontWeight: "bold"
                            }
                        }
                    ],
                    graphic: {
                        type: "text",
                        left: "center",
                        bottom: "5%",
                        style: {
                            text: `Total: ${totalApps} applications | Avec données: ${appsWithData} (${totalApps > 0 ? ((appsWithData / totalApps) * 100).toFixed(1) : "0"}%)`,
                            fontSize: 11,
                            fill: isDark ? "#ccc" : "#666",
                            fontWeight: "bold"
                        }
                    }
                }}
                style={{ height: "350px", width: "100%" }}
                opts={{ renderer: "svg" }}
            />
        </Box>
    );
}

interface DevopsDeploymentChartProps {
    data: GlobalIndicator[];
}

export function DevopsDeploymentChart({ data }: Readonly<DevopsDeploymentChartProps>) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    // Filtrer les applications avec données de déploiement
    const appsWithDeployment = data.filter(
        app =>
            app.nbDeploymentCount !== "NR" &&
            app.nbDeploymentCount !== undefined &&
            app.distanceCount !== "NR" &&
            app.distanceCount !== "SO" &&
            app.applicationName !== undefined
    );

    // Préparer les données pour le scatter plot
    const scatterData = appsWithDeployment.map(app => ({
        name: app.applicationName ?? "Inconnu",
        deployments: Number.parseFloat(app.nbDeploymentCount ?? "0") ?? 0,
        distance: Number.parseFloat(app.distanceCount ?? "0") ?? 0,
        lettre: app.lettreDeploymentCount ?? "NR"
    }));

    // Si aucune donnée valide, afficher un message
    if (scatterData.length === 0) {
        return (
            <Box p={4} textAlign="center">
                <Typography variant="body1" color="text.secondary">
                    Aucune donnée de déploiement disponible
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h3" gutterBottom textAlign="center" color="text.primary">
                Nombre de déploiements vs Fraîcheur MEP
            </Typography>
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
                            const item = scatterData[params.dataIndex];
                            if (!item) return "Données non disponibles";
                            return `
                                <strong>${item.name}</strong><br/>
                                Déploiements: ${item.deployments}<br/>
                                Distance: ${item.distance} jours<br/>
                                Note: ${item.lettre}
                            `;
                        }
                    },
                    grid: {
                        left: "10%",
                        right: "8%",
                        bottom: "12%",
                        top: "12%",
                        containLabel: true
                    },
                    xAxis: {
                        type: "value",
                        name: "Distance (jours)",
                        nameLocation: "middle",
                        nameGap: 30,
                        min: 0,
                        axisLabel: {
                            color: isDark ? "#ccc" : "#666"
                        },
                        axisLine: {
                            lineStyle: {
                                color: isDark ? "#555" : "#ddd"
                            }
                        },
                        splitLine: {
                            lineStyle: {
                                color: isDark ? "#444" : "#eee"
                            }
                        }
                    },
                    yAxis: {
                        type: "value",
                        name: "Nombre de déploiements",
                        nameLocation: "middle",
                        nameGap: 50,
                        axisLabel: {
                            color: isDark ? "#ccc" : "#666"
                        },
                        axisLine: {
                            lineStyle: {
                                color: isDark ? "#555" : "#ddd"
                            }
                        },
                        splitLine: {
                            lineStyle: {
                                color: isDark ? "#444" : "#eee"
                            }
                        }
                    },
                    series: [
                        {
                            name: "Applications",
                            type: "scatter",
                            data: scatterData.map(item => [item.distance, item.deployments]),
                            symbolSize: 12,
                            itemStyle: {
                                color: (params: any) => {
                                    const item = scatterData[params.dataIndex];
                                    const lettre = item?.lettre ?? "NR";
                                    return QUALITE_COLORS[lettre] ?? QUALITE_COLORS.NR;
                                },
                                opacity: 0.8
                            },
                            emphasis: {
                                itemStyle: {
                                    opacity: 1,
                                    borderColor: theme.palette.primary.light,
                                    borderWidth: 2
                                }
                            }
                        }
                    ]
                }}
                style={{ height: "400px", width: "100%" }}
                opts={{ renderer: "canvas" }}
            />
        </Box>
    );
}

interface DevopsContributorChartProps {
    data: GlobalIndicator[];
}

export function DevopsContributorChart({ data }: Readonly<DevopsContributorChartProps>) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    // Compter par lettre de contributeurs
    const countByLetter = data.reduce(
        (acc, app) => {
            const letter = app.lettreContributorCount ?? "NR";
            acc[letter] = (acc[letter] ?? 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    const chartData = ORDERED_QUALITE.filter(letter => countByLetter[letter] !== undefined).map(
        letter => ({
            name: letter === "NR" ? "Non renseigné" : `Note ${letter}`,
            value: countByLetter[letter],
            color: QUALITE_COLORS[letter]
        })
    );

    // Si aucune donnée valide, afficher un message
    if (chartData.length === 0) {
        return (
            <Box p={4} textAlign="center">
                <Typography variant="body1" color="text.secondary">
                    Aucune donnée de contributeurs disponible
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h3" gutterBottom textAlign="center" color="text.primary">
                {DEVOPS_HEADERS.CONTRIBUTEUR}
            </Typography>
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
                            radius: ["40%", "70%"],
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
                style={{ height: "300px", width: "100%" }}
                opts={{ renderer: "svg" }}
            />
        </Box>
    );
}

interface DevopsRadarChartProps {
    data: GlobalIndicator[];
}

export function DevopsRadarChart({ data }: Readonly<DevopsRadarChartProps>) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    // Calculer les moyennes pour chaque aspect DevOps
    const calculateLetterScore = (letter: string | undefined): number => {
        if (!letter) return 0;
        const scores: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, E: 1, NR: 0 };
        return scores[letter] ?? 0;
    };

    const aspectData = DEVOPS_ASPECTS.map(aspect => {
        const validApps = data.filter(
            app =>
                app[aspect.key as keyof GlobalIndicator] &&
                app[aspect.key as keyof GlobalIndicator] !== "NR"
        );
        const avgScore =
            validApps.length > 0
                ? validApps.reduce(
                      (sum, app) =>
                          sum + calculateLetterScore(app[aspect.key as keyof GlobalIndicator] as string),
                      0
                  ) / validApps.length
                : 0;
        return {
            name: aspect.name,
            value: (avgScore * 20).toFixed(1) // Convertir en pourcentage
        };
    });

    const indicatorData = aspectData.map(item => ({ name: item.name, max: 100 }));

    // Si aucune donnée valide, afficher un message
    const hasValidData = aspectData.some(item => Number.parseFloat(item.value) > 0);
    if (!hasValidData) {
        return (
            <Box p={4} textAlign="center">
                <Typography variant="body1" color="text.secondary">
                    Aucune donnée DevOps disponible
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h3" gutterBottom textAlign="center" color="text.primary">
                Indicateurs DevOps
            </Typography>
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
                    radar: {
                        indicator: indicatorData,
                        radius: "65%",
                        center: ["50%", "50%"],
                        name: {
                            textStyle: {
                                color: isDark ? "#fff" : "#000",
                                fontSize: 12
                            }
                        },
                        splitLine: {
                            lineStyle: {
                                color: isDark ? "#444" : "#ddd"
                            }
                        },
                        splitArea: {
                            areaStyle: {
                                color: [isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)"]
                            }
                        },
                        axisLine: {
                            lineStyle: {
                                color: isDark ? "#555" : "#ccc"
                            }
                        }
                    },
                    series: [
                        {
                            type: "radar",
                            data: [
                                {
                                    value: aspectData.map(item => Number.parseFloat(item.value)),
                                    name: "DevOps moyen",
                                    areaStyle: {
                                        color: theme.palette.primary.main,
                                        opacity: 0.3
                                    },
                                    lineStyle: {
                                        color: theme.palette.primary.main,
                                        width: 2
                                    },
                                    symbol: "circle",
                                    symbolSize: 6,
                                    itemStyle: {
                                        color: theme.palette.primary.main
                                    }
                                }
                            ]
                        }
                    ]
                }}
                style={{ height: "350px", width: "100%" }}
                opts={{ renderer: "svg" }}
            />
        </Box>
    );
}
