import { BASE_COLONNE, type ViewMode } from "constantes/constantes";
import type {
    MRT_ColumnDef,
    MRT_Row,
    MRT_RowData,
    MRT_SortingFn,
    MRT_TableInstance
} from "material-react-table";
import type { GreenITIndicateur } from "models/indicateurs";
import type { Pagination } from "models/table-model";
import type { Application, IndicateurApplicationGreenITView } from "todos-api/client.gen";
import { muiAriaCell } from "utils/accessibility-functions";
import { handleExportCsv } from "utils/exportCsv";

const firstNumberOrNull = (s: string | null | undefined): number | null => {
    if (!s) return null;
    const m = new RegExp(/[\d.,]+/).exec(String(s));
    if (!m) return null;
    const normalized = m[0].replaceAll(".", "").replace(",", ".");
    const num = Number(normalized);
    return Number.isFinite(num) ? num : null;
};

const diffNumeric = (globalVal?: string, prodVal?: string): number | null => {
    const g = firstNumberOrNull(globalVal);
    const p = firstNumberOrNull(prodVal);
    if (g == null || p == null) return null;
    return g - p;
};

const formatNumberWithSpaces = (num: number, forceInteger = false): string => {
    const n = forceInteger ? Math.round(num) : num;
    const [intPart, decPartRaw] = String(n).split(".");

    const intSpaced = intPart
        .split("")
        .reverse()
        .join("")
        .replaceAll(/(\d{3})(?=\d)/g, "$1 ")
        .split("")
        .reverse()
        .join("");

    let decPart = "";
    if (!forceInteger && decPartRaw) {
        let i = decPartRaw.length;
        while (i > 0 && decPartRaw[i - 1] === "0") i--;
        if (i > 0) decPart = "," + decPartRaw.slice(0, i);
    }

    return intSpaced + decPart;
};

const sortHelper: MRT_SortingFn<GreenITIndicateur> = (rowA, rowB, columnId) => {
    const a = rowA.getValue<number>(columnId);
    const b = rowB.getValue<number>(columnId);

    if (a == null && b == null) return 0;
    if (a == null) return -1;
    if (b == null) return 1;

    return a - b;
};

export const onExport = (table: MRT_TableInstance<GreenITIndicateur>) => {
    const filteredRows: MRT_Row<GreenITIndicateur>[] = table.getPrePaginationRowModel().rows;
    const csvData: string[] = filteredRows.map(row =>
        [
            `"${row.original.applicationName}"`,
            `"${row.original.sndi}"`,
            `"${row.original._conso}"`,
            `"${row.original._cpu}"`,
            `"${row.original._ram}"`,
            `"${row.original._disk}"`,
            `"${row.original.gaspillage}"`,
            `"${row.original._nbVm}"`
        ].join(",")
    );

    handleExportCsv("green-it", table, csvData);
};

export const filteredViewMode = (
    viewMode: ViewMode,
    greenItData: GreenITIndicateur[]
): GreenITIndicateur[] => {
    const pickNumeric = (globalVal?: string, prodVal?: string): number | null => {
        if (viewMode === "global") return firstNumberOrNull(globalVal);
        if (viewMode === "prod") return firstNumberOrNull(prodVal);
        return diffNumeric(globalVal, prodVal);
    };

    return greenItData.map(item => {
        const conso = pickNumeric(item.consoGlobal, item.consoProd);
        const cpu = pickNumeric(item.cpuAllocatedGlobal, item.cpuAllocatedProd);
        const ram = pickNumeric(item.ramAllocatedGlobal, item.ramAllocatedProd);
        const disk = pickNumeric(item.diskAllocatedGlobal, item.diskAllocatedProd);
        const nbVm = pickNumeric(item.nbVMGlobal, item.nbVMProd);

        return {
            ...item,

            _conso: conso == null ? "NR" : formatNumberWithSpaces(conso),
            _cpu: cpu == null ? "NR" : formatNumberWithSpaces(cpu / 1000, true),
            _ram: ram == null ? "NR" : formatNumberWithSpaces(ram),
            _disk: disk == null ? "NR" : formatNumberWithSpaces(disk),
            _nbVm: nbVm == null ? "NR" : formatNumberWithSpaces(nbVm, true),

            _consoSort: conso,
            _cpuSort: cpu == null ? null : cpu / 1000,
            _ramSort: ram,
            _diskSort: disk,
            _nbVmSort: nbVm
        };
    });
};

const DEFAULT_VALUE = "NR";

function getValue<T>(obj: T | undefined, key: keyof T): string {
    const value = obj?.[key];
    return value !== undefined && value !== null ? String(value) : DEFAULT_VALUE;
}

export function formatIndicateur(
    sndiAndDomain: Application[],
    greentItApp: IndicateurApplicationGreenITView[]
): GreenITIndicateur[] {
    return sndiAndDomain.map(app => {
        const greenITApp = greentItApp.find(aG => aG.applicationName === app.appName);

        return {
            applicationName: app.appName ?? DEFAULT_VALUE,
            sndi: app.sndi ?? DEFAULT_VALUE,
            domaine: app.domaineSndi ?? DEFAULT_VALUE,
            domaineFonc: app.domaineFonctionnel ?? DEFAULT_VALUE,

            consoGlobal: getValue(greenITApp, "conso"),
            cpuAllocatedGlobal: getValue(greenITApp, "cpuAllocated"),
            diskAllocatedGlobal: getValue(greenITApp, "diskAllocated"),
            ramAllocatedGlobal: getValue(greenITApp, "ramAllocated"),
            nbVMGlobal: getValue(greenITApp, "nbVm"),

            consoProd: getValue(greenITApp, "consoProd"),
            cpuAllocatedProd: getValue(greenITApp, "cpuAllocatedProd"),
            diskAllocatedProd: getValue(greenITApp, "diskAllocatedProd"),
            ramAllocatedProd: getValue(greenITApp, "ramAllocatedProd"),
            nbVMProd: getValue(greenITApp, "nbVmProd"),

            lettreGreen: getValue(greenITApp, "lettreGreen"),
            gaspillage: getValue(greenITApp, "gaspillageScore"),
            consoNormalized: getValue(greenITApp, "consoScore"),
            impactNormalized: getValue(greenITApp, "impactScore"),

            isModule: false
        };
    });
}

export const paginationConfig: Pagination = {
    pagination: {
        pageIndex: 0,
        pageSize: 30
    }
};

export const columnsGreenIt = (): MRT_ColumnDef<GreenITIndicateur>[] => {
    const colonnes: MRT_ColumnDef<GreenITIndicateur>[] = [
        {
            header: "Conso (Wh)",
            accessorKey: "_consoSort",
            Cell: ({ row }: MRT_RowData) => row.original._conso,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Consommation en Watt", cell: cell, row: row })
        },
        {
            header: "CPU alloué (GHz)",
            accessorKey: "_cpuSort",
            Cell: ({ row }: MRT_RowData) => row.original._cpu,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Cpu alloué en Ghz", cell: cell, row: row })
        },
        {
            header: "RAM allouée (Go)",
            accessorKey: "_ramSort",
            Cell: ({ row }: MRT_RowData) => row.original._ram,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Ram allouée en Go", cell: cell, row: row })
        },
        {
            header: "Disque alloué (Go)",
            accessorKey: "_diskSort",
            Cell: ({ row }: MRT_RowData) => row.original._disk,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Disque alloué en Go", cell: cell, row: row })
        },
        {
            header: "Nombre de VM",
            accessorKey: "_nbVmSort",
            Cell: ({ row }: MRT_RowData) => row.original._nbVm,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Nombre de VM", cell: cell, row: row })
        }
    ];
    return [...BASE_COLONNE<GreenITIndicateur>(), ...colonnes];
};
