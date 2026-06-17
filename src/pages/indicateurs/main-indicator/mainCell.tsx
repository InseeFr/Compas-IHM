import type { GlobalIndicator } from "models/indicateurs";
import { ToolTipLayout } from "components/ToolTipLayout";
import type { ReactNode } from "react";
import { isDateOlderThan31Days } from "utils/date-functions";
import { getMeteoIcon } from "utils/meteoIcon";
import ErrorIcon from "@mui/icons-material/Error";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";

export const QualityCell = ({ row }: Readonly<{ row: { original: GlobalIndicator } }>) => {
    const detteTechniqueJours = Math.round(Number.parseFloat(row.original.detteTechnique ?? "0") / 420);
    const joursLabel = detteTechniqueJours <= 1 ? "jour" : "jours";

    return (
        <ToolTipLayout
            title={`Couverture de test: ${row.original.lettreCouvertureTestUnitaire} (
                    ${row.original.pourcentageCouvertureTestUniaire}) 
                    Fiabilité: ${row.original.lettreFiabilite} 
                    Dette technique: ${row.original.lettreDetteTechnique} (${detteTechniqueJours} 
                    ${joursLabel})`}
            content={<span>{row.original.lettreQualiteGenerale}</span>}
        />
    );
};

export const SecurityCell = ({ row }: Readonly<{ row: { original: GlobalIndicator } }>) => {
    return (
        <ToolTipLayout
            title={`Cve critique : ${row.original.nbCveCritical === "NR" ? "NR" : Number(row.original.nbCveCritical)}
                Cve élevé : ${row.original.nbCveHigh === "NR" ? "NR" : Number(row.original.nbCveHigh)}
                Cve moyenne : ${row.original.nbCveMedium === "NR" ? "NR" : Number(row.original.nbCveMedium)}
                Cve faible : ${row.original.nbCveLow === "NR" ? "NR" : Number(row.original.nbCveLow)}
                Nombre de VM non mises à jour : ${row.original.nbVmNonMaj === "NR" ? "NR" : row.original.nbVmNonMaj}`}
            content={row.original.lettreGlobaleSecurite}
        />
    );
};

export const DevopsCell = ({ row }: Readonly<{ row: { original: GlobalIndicator } }>) => {
    const { lettreDistanceCount, distanceCount, lettreDevopsGenerale } = row.original;

    let tooltipLabel = "";
    if (lettreDistanceCount === "NR") {
        tooltipLabel = "Non renseigné";
    } else if (lettreDistanceCount === "SO") {
        tooltipLabel = "Sans objet";
    } else {
        tooltipLabel = `Jours depuis la dernière livraison : ${distanceCount}`;
    }
    return <ToolTipLayout title={tooltipLabel} content={lettreDevopsGenerale} />;
};

export const MeteoCell = ({ row }: Readonly<{ row: { original: GlobalIndicator } }>) => {
    const icon = getMeteoIcon(row.original.meteo);
    const isNotValidIcon: boolean =
        icon.type === QuestionMarkIcon &&
        icon.props.sx?.color === "#d46407ff" &&
        icon.props.sx?.fontSize === 20;
    const content: ReactNode = isDateOlderThan31Days(row.original.dateMeteoCommentaire) ? (
        <ErrorIcon
            sx={{ color: "#b90404ff", fontSize: 20 }}
            titleAccess="Météo vieille de plus de 31 jours"
        />
    ) : (
        icon
    );
    const getMeteoComm: string = row.original.meteoCommentaire
        ? row.original.meteoCommentaire
        : "Commentaire non renseigné";
    const commentary: string = isNotValidIcon ? "Valeur météo erronée" : getMeteoComm;
    return (
        <ToolTipLayout
            title={
                isDateOlderThan31Days(row.original.dateMeteoCommentaire)
                    ? "Météo vieille de plus de 31 jours"
                    : commentary
            }
            content={content}
        />
    );
};

export const GreenItCell = ({ row }: Readonly<{ row: { original: GlobalIndicator } }>) => {
    return (
        <ToolTipLayout
            title={`Gaspillage : ${row.original.gaspillage} 
                    Consommation : ${row.original.consoNormalized} 
                    Impact : ${row.original.impactNormalized}`}
            content={row.original.lettreGreen}
        />
    );
};

export const A11yCell = ({ row }: Readonly<{ row: { original: GlobalIndicator } }>) => {
    const { lettreA11y, scoreAuditA11y, declarationA11y, dateDeclarationA11y, isModule } = row.original;

    let displayedLetter = lettreA11y;

    if (isModule) {
        const threeYearsAgo = new Date();
        threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

        const hasDeclaration = !!declarationA11y;
        const dateDecl = dateDeclarationA11y ? new Date(dateDeclarationA11y) : null;
        const declarationTooOld = !!dateDecl && dateDecl < threeYearsAgo;

        // Règle métier : pas de déclaration ou date > 3 ans => H
        if (!hasDeclaration || declarationTooOld) {
            displayedLetter = "H";
        }
    }

    const showPercent = displayedLetter !== "NR";

    return (
        <ToolTipLayout
            title={showPercent ? `Score audit : ${scoreAuditA11y}%` : "Score non renseigné"}
            content={<span>{lettreA11y}</span>}
        />
    );
};

export const MaturityCell = ({ row }: Readonly<{ row: { original: GlobalIndicator } }>) => {
    const { maturite } = row.original;

    const maturiteLabels: Record<string, string> = {
        A: "Maturité forte",
        B: "Maturité assez forte",
        C: "Maturité moyenne",
        D: "Maturité faible"
    };

    const tooltipText =
        (maturite ? maturiteLabels[maturite] : undefined) ?? `Maturité inconnue (${maturite ?? "NR"})`;

    return <ToolTipLayout title={tooltipText} content={<span>{maturite}</span>} />;
};
