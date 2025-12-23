import type { ViewMode } from "../constantes/constantes";

export function handleExportCsv(
    indicator: string,
    headers: string[],
    filteredData: string[],
    viewMode?: ViewMode
) {
    const csvRows: string = [headers.join(","), ...filteredData].join("\n");
    const blob: Blob = new Blob([csvRows], { type: "text/csv" });
    const url: string = URL.createObjectURL(blob);
    const a: HTMLAnchorElement = document.createElement("a");
    const date: string = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `${date}-tableau-${indicator}${viewMode ? `-${viewMode}` : ""}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
