import type { MRT_Row, MRT_RowData, MRT_TableInstance } from "material-react-table";
import type { ViewMode } from "../constantes/constantes";
import type { GlobalIndicator } from "models/indicateurs";

export function handleExportCsv<U extends MRT_RowData>(
    indicator: string,
    table: MRT_TableInstance<U>,
    filteredData: string[],
    headers?: string[],
    viewMode?: ViewMode
) {
    const colonnes: string[] = table
        .getAllLeafColumns()
        .filter(c => c.id !== "mrt-row-expand")
        .map(c => c.columnDef.header);
    const headCsv = headers ? headers.join(",") : colonnes.join(",");
    const csvRows: string = [headCsv, ...filteredData].join("\n");
    const blob: Blob = new Blob([csvRows], { type: "text/csv" });
    const url: string = URL.createObjectURL(blob);
    const a: HTMLAnchorElement = document.createElement("a");
    const date: string = new Date().toISOString().slice(0, 10);
    a.href = url;
    const view: string = viewMode ? `-${viewMode}` : "";
    a.download = `${date}-tableau-${indicator}${view}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

export function flattenRows<T extends MRT_RowData>(rows: MRT_Row<T>[]): MRT_Row<T>[] {
    return rows.flatMap(row => [row, ...flattenRows(row.subRows || [])]);
}

export const sanitize = (value?: string | number): string => {
    return value === null || value === undefined || value === -1 || value === "" ? "NR" : String(value);
};

export const formatValue = (value: string): string | number => {
    if (value === "NR") return "NR";
    const num = Number(value);
    return Number.isNaN(num) ? value : num;
};

export const computeDetteTechniqueJours = (dette: string | undefined): string | number => {
    if (!dette || dette === "NR") return "NR";
    const minutes = Number.parseFloat(dette);
    if (Number.isNaN(minutes) || minutes <= 0) return "NR";
    return Math.round(minutes / 420);
};

export const formatMainCsvRow = (item: MRT_Row<GlobalIndicator>): string => {
    const original = item.original;

    const row = [
        original.isModule ? (original.parentApplication ?? "") : original.applicationName,
        original.isModule ? original.applicationName : "",
        original.sndi,
        original.domaine,
        sanitize(original.domaineFonc),
        sanitize(original.lettreQualiteGenerale),
        sanitize(original.lettreDevopsGenerale),
        original.lettreCouvertureTestUniaire,
        original.pourcentageCouvertureTestUniaire,
        sanitize(original.lettreDetteTechnique),
        sanitize(computeDetteTechniqueJours(original.detteTechnique)),
        sanitize(original.lettreFiabilite),
        sanitize(original.lettreCve),
        sanitize(formatValue(original.nbCveCritical)),
        sanitize(formatValue(original.nbCveHigh)),
        sanitize(formatValue(original.nbCveMedium)),
        sanitize(formatValue(original.nbCveLow)),
        sanitize(original.lettreDistanceCount),
        sanitize(original.distanceCount),
        sanitize(original.dateMeteoCommentaire),
        sanitize(original.meteo),
        sanitize(original.meteoCommentaire),
        sanitize(original.lettreA11y),
        sanitize(original.scoreAuditA11y),
        sanitize(original.lettreGreen),
        sanitize(original.conso),
        sanitize(original.consoNormalized),
        sanitize(original.impactNormalized),
        sanitize(original.gaspillage),
        sanitize(original.nbVm),
        sanitize(original.cpuAllocated),
        sanitize(original.cpuMaxi),
        sanitize(original.ramAllocated),
        sanitize(original.ramMaxi),
        sanitize(original.diskAllocated),
        sanitize(original.diskUsed),
        sanitize(original.nbVmProd),
        sanitize(original.cpuAllocatedProd),
        sanitize(original.cpuMaxiProd),
        sanitize(original.ramAllocatedProd),
        sanitize(original.ramMaxiProd),
        sanitize(original.diskAllocatedProd),
        sanitize(original.diskUsedProd),
        sanitize(original.consoProd)
    ];
    return row.map(escapeCsvValue).join(",");
};

export const escapeCsvValue = (value: string): string => {
    return `"${value.replaceAll('"', '""')}"`;
};

export const getName = <U extends MRT_RowData>(row: MRT_Row<U>): string => {
    const moduleName: string = `${row.original.parentApplication}-${row.original.applicationName}`;
    return `"${row.original.isModule ? moduleName : row.original.applicationName}"`;
};
