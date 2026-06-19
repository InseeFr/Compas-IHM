import type { SecuriteIndicateur } from "models/indicateurs";
import { ToolTipLayout } from "components/ToolTipLayout";
import type { JSX } from "react";
import { TREND_CONFIG } from "constantes/trend.constants";
import type { Trend } from "constantes/trend.utils";

function hasValuesCveNow(indicateur: SecuriteIndicateur): boolean {
    return (
        indicateur.nbCveCritical !== "NR" &&
        indicateur.nbCveCritical?.trim() !== "" &&
        indicateur.nbCveHigh !== "NR" &&
        indicateur.nbCveHigh?.trim() !== "" &&
        indicateur.nbCveMedium !== "NR" &&
        indicateur.nbCveMedium?.trim() !== "" &&
        indicateur.nbCveLow !== "NR" &&
        indicateur.nbCveLow?.trim() !== ""
    );
}

function hasValuesCvePast(indicateur: SecuriteIndicateur): boolean {
    return (
        indicateur.nbCveCriticalPast !== "NR" &&
        indicateur.nbCveCriticalPast?.trim() !== "" &&
        indicateur.nbCveHighPast !== "NR" &&
        indicateur.nbCveHighPast?.trim() !== "" &&
        indicateur.nbCveMediumPast !== "NR" &&
        indicateur.nbCveMediumPast?.trim() !== "" &&
        indicateur.nbCveLowPast !== "NR" &&
        indicateur.nbCveLowPast?.trim() !== ""
    );
}

function isUpDownOrStableSecurite(valuePast?: number, valueNow?: number): Trend {
    if (valueNow === undefined || valuePast === undefined) {
        return "flat";
    }
    if (valueNow === valuePast) {
        return "flat";
    }
    return valueNow < valuePast ? "up" : "down";
}

export function CveCell({ row }: Readonly<{ row: { original: SecuriteIndicateur } }>): JSX.Element {
    const sumCveNow: number | undefined = hasValuesCveNow(row.original)
        ? Number(row.original.nbCveCritical) +
          Number(row.original.nbCveHigh) +
          Number(row.original.nbCveMedium) +
          Number(row.original.nbCveLow)
        : undefined;
    const sumCvePast: number | undefined = hasValuesCvePast(row.original)
        ? Number(row.original.nbCveCriticalPast) +
          Number(row.original.nbCveHighPast) +
          Number(row.original.nbCveMediumPast) +
          Number(row.original.nbCveLowPast)
        : undefined;

    const lettre = row.original.lettreNiveauCve ?? row.original.lettreCve ?? "NR";

    const tendance: Trend | undefined =
        lettre === "NR" || sumCveNow === undefined || sumCvePast === undefined
            ? undefined
            : isUpDownOrStableSecurite(sumCvePast, sumCveNow);

    const { icon: Icon, color } =
        tendance === undefined ? { icon: () => null, color: "transparent" } : TREND_CONFIG[tendance];

    return (
        <ToolTipLayout
            title={`nombre de CVE : Critique  ${row.original.nbCveCritical} (${row.original.nbCveCriticalPast}), Élevé ${row.original.nbCveHigh} (${row.original.nbCveHighPast}), Moyen ${row.original.nbCveMedium} (${row.original.nbCveMediumPast}), Faible ${row.original.nbCveLow} (${row.original.nbCveLowPast})`}
            content={
                <>
                    {lettre} <Icon sx={{ color }} />
                </>
            }
        />
    );
}

export function MajVmCell({ row }: Readonly<{ row: { original: SecuriteIndicateur } }>): JSX.Element {
    const nbVmNonMaj = row.original.nbVmNonMaj ?? "NR";
    const vmCountPast = row.original.vmCountPast ?? "NR";
    const tendance: Trend | undefined =
        nbVmNonMaj.trim() === "" ||
        nbVmNonMaj === "NR" ||
        vmCountPast.trim() === "" ||
        vmCountPast === "NR"
            ? undefined
            : isUpDownOrStableSecurite(Number(vmCountPast), Number(nbVmNonMaj));
    const { icon: Icon, color } =
        tendance === undefined ? { icon: () => null, color: "transparent" } : TREND_CONFIG[tendance];

    return (
        <ToolTipLayout
            title={`Nombre de VM non mises à jour : ${nbVmNonMaj} (${vmCountPast})`}
            content={
                <>
                    {row.original.lettreMajVm ?? "NR"} <Icon sx={{ color }} />
                </>
            }
        />
    );
}

export function DelaiVMCell({ row }: Readonly<{ row: { original: SecuriteIndicateur } }>): JSX.Element {
    const delaiMax: string = row.original.delaiVmNonMiseAjour ?? "NR";
    const delaiMaxPast: string = row.original.delaiVmNonMiseAJourPast ?? "NR";
    const tendance: Trend | undefined =
        delaiMax.trim() === "" ||
        delaiMax === "NR" ||
        delaiMaxPast.trim() === "" ||
        delaiMaxPast === "NR"
            ? undefined
            : isUpDownOrStableSecurite(Number(delaiMaxPast), Number(delaiMax));
    const { icon: Icon, color } =
        tendance === undefined ? { icon: () => null, color: "transparent" } : TREND_CONFIG[tendance];

    return (
        <ToolTipLayout
            title={`Délai maximum de mise à jour des VM : ${delaiMax} (${delaiMaxPast})`}
            content={
                <>
                    {row.original.delaiVmNonMiseAjour ?? "NR"} <Icon sx={{ color }} />
                </>
            }
        />
    );
}
