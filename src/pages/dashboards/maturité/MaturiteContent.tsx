import { alpha, Box, Chip, Stack, Typography, useTheme } from "@mui/material";
import { green, red } from "@mui/material/colors";
import type { ReactNode } from "react";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import GroupsIcon from "@mui/icons-material/Groups";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import type { IndicateurApplicationMaturite } from "models/indicateurs";
import {
    type Classement,
    type Conseil,
    type Tendance,
    computeConseil,
    fmtBenefice,
    fmtComplexite,
    getClassement,
    getScoreColor,
    getTendance,
    normalizeMaturite,
    toPct
} from "./maturite-config";

/* -------------------------------------------------------------------------- */
/*  Briques réutilisables                                                     */
/* -------------------------------------------------------------------------- */

function ScorePill({
    text,
    color,
    minWidth = 72
}: Readonly<{ text: string; color: string; minWidth?: number }>) {
    const theme = useTheme();

    return (
        <Box
            component="span"
            sx={{
                display: "inline-block",
                px: 1.5,
                py: 0.5,
                borderRadius: 1.5,
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
                textAlign: "center",
                minWidth,
                bgcolor: color,
                color: theme.palette.getContrastText(color)
            }}
        >
            {text}
        </Box>
    );
}

function TrendArrow({ tendance }: Readonly<{ tendance: Tendance }>) {
    const theme = useTheme();

    const map = {
        hausse: {
            Icon: TrendingUpIcon,
            color: theme.palette.success.main,
            title: "Tendance à la hausse"
        },
        stable: {
            Icon: TrendingFlatIcon,
            color: theme.palette.text.secondary,
            title: "Tendance stable"
        },
        baisse: {
            Icon: TrendingDownIcon,
            color: theme.palette.error.main,
            title: "Tendance à la baisse"
        }
    } as const;

    const { Icon, color, title } = map[tendance];
    return <Icon sx={{ color, fontSize: 28 }} titleAccess={title} />;
}

function ClassementChip({
    prefix,
    classement
}: Readonly<{ prefix: string; classement: Classement }>) {
    return (
        <Chip
            icon={classement.positive ? <CheckCircleIcon /> : <CancelIcon />}
            label={`${prefix} ${classement.label}`}
            color={classement.positive ? "success" : "error"}
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600 }}
        />
    );
}

function DefinitionHint({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <Stack direction="row" spacing={0.5} alignItems="flex-start" sx={{ maxWidth: 320 }}>
            <HelpOutlineIcon fontSize="small" sx={{ mt: "2px", opacity: 0.7 }} />
            <Typography variant="caption" sx={{ lineHeight: 1.3, opacity: 0.85 }}>
                {children}
            </Typography>
        </Stack>
    );
}

function ScoreHeadline({
    prefix,
    score,
    delta,
    definition
}: Readonly<{
    prefix: string;
    score: number;
    delta: number;
    definition: ReactNode;
}>) {
    const classement = getClassement(score);
    const tendance = getTendance(delta);

    return (
        <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
            flexWrap="wrap"
        >
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                <ClassementChip prefix={prefix} classement={classement} />
                <Typography
                    variant="h5"
                    fontWeight={800}
                    sx={{ fontVariantNumeric: "tabular-nums" }}
                >
                    {toPct(score)}
                </Typography>
                <TrendArrow tendance={tendance} />
            </Stack>
            <DefinitionHint>{definition}</DefinitionHint>
        </Stack>
    );
}

function SubScore({
    icon,
    label,
    score
}: Readonly<{ icon: ReactNode; label: string; score: number }>) {
    return (
        <Stack spacing={1} alignItems="center">
            <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography variant="body2" fontWeight={600}>
                    {label}
                </Typography>
                {icon}
            </Stack>
            <ScorePill text={toPct(score)} color={getScoreColor(score)} minWidth={80} />
        </Stack>
    );
}

function ConseilBox({ conseil }: Readonly<{ conseil: Conseil }>) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const favorableShade = isDark ? 400 : 600;
    const defavorableShade = isDark ? 400 : 500;
    const borderColor = conseil.favorable ? green[favorableShade] : red[defavorableShade];

    return (
        <Box
            sx={{
                mt: 1,
                p: 1.5,
                width: "100%",
                maxWidth: 680,
                mx: "auto",
                borderRadius: 2,
                bgcolor: t =>
                    alpha(isDark ? t.palette.info.light : t.palette.info.main, isDark ? 0.15 : 0.08),
                borderLeft: `4px solid ${borderColor}`
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

/* -------------------------------------------------------------------------- */
/*  Blocs principaux                                                          */
/* -------------------------------------------------------------------------- */

export function OpportuniteBlock({
    selectedApp
}: Readonly<{ selectedApp: IndicateurApplicationMaturite | null }>) {
    if (!selectedApp) return null;

    const m = normalizeMaturite(selectedApp);
    const conseil = computeConseil(m.scoreMaturite, m.benefice, m.complexite);

    return (
        <Stack spacing={2}>
            <ScoreHeadline
                prefix="Opportunité"
                score={m.scoreOpportunite}
                delta={m.deltaOpportunite}
                definition="Le score d’opportunité quantifie l’intérêt qu’il peut y avoir pour cette application à aller sur le Cloud."
            />

            <Stack spacing={1} alignItems="center">
                <Typography variant="subtitle1" fontWeight={700}>
                    Balance complexité / bénéfices
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                    <ScorePill
                        text={fmtComplexite(m.complexite)}
                        color={getScoreColor(m.complexite, "complexite")}
                    />
                    <ScorePill text={fmtBenefice(m.benefice)} color={getScoreColor(m.benefice)} />
                </Stack>
            </Stack>

            <ConseilBox conseil={conseil} />
        </Stack>
    );
}

export function MaturiteBlock({
    selectedApp
}: Readonly<{ selectedApp: IndicateurApplicationMaturite | null }>) {
    if (!selectedApp) return null;

    const m = normalizeMaturite(selectedApp);

    return (
        <Stack spacing={2}>
            <ScoreHeadline
                prefix="Maturité cloud"
                score={m.scoreMaturite}
                delta={m.deltaMaturite}
                definition="Le score de maturité quantifie la facilité avec laquelle on pourrait conduire un chantier de migration vers le Cloud pour cette application."
            />

            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={4}
                justifyContent="space-around"
                alignItems="center"
            >
                <SubScore
                    icon={<PrecisionManufacturingIcon />}
                    label="Maturité technique"
                    score={m.scoreTechnique}
                />
                <SubScore
                    icon={<GroupsIcon />}
                    label="Maturité organisationnelle"
                    score={m.scoreOrga}
                />
            </Stack>
        </Stack>
    );
}

export function DisclaimerMaturity() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    return (
        <Box
            sx={{
                mt: 3,
                p: { xs: 2, sm: 3, md: 4 },
                display: "flex",
                gap: 3,
                alignItems: "flex-start",
                justifyContent: "space-between",
                borderRadius: 2,
                bgcolor: isDark ? "#4a0051" : "#72007a",
                color: "common.white",
                width: "100%",
                maxWidth: 900,
                mx: "auto"
            }}
        >
            <Typography variant="body2" sx={{ lineHeight: 1.5, pr: 1 }}>
                Ces indicateurs sont basés sur un questionnaire auto-administré rempli par les
                équipes de développement en février 2026. Ils peuvent donc être partiellement
                obsolètes, ou biaisés par une éventuelle mauvaise compréhension de certaines
                questions.
            </Typography>

            <WarningAmberRoundedIcon
                sx={{ fontSize: 64, flexShrink: 0, color: "warning.main" }}
                titleAccess="Avertissement"
            />
        </Box>
    );
}