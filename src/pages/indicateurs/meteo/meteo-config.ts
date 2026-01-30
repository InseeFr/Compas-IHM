import type { MeteoIndicateur, MeteoPoint } from "models/indicateurs";
import type { Pagination } from "models/table-model";
import type { Application, Meteo } from "todos-api/client.gen";
import { MeteoCell } from "./meteoCell";
import type { MRT_ColumnDef, MRT_TableInstance } from "material-react-table";
import { handleExportCsv } from "utils/exportCsv";
import { generateAriaLabelCell } from "utils/accessibility-functions";

export const frMonthLabel = (mk: string) => {
    const [y, m] = mk.split("-").map(s => Number.parseInt(s, 10));
    const d = new Date(y, m - 1, 1);
    return new Intl.DateTimeFormat("fr-FR", { month: "short", year: "numeric" }).format(d);
};

export const toMonthKey = (isoDate: string): string => {
    const [year, month] = isoDate.split("-").map(Number);
    return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}`;
};

export const monthRange = (minMk: string, maxMk: string): string[] => {
    const [minY, minM] = minMk.split("-").map(Number);
    const [maxY, maxM] = maxMk.split("-").map(Number);

    const result: string[] = [];
    let y = minY;
    let m = minM;

    while (y < maxY || (y === maxY && m <= maxM)) {
        result.push(`${y.toString().padStart(4, "0")}-${m.toString().padStart(2, "0")}`);
        m++;
        if (m > 12) {
            m = 1;
            y++;
        }
    }

    return result;
};

export const month = (meteos: Meteo[]): string[] => {
    const monthKeys: string[] = meteos
        .map(m => m.date)
        .filter((d): d is string => d !== undefined)
        .map(toMonthKey);

    if (monthKeys.length === 0) {
        return [];
    }

    const sorted = [...monthKeys].sort((a, b) => a.localeCompare(b));
    const minMk = sorted[0];
    const maxMk = sorted.at(-1);

    return monthRange(minMk, maxMk ?? "");
};

const createRow = (
    meteo: Meteo,
    domaineFoncByApp: Map<number, string>,
    mapMeteo: Map<number, MeteoIndicateur>
): MeteoIndicateur => {
    const id = meteo.idApplication!;
    const result: MeteoIndicateur = {
        idApp: id,
        applicationName: meteo.appName ?? "NR",
        sndi: meteo.sndi ?? "NR",
        domaine: meteo.domaineSndi ?? "NR",
        domaineFonc: domaineFoncByApp.get(id) ?? "NR",
        byMonth: {}
    };
    mapMeteo.set(id, result);
    return result;
};

export function buildDomaineFoncMap(apps: Application[]): Map<number, string> {
    return new Map(
        apps
            .filter(app => app.idApplication != null)
            .map(app => [app.idApplication!, app.domaineFonctionnel ?? "NR"])
    );
}

export const buildMeteo = (
    meteos: Meteo[],
    allMonths: string[],
    domaineFoncByApp: Map<number, string>
): MeteoIndicateur[] => {
    const meteoByApp = new Map<number, MeteoIndicateur>();

    meteos.forEach(meteo => {
        const id = meteo.idApplication;
        if (id == null) return;

        const row = meteoByApp.get(id) ?? createRow(meteo, domaineFoncByApp, meteoByApp);

        if (!meteo.date) return;

        const mk = toMonthKey(meteo.date);

        const point: MeteoPoint = {
            date: meteo.date,
            valeur: meteo.valeurMeteo ?? -1,
            commentaire:
                meteo.commentaire && meteo.commentaire.length > 0
                    ? meteo.commentaire
                    : "Pas de commentaire"
        };

        const monthPoints = row.byMonth[mk] ?? [];
        row.byMonth[mk] = monthPoints;
        monthPoints.push(point);
    });

    for (const row of meteoByApp.values()) {
        for (const mk of Object.keys(row.byMonth)) {
            row.byMonth[mk].sort((a, b) => a.date.localeCompare(b.date));
        }
    }

    const completed = Array.from(meteoByApp.values()).map(row => {
        const byMonth = { ...row.byMonth };
        for (const mk of allMonths) {
            byMonth[mk] ??= [];
        }
        return { ...row, byMonth };
    });

    completed.sort((a, b) => a.applicationName.localeCompare(b.applicationName));

    return completed;
};

export const columnsMeteo = (months: string[]): MRT_ColumnDef<MeteoIndicateur>[] => {
    const baseColumns: MRT_ColumnDef<MeteoIndicateur>[] = [
        {
            header: "Nom",
            accessorKey: "applicationName",
            muiTableBodyCellProps: ({ cell, row }) => ({
                "aria-label": generateAriaLabelCell(
                    "Application",
                    row.original.applicationName,
                    cell.getValue<string>()
                )
            })
        }
    ];

    const monthColumns: MRT_ColumnDef<MeteoIndicateur>[] = months.map(mk => ({
        id: `m-${mk}`,
        header: frMonthLabel(mk),
        accessorKey: "Par mois",
        accessorFn: row => row.byMonth[mk] ?? [],
        Cell: MeteoCell,
        muiTableBodyCellProps: ({ cell, row }) => {
            const values = cell.getValue<{ date: string; valeur: number; commentaire: string }[]>();
            return {
                "aria-label": generateAriaLabelCell(
                    `Météo de ${frMonthLabel(mk)}`,
                    row.original.applicationName,
                    values.map(value => value.valeur).join(",")
                )
            };
        }
    }));

    return [...baseColumns, ...monthColumns];
};
export const paginationConfig: Pagination = {
    pagination: {
        pageIndex: 0,
        pageSize: 30
    }
};

export const onExport = (table: MRT_TableInstance<MeteoIndicateur>) => {
    const escapeCsv = (value: string | number | undefined) =>
        `"${(value ?? "").toString().replaceAll('"', '""')}"`;

    const rows = table.getPrePaginationRowModel().rows;
    if (rows.length === 0) return;

    const allMonths = Array.from(
        new Set(rows.flatMap(row => Object.keys(row.original.byMonth ?? {})))
    ).sort((a, b) => a.localeCompare(b));

    const csvData = rows.map(row => {
        const { applicationName, byMonth } = row.original;

        const baseValues = [applicationName];

        const monthValues = allMonths.map(mk => byMonth[mk]?.map(p => p.valeur).join(" ") ?? "");

        return [...baseValues, ...monthValues].map(escapeCsv).join(",");
    });

    handleExportCsv("meteo-mensuel", table, csvData);
};
