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
import { type IndicateurApplicationGreenITView } from "todos-api/client.gen";
import { muiAriaCell } from "utils/accessibility-functions";
import { escapeCsvValue, handleExportCsv } from "utils/exportCsv";
import { BASE_HEADERS, GREENIT_HEADERS } from "constantes/constantes-headers";
import {
    ConsoCell,
    CPUCell,
    CpuUsedCell,
    DiskAllocatedCell,
    DiskUsedCell,
    NbPodCell,
    NbVMCell,
    PvcUsedCell,
    RamAlloueeCell,
    RamUsedCell,
    S3UsedCell
} from "./GreenItCell";

const firstNumberOrNull = (s: string | null | undefined): number | null => {
    if (!s) return null;
    const m = new RegExp(/[\d.]+/).exec(String(s));
    if (!m) return null;
    const num = Number(m[0]);
    return Number.isFinite(num) ? num : null;
};

export const diffNumeric = (globalVal?: string, prodVal?: string): number | null => {
    const g = firstNumberOrNull(globalVal);
    const p = firstNumberOrNull(prodVal);
    if (g == null || p == null) return null;
    return g - p;
};

export const formatNumberWithSpaces = (num: number): string => {
    const rounded = Math.round(num);
    return String(rounded)
        .split("")
        .reverse()
        .join("")
        .replaceAll(/(\d{3})(?=\d)/g, "$1 ")
        .split("")
        .reverse()
        .join("");
};

const sortHelper: MRT_SortingFn<GreenITIndicateur> = (rowA, rowB, columnId) => {
    const a = rowA.getValue<number>(columnId);
    const b = rowB.getValue<number>(columnId);

    if (a == null && b == null) return 0;
    if (a == null) return -1;
    if (b == null) return 1;

    return a - b;
};

export const formatOrNR = (value: number | null | undefined) =>
    value == null ? "NR" : formatNumberWithSpaces(value);

export const formatOrNRWithUnit = (value: number | null | undefined) =>
    value == null ? "NR" : formatNumberWithSpaces(value);

export const formatCpu = (value: number | null | undefined) =>
    value == null ? "NR" : formatNumberWithSpaces(value / 1000);

/* =========================================================EXPORT CSV========================================================= */

export const onExport = (table: MRT_TableInstance<GreenITIndicateur>) => {
    const headers = [
        BASE_HEADERS.NOM,
        BASE_HEADERS.SERVICE_DEV,
        BASE_HEADERS.DOMAINE_DEV,
        BASE_HEADERS.DOMAINE_FONCTIONNEL,
        GREENIT_HEADERS.NIVEAU_GREENIT,
        GREENIT_HEADERS.CONSO_GREENIT_BRUTE,
        GREENIT_HEADERS.SCORE_CONSO_GREENIT,
        GREENIT_HEADERS.SCORE_IMPACT_GREENIT,
        GREENIT_HEADERS.SCORE_GASPILLAGE_GREENIT,
        GREENIT_HEADERS.NB_VM,
        GREENIT_HEADERS.CPU_ALLOUE,
        GREENIT_HEADERS.CPU_MAXI,
        GREENIT_HEADERS.RAM_ALLOUEE,
        GREENIT_HEADERS.RAM_MAXI,
        GREENIT_HEADERS.DISQUE_ALLOUE,
        GREENIT_HEADERS.DISQUE_UTILISE,
        GREENIT_HEADERS.NB_VM_PROD,
        GREENIT_HEADERS.CPU_ALLOUE_PROD,
        GREENIT_HEADERS.CPU_MAXI_PROD,
        GREENIT_HEADERS.RAM_ALLOUEE_PROD,
        GREENIT_HEADERS.RAM_MAXI_PROD,
        GREENIT_HEADERS.DISQUE_ALLOUE_PROD,
        GREENIT_HEADERS.DISQUE_UTILISE_PROD,
        GREENIT_HEADERS.CONSO_GREENIT_PROD_BRUTE
    ].map(escapeCsvValue);

    const filteredRows: MRT_Row<GreenITIndicateur>[] = table.getPrePaginationRowModel().rows;

    const buildCsvRow = (data: GreenITIndicateur): string => {
        const getValue = (value: string | undefined): string => value ?? "NR";

        const baseFields = [data.applicationName, data.sndi, data.domaine, data.domaineFonc];

        const greenItMetrics = [
            getValue(data.lettreGreen),
            getValue(data.consoGlobal),
            getValue(data.consoNormalized),
            getValue(data.impactNormalized),
            getValue(data.gaspillage)
        ];

        const globalResources = [
            getValue(data.nbVMGlobal),
            getValue(data.cpuAllocatedGlobal),
            getValue(data.cpuAllocatedGlobal),
            getValue(data.ramAllocatedGlobal),
            getValue(data.ramAllocatedGlobal),
            getValue(data.diskAllocatedGlobal),
            getValue(data.diskAllocatedGlobal)
        ];

        const prodResources = [
            getValue(data.nbVMProd),
            getValue(data.cpuAllocatedProd),
            getValue(data.cpuAllocatedProd),
            getValue(data.ramAllocatedProd),
            getValue(data.ramAllocatedProd),
            getValue(data.diskAllocatedProd),
            getValue(data.diskAllocatedProd),
            getValue(data.consoProd)
        ];

        return [...baseFields, ...greenItMetrics, ...globalResources, ...prodResources]
            .map(value => `"${value}"`)
            .join(",");
    };

    const csvData: string[] = filteredRows.map(row => buildCsvRow(row.original));

    handleExportCsv("green-it", table, csvData, headers);
};
/* =========================================================COLUMNS========================================================= */
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
        const ramMaxi = pickNumeric(item.ramMaxi, item.ramMaxiProd);
        const cpuMaxi = pickNumeric(item.cpuMaxi, item.cpuMaxiProd);
        const cpuUsed = pickNumeric(item.cpuUsed, item.cpuUsedProd);
        const ramUsed = pickNumeric(item.ramUsed, item.ramUsedProd);
        const diskUsed = pickNumeric(item.diskUsed, item.diskUsedProd);
        const s3Used = pickNumeric(item.s3Used, item.s3UsedProd);
        const pvcUsed = pickNumeric(item.pvcUsed, item.pvcUsedProd);
        const nbPodMaxi = pickNumeric(item.nbPodMaxi, item.nbPodMaxiProd);
        return {
            ...item,

            _conso: formatOrNR(conso),
            _cpu: formatCpu(cpu),
            _ram: formatOrNR(ram),
            _disk: formatOrNR(disk),
            _nbVm: formatOrNRWithUnit(nbVm),

            _ramMaxi: formatOrNR(ramMaxi),
            _cpuMaxi: formatCpu(cpuMaxi),
            _cpuUsed: cpuUsed == null ? "NR" : formatNumberWithSpaces(cpuUsed / 3600),
            _ramUsed: formatOrNR(ramUsed),
            _diskUsed: formatOrNR(diskUsed),
            _s3Used: formatOrNR(s3Used),
            _pvcUsed: formatOrNR(pvcUsed),
            _nbPodMaxi: formatOrNRWithUnit(nbPodMaxi),

            _consoSort: conso == null ? null : Math.round(conso),
            _cpuSort: cpu == null ? null : Math.round(cpu / 1000),
            _ramSort: ram == null ? null : Math.round(ram),
            _diskSort: disk == null ? null : Math.round(disk),
            _nbVmSort: nbVm == null ? null : Math.round(nbVm),

            _ramMaxiSort: ramMaxi == null ? null : Math.round(ramMaxi),
            _cpuMaxiSort: cpuMaxi == null ? null : Math.round(cpuMaxi / 1000),
            _cpuUsedSort: cpuUsed == null ? null : Math.round(cpuUsed / 3600),

            // ramUsed / pvcUsed / s3Used sont déjà en Go côté backend -> pas de division ici
            _ramUsedSort: ramUsed == null ? null : Math.round(ramUsed),
            _diskUsedSort: diskUsed == null ? null : Math.round(diskUsed),
            _s3UsedSort: s3Used == null ? null : Math.round(s3Used),
            _pvcUsedSort: pvcUsed == null ? null : Math.round(pvcUsed),
            _nbPodMaxiSort: nbPodMaxi == null ? null : Math.round(nbPodMaxi)
        };
    });
};
const DEFAULT_VALUE = "NR";

function getValue<T>(obj: T | undefined, key: keyof T): string {
    const value = obj?.[key];
    return value !== undefined && value !== null ? String(value) : DEFAULT_VALUE;
}

export function formatIndicateur(greentItApp: IndicateurApplicationGreenITView[]): GreenITIndicateur[] {
    return greentItApp.map(app => {
        const appGreen: GreenITIndicateur = {
            isModule: false,
            applicationId: app.applicationId ?? -1,
            applicationName: app.applicationName ?? DEFAULT_VALUE,
            sndi: app.serviceDev ?? DEFAULT_VALUE,
            domaine: app.domaineDev ?? DEFAULT_VALUE,
            domaineFonc: app.domaineFonc ?? DEFAULT_VALUE,

            consoGlobal: getValue(app, "conso"),
            cpuAllocatedGlobal: getValue(app, "cpuAllocated"),
            diskAllocatedGlobal: getValue(app, "diskAllocated"),
            ramAllocatedGlobal: getValue(app, "ramAllocated"),
            nbVMGlobal: getValue(app, "nbVm"),
            consoProd: getValue(app, "consoProd"),
            cpuAllocatedProd: getValue(app, "cpuAllocatedProd"),
            diskAllocatedProd: getValue(app, "diskAllocatedProd"),
            ramAllocatedProd: getValue(app, "ramAllocatedProd"),
            nbVMProd: getValue(app, "nbVmProd"),
            consoNormalized: getValue(app, "consoScore"),
            impactNormalized: getValue(app, "impactScore"),
            gaspillage: getValue(app, "gaspillageScore"),
            lettreGreen: getValue(app, "lettreGreen"),
            consoGlobalHist: getValue(app, "consoHist"),
            cpuAllocatedGlobalHist: getValue(app, "cpuAllocatedHist"),
            diskAllocatedGlobalHist: getValue(app, "diskAllocatedHist"),
            ramAllocatedGlobalHist: getValue(app, "ramAllocatedHist"),
            nbVMGlobalHist: getValue(app, "nbVmHist"),
            consoProdHist: getValue(app, "consoHistProd"),
            cpuAllocatedProdHist: getValue(app, "cpuAllocatedHistProd"),
            diskAllocatedProdHist: getValue(app, "diskAllocatedHistProd"),
            ramAllocatedProdHist: getValue(app, "ramAllocatedHistProd"),
            nbVMProdHist: getValue(app, "nbVmHistProd"),
            ramMaxi: getValue(app, "ramMaxi"),
            cpuMaxi: getValue(app, "cpuMaxi"),
            cpuUsed: getValue(app, "cpuUsed"),
            ramUsed: getValue(app, "ramUsed"),
            diskUsed: getValue(app, "diskUsed"),
            s3Used: getValue(app, "s3Used"),
            pvcUsed: getValue(app, "pvcUsed"),
            nbPodMaxi: getValue(app, "nbPodMaxi"),
            ramMaxiProd: getValue(app, "ramMaxiProd"),
            cpuMaxiProd: getValue(app, "cpuMaxiProd"),
            cpuUsedProd: getValue(app, "cpuUsedProd"),
            ramUsedProd: getValue(app, "ramUsedProd"),
            diskUsedProd: getValue(app, "diskUsedProd"),
            s3UsedProd: getValue(app, "s3UsedProd"),
            pvcUsedProd: getValue(app, "pvcUsedProd"),
            nbPodMaxiProd: getValue(app, "nbPodMaxiProd"),
            ramMaxiHist: getValue(app, "ramMaxiHist"),
            cpuMaxiHist: getValue(app, "cpuMaxiHist"),
            cpuUsedHist: getValue(app, "cpuUsedHist"),
            ramUsedHist: getValue(app, "ramUsedHist"),
            diskUsedHist: getValue(app, "diskUsedHist"),
            s3UsedHist: getValue(app, "s3UsedHist"),
            pvcUsedHist: getValue(app, "pvcUsedHist"),
            nbPodMaxiHist: getValue(app, "nbPodMaxiHist"),
            ramMaxiProdHist: getValue(app, "ramMaxiHistProd"),
            cpuMaxiProdHist: getValue(app, "cpuMaxiHistProd"),
            cpuUsedProdHist: getValue(app, "cpuUsedHistProd"),
            ramUsedProdHist: getValue(app, "ramUsedHistProd"),
            diskUsedProdHist: getValue(app, "diskUsedHistProd"),
            s3UsedProdHist: getValue(app, "s3UsedHistProd"),
            pvcUsedProdHist: getValue(app, "pvcUsedHistProd"),
            nbPodMaxiProdHist: getValue(app, "nbPodMaxiHistProd")
        };
        return appGreen;
    });
}

export const paginationConfig: Pagination = {
    pagination: {
        pageIndex: 0,
        pageSize: 30
    }
};

export const columnsGreenIt = (view: ViewMode): MRT_ColumnDef<GreenITIndicateur>[] => {
    const colonnes: MRT_ColumnDef<GreenITIndicateur>[] = [
        {
            header: GREENIT_HEADERS.NOMBRE_VM, //ok
            accessorKey: "_nbVmSort",
            Cell: ({ row }: MRT_RowData) => NbVMCell({ row }, view),
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Nombre de VM", cell: cell, row: row })
        },
        {
            header: "Nombre (maxi) de POD", //ok
            accessorKey: "_nbPodMaxiSort",
            Cell: ({ row }: MRT_RowData) => NbPodCell({ row }, view),
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Nombre (maxi) de POD", cell: cell, row: row })
        },
        {
            header: GREENIT_HEADERS.DISQUE_ALLOUE_GO, //ok
            accessorKey: "_diskSort",
            Cell: ({ row }: MRT_RowData) => DiskAllocatedCell({ row }, view),
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "stockage réservé VM (Go)", cell: cell, row: row })
        },
        {
            header: "Stockage utilisé VM (Go)", //ok
            accessorKey: "_diskUsedSort",
            Cell: ({ row }: MRT_RowData) => DiskUsedCell({ row }, view),
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Stockage utilisé VM (Go)", cell: cell, row: row })
        },
        {
            header: "Stockage utilisé Kube (Go)",
            accessorKey: "_pvcUsedSort",
            Cell: ({ row }: MRT_RowData) => PvcUsedCell({ row }, view),
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Stockage utilisé Kube (Go)", cell: cell, row: row })
        },
        {
            header: "Stockage utilisé S3 (Go)",
            accessorKey: "_s3UsedSort",
            Cell: ({ row }: MRT_RowData) => S3UsedCell({ row }, view),
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Stockage utilisé S3 (Go)", cell: cell, row: row })
        },
        {
            header: "CPU réservée VM (Ghz)",
            accessorKey: "_cpuSort",
            Cell: ({ row }: MRT_RowData) => CPUCell({ row }, view),
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "CPU réservée VM (Ghz)", cell: cell, row: row })
        },
        {
            header: "CPU utilisée Kube (heure)",
            accessorKey: "_cpuUsedSort",
            Cell: ({ row }: MRT_RowData) => CpuUsedCell({ row }, view),
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "CPU utilisée Kube (heure)", cell: cell, row: row })
        },
        {
            header: GREENIT_HEADERS.RAM_ALLOUEE_GO,
            accessorKey: "_ramSort",
            Cell: ({ row }: MRT_RowData) => RamAlloueeCell({ row }, view),
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "RAM réservée VM (Go)", cell: cell, row: row })
        },
        {
            header: "RAM utilisée Kube (Go)",
            accessorKey: "_ramUsedSort",
            Cell: ({ row }: MRT_RowData) => RamUsedCell({ row }, view),
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "RAM utilisée Kube (Go)", cell: cell, row: row })
        },
        {
            header: GREENIT_HEADERS.CONSO_WH,
            accessorKey: "_consoSort",
            Cell: ({ row }: MRT_RowData) => ConsoCell({ row }, view),
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "consommation électrique VM (Wh)", cell: cell, row: row })
        }
    ];
    return [...BASE_COLONNE<GreenITIndicateur>(), ...colonnes];
};
