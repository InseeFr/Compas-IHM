import type { StrategieCloudIndicateur } from "models/indicateurs";
import { ToolTipLayout } from "components/ToolTipLayout";

function envTooltip(value: string): string {
    if (value === "NR") return "Non renseigné";
    if (value === "SO") return "Sans objet";
    if (value === "VM") return "Machine Virtuelle";
    if (value === "Kube") return "Kubernetes";
    if (value === "Autre") return "Autre environnement";
    return value;
}

export function TauxCloudCell({ row }: Readonly<{ row: { original: StrategieCloudIndicateur } }>) {
    const { tauxCloud } = row.original;
    let tooltip: string;
    if (tauxCloud === "NR") tooltip = "Non renseigné";
    else if (tauxCloud === "SO") tooltip = "Sans objet";
    else tooltip = `Taux cloud : ${tauxCloud}`;
    return <ToolTipLayout title={tooltip} content={tauxCloud} />;
}

export function EnvActuelCell({ row }: Readonly<{ row: { original: StrategieCloudIndicateur } }>) {
    const { envActuelProd } = row.original;
    return <ToolTipLayout title={envTooltip(envActuelProd)} content={envActuelProd} />;
}

export function EnvCibleCell({ row }: Readonly<{ row: { original: StrategieCloudIndicateur } }>) {
    const { envCibleProd } = row.original;
    return <ToolTipLayout title={envTooltip(envCibleProd)} content={envCibleProd} />;
}

export function EcartCibleCell({ row }: Readonly<{ row: { original: StrategieCloudIndicateur } }>) {
    const { ecartCible } = row.original;
    let tooltip: string;
    if (ecartCible === "NR") tooltip = "Non renseigné";
    else if (ecartCible === "SO") tooltip = "Sans objet";
    else if (ecartCible === "oui") tooltip = "Écart détecté entre l'environnement actuel et la cible";
    else if (ecartCible === "non") tooltip = "Aucun écart entre l'environnement actuel et la cible";
    else tooltip = ecartCible;
    return <ToolTipLayout title={tooltip} content={ecartCible} />;
}

export function StrategieCloudCell({ row }: Readonly<{ row: { original: StrategieCloudIndicateur } }>) {
    const { stratCloud } = row.original;
    let tooltip: string;
    if (stratCloud === "NR") tooltip = "Non renseigné";
    else if (stratCloud === "SO") tooltip = "Sans objet";
    else tooltip = stratCloud;
    return <ToolTipLayout title={tooltip} content={stratCloud} />;
}

export function CommentaireCell({ row }: Readonly<{ row: { original: StrategieCloudIndicateur } }>) {
    const { commentaire } = row.original;
    if (commentaire === "NR") return <ToolTipLayout title="Non renseigné" content={commentaire} />;
    if (commentaire === "SO") return <ToolTipLayout title="Sans objet" content={commentaire} />;
    return <ToolTipLayout title={commentaire} content={commentaire} />;
}

export function MaturiteCloudCell({ row }: Readonly<{ row: { original: StrategieCloudIndicateur } }>) {
    const { maturiteCloud } = row.original;
    let tooltip: string;
    if (maturiteCloud === "NR") tooltip = "Non renseigné";
    else if (maturiteCloud === "SO") tooltip = "Sans objet";
    else tooltip = `Maturité Cloud : ${maturiteCloud}`;
    return <ToolTipLayout title={tooltip} content={maturiteCloud} />;
}
