import { useMemo } from "react";
import { alpha, Box, Chip, Divider, LinearProgress, Stack, Typography } from "@mui/material";
import { green, grey, red } from "@mui/material/colors";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import GroupsIcon from "@mui/icons-material/Groups";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

import type { IndicateurApplicationMaturite } from "models/indicateurs";
import { ToolTipLayout } from "pages/ToolTipLayout";

import { clamp01, getScoreColor, formatNum, maturiteLevel, maturiteLabel } from "./maturite-config";
import type { ApplicationTip } from "todos-api/client.gen";

interface MaturiteProps {
    selectedApp: IndicateurApplicationMaturite | null;
    tipsItemsTech?: ApplicationTip[];
    tipsItemsOrga?: ApplicationTip[];
}

interface NormalizedMaturite {
    scoreTechnique: number;
    scoreOrga: number;
    scoreComplexite: number;
    scoreBenefice: number;
    progressionDeploy: number;
    progressionArchi: number;
    progressionTechnos: number;
    progressionCloud: number;
    progressionDevops: number;
    progressionMateqip: number;
    maturite: string | null;
    robustesse: string;
}

interface TipsBlockProps {
    title: string;
    items: ApplicationTip[];
    loading?: boolean;
    error?: string | null;
}

function useNormalizedMaturite(selectedApp: IndicateurApplicationMaturite | null): NormalizedMaturite {
    return useMemo(() => {
        if (!selectedApp) {
            return {
                scoreTechnique: 0,
                scoreOrga: 0,
                scoreComplexite: 0,
                scoreBenefice: 0,
                progressionDeploy: 0,
                progressionArchi: 0,
                progressionTechnos: 0,
                progressionCloud: 0,
                progressionDevops: 0,
                progressionMateqip: 0,
                maturite: null,
                robustesse: "0"
            };
        }

        return {
            scoreTechnique: formatNum(selectedApp.scoreTechnique, 0),
            scoreOrga: formatNum(selectedApp.scoreOrga, 0),
            scoreComplexite: formatNum(selectedApp.scoreComplexite, 0),
            scoreBenefice: formatNum(selectedApp.scoreBenefice, 0),
            progressionDeploy: clamp01(formatNum(selectedApp.progressionDeploy, 0)),
            progressionArchi: clamp01(formatNum(selectedApp.progressionArchi, 0)),
            progressionTechnos: clamp01(formatNum(selectedApp.progressionTechnos, 0)),
            progressionCloud: clamp01(formatNum(selectedApp.progressionCloud, 0)),
            progressionDevops: clamp01(formatNum(selectedApp.progressionDevops, 0)),
            progressionMateqip: clamp01(formatNum(selectedApp.progressionMateqip, 0)),
            maturite: selectedApp.maturite ?? null,
            robustesse: selectedApp.robustesse ?? "0"
        };
    }, [selectedApp]);
}

function ScoreBox({ value }: Readonly<{ value: number }>) {
    return (
        <Box
            sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                fontWeight: 700,
                color: "black",
                minWidth: 64,
                textAlign: "center",
                boxShadow: t => `0 0 0 2px ${alpha(t.palette.common.black, 0.04)} inset`
            }}
        >
            {value.toFixed(2)}
        </Box>
    );
}

function LabeledValue({
    icon,
    label,
    value
}: Readonly<{
    icon: React.ReactNode;
    label: string;
    value: number;
}>) {
    return (
        <Stack spacing={1} alignItems="center" sx={{ minWidth: 160 }}>
            <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography variant="body2" fontWeight={600}>
                    {label}
                </Typography>
                {icon}
            </Stack>
            <ScoreBox value={value} />
        </Stack>
    );
}

function HorizontalBars({
    items
}: Readonly<{
    items: { label: string; value: number }[];
}>) {
    return (
        <Stack spacing={1}>
            {items.map((item, idx) => {
                const pct = clamp01(item.value) * 100;
                const color = getScoreColor(item.value);

                return (
                    <Stack key={`${item.label}-${idx}`} spacing={0.5}>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                {item.label}
                            </Typography>
                            <Typography variant="caption" fontWeight={700}>
                                {Math.round(pct)}%
                            </Typography>
                        </Stack>

                        <Box
                            sx={{
                                height: 10,
                                borderRadius: 999,
                                bgcolor: alpha(grey[500], 0.25),
                                overflow: "hidden"
                            }}
                        >
                            <Box sx={{ width: `${pct}%`, height: "100%", bgcolor: color }} />
                        </Box>
                    </Stack>
                );
            })}
        </Stack>
    );
}

function MaturiteSection({
    icon,
    title,
    score,
    bars,
    titletips,
    tipsItems
}: Readonly<{
    icon: React.ReactNode;
    title: string;
    score: number;
    bars: { label: string; value: number }[];
    titletips: string;
    tipsItems: ApplicationTip[];
}>) {
    return (
        <Stack spacing={1.5} sx={{ flex: 1, minWidth: 260 }}>
            <LabeledValue icon={icon} label={title} value={score} />
            <HorizontalBars items={bars} />
            <Box sx={{ mt: 2 }}>
                <TipsBlock title={titletips} items={tipsItems} />
            </Box>
        </Stack>
    );
}

export function MaturiteHeader({ selectedApp }: Readonly<MaturiteProps>) {
    const level = maturiteLevel(selectedApp?.maturite);
    const label = maturiteLabel(selectedApp?.maturite);

    return (
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip
                icon={level === "forte" ? <CheckCircleIcon /> : <CancelIcon />}
                label={`Maturité cloud ${label}`}
                color={level === "forte" ? "success" : "error"}
                variant="outlined"
                size="small"
            />
            <Chip
                label={`Robustesse ${selectedApp?.robustesse ?? "0"}/4`}
                size="small"
                sx={{ bgcolor: alpha(green[600], 0.12) }}
            />
        </Stack>
    );
}

export function TechAndOrga({ selectedApp, tipsItemsTech, tipsItemsOrga }: Readonly<MaturiteProps>) {
    const m = useNormalizedMaturite(selectedApp);

    return (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={3} justifyContent="space-around">
            <MaturiteSection
                icon={<PrecisionManufacturingIcon />}
                title="Maturité technique"
                score={m.scoreTechnique}
                bars={[
                    { label: "Pratiques de développement", value: m.progressionDeploy },
                    { label: "Architectures compatibles", value: m.progressionArchi },
                    { label: "Technologies compatibles", value: m.progressionTechnos }
                ]}
                titletips="Conseils techniques"
                tipsItems={tipsItemsTech ?? []}
            />

            <MaturiteSection
                icon={<GroupsIcon />}
                title="Maturité organisationnelle"
                score={m.scoreOrga}
                bars={[
                    { label: "Pratiques des technologies du cloud", value: m.progressionCloud },
                    { label: "Pratiques DevOps", value: m.progressionDevops },
                    { label: "Maturité d'équipe", value: m.progressionMateqip }
                ]}
                titletips="Conseils organisationnels"
                tipsItems={tipsItemsOrga ?? []}
            />
        </Stack>
    );
}

export function ComplexitySection({ selectedApp }: Readonly<MaturiteProps>) {
    const m = useNormalizedMaturite(selectedApp);

    return (
        <Stack spacing={1.5} alignItems="center" mb={2}>
            <Typography variant="subtitle1" fontWeight={700}>
                Balance risques / opportunités
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center">
                <ToolTipLayout
                    title="Complexité attendue (entre -1 et 0)"
                    content={<ScoreBox value={m.scoreComplexite} />}
                />

                <Divider flexItem orientation="vertical" />

                <ToolTipLayout
                    title="Bénéfice attendu (entre 0 et 1)"
                    content={<ScoreBox value={m.scoreBenefice} />}
                />
            </Stack>
        </Stack>
    );
}

export function ConseilComplexity({
    conseil
}: Readonly<{
    conseil: { favorable: boolean; texte: string };
}>) {
    return (
        <Box
            sx={{
                mt: 1,
                p: 1.5,
                width: "100%",
                maxWidth: 680,
                borderRadius: 2,
                bgcolor: t => alpha(t.palette.info.main, 0.08),
                borderLeft: `4px solid ${conseil.favorable ? green[600] : red[500]}`
            }}
        >
            <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
                Conseil
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.35 }}>
                {conseil.texte}
            </Typography>
        </Box>
    );
}

function TipsBlock({ title, items, loading = false, error = null }: Readonly<TipsBlockProps>) {
    const messages = useMemo(() => {
        const texts = items.map(t => (t.conseil ?? "").trim()).filter(Boolean);

        return Array.from(new Set(texts));
    }, [items]);

    return (
        <Stack spacing={1}>
            <Typography variant="subtitle2" fontWeight={700}>
                {title}
            </Typography>

            {loading && <LinearProgress />}

            {error && (
                <Typography variant="caption" color="error">
                    {error}
                </Typography>
            )}

            {!loading && !error && messages.length === 0 && (
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Aucun conseil.
                </Typography>
            )}

            {!loading && !error && messages.length > 0 && (
                <Box
                    sx={{
                        p: 1,
                        borderRadius: 1.5,
                        bgcolor: t => alpha(t.palette.info.main, 0.06),
                        borderLeft: t => `3px solid ${alpha(t.palette.info.main, 0.6)}`
                    }}
                >
                    <Stack spacing={0.75}>
                        {messages.map(msg => (
                            <Typography key={msg} variant="body2" sx={{ lineHeight: 1.4 }}>
                                • {msg}
                            </Typography>
                        ))}
                    </Stack>
                </Box>
            )}
        </Stack>
    );
}

export function DisclaimerMaturity() {
    return (
        <Box
            sx={theme => ({
                p: { xs: 2, sm: 3, md: 4 },
                display: "flex",
                flexDirection: "column",
                borderRadius: 2,
                gap: theme.spacing(3),
                bgcolor: "#72007a",
                color: "common.white",
                width: "100%",
                maxWidth: 900,
                mx: "auto"
            })}
        >
            <Stack direction="row" alignItems="flex-start" spacing={2} justifyContent="space-between">
                <Box sx={{ pr: 1 }}>
                    <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.4 }}>
                        Ces indicateurs et les conseils associés sont basés sur un questionnaire
                        auto-administré rempli par les équipes de développement en avril 2025. Ils
                        peuvent donc être partiellement obsolètes, ou biaisés par une éventuelle mauvaise
                        compréhension de certaines questions.
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.4 }}>
                        De plus, les indicateurs sont issus d’une analyse statistique des réponses
                        apportées à ce questionnaire, et sont donc soumis aux incertitudes propres à ce
                        type d’analyse.
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.4 }}>
                        L’IA a été utilisée de manière marginale tout au long du process. Aucune donnée
                        relative aux applications de l’Insee ne lui a été soumise.
                    </Typography>
                    <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                        Ces informations ont vocation à être mises à jour à un rythme semestriel.
                    </Typography>
                </Box>

                <WarningAmberRoundedIcon
                    sx={{ fontSize: 64, flexShrink: 0, color: "warning.main" }}
                    titleAccess="Avertissement"
                />
            </Stack>
        </Box>
    );
}
