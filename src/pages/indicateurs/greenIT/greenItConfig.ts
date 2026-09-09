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
import { type IndicateurAppGreenKubeView, type IndicateurAppGreenVmView } from "todos-api/client.gen";
import { muiAriaCell } from "utils/accessibility-functions";
import { escapeCsvValue, handleExportCsv } from "utils/exportCsv";
import { BASE_HEADERS, GREENIT_HEADERS } from "constantes/constantes-headers";
import {
    AsAllocatedCell,
    AsUsedCell,
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

export const filteredViewMode = (
    viewMode: ViewMode,
    greenItData: GreenITIndicateur[]
): GreenITIndicateur[] => {
    const pickNumeric = (globalVal?: string, prodVal?: string, hpVal?: string): number | null => {
        if (viewMode === "global") return firstNumberOrNull(globalVal);
        if (viewMode === "prod") return firstNumberOrNull(prodVal);
        return firstNumberOrNull(hpVal);
    };

    return greenItData.map(item => {
        // --- VM ---
        const conso = pickNumeric(item.consoGlobal, item.consoProd, item.consoHp);
        const cpu = pickNumeric(item.cpuAllocatedGlobal, item.cpuAllocatedProd, item.cpuAllocatedHp);
        const ram = pickNumeric(item.ramAllocatedGlobal, item.ramAllocatedProd, item.ramAllocatedHp);
        const disk = pickNumeric(item.diskAllocatedGlobal, item.diskAllocatedProd, item.diskAllocatedHp);
        const nbVm = pickNumeric(item.nbVMGlobal, item.nbVMProd, item.nbVMHp);
        const ramMaxi = pickNumeric(item.ramMaxi, item.ramMaxiProd, item.ramMaxiHp);
        const cpuMaxi = pickNumeric(item.cpuMaxi, item.cpuMaxiProd, item.cpuMaxiHp);
        const diskUsed = pickNumeric(item.diskUsed, item.diskUsedProd, item.diskUsedHp);
        const asAllocated = pickNumeric(item.asAllocated, item.asAllocatedProd, item.asAllocatedHp);
        const asUsed = pickNumeric(item.asUsed, item.asUsedProd, item.asUsedHp);

        // --- KUBE ---
        const cpuUsed = pickNumeric(item.cpuUsed, item.cpuUsedProd, item.cpuUsedHp);
        const ramUsed = pickNumeric(item.ramUsed, item.ramUsedProd, item.ramUsedHp);
        const s3Used = pickNumeric(item.s3Used, item.s3UsedProd, item.s3UsedHp);
        const pvcUsed = pickNumeric(item.pvcUsed, item.pvcUsedProd, item.pvcUsedHp);
        const nbPodMaxi = pickNumeric(item.nbPodMaxi, item.nbPodMaxiProd, item.nbPodMaxiHp);

        return {
            ...item,
            _conso: formatOrNR(conso),
            _cpu: String(cpu),
            _ram: formatOrNR(ram),
            _disk: formatOrNR(disk),
            _nbVm: formatOrNR(nbVm),
            _ramMaxi: formatOrNR(ramMaxi),
            _cpuMaxi: String(cpuMaxi),
            _diskUsed: formatOrNR(diskUsed),
            _asAllocated: formatOrNR(asAllocated),
            _asUsed: formatOrNR(asUsed),
            _consoSort: conso,
            _cpuSort: cpu,
            _ramSort: ram,
            _diskSort: disk,
            _nbVmSort: nbVm,
            _ramMaxiSort: ramMaxi,
            _cpuMaxiSort: cpuMaxi,
            _diskUsedSort: diskUsed,
            _asAllocatedSort: asAllocated,
            _asUsedSort: asUsed,

            _cpuUsed: formatOrNR(cpuUsed),
            _ramUsed: formatOrNR(ramUsed),
            _s3Used: formatOrNR(s3Used),
            _pvcUsed: formatOrNR(pvcUsed),
            _nbPodMaxi: formatOrNR(nbPodMaxi),
            _cpuUsedSort: cpuUsed,
            _ramUsedSort: ramUsed,
            _s3UsedSort: s3Used,
            _pvcUsedSort: pvcUsed,
            _nbPodMaxiSort: nbPodMaxi
        };
    });
};

const DEFAULT_VALUE = "NR";

function getValue<T>(obj: T | undefined, key: keyof T): string {
    const value = obj?.[key];
    return value !== undefined && value !== null ? String(value) : DEFAULT_VALUE;
}

function getBaseAppGreen(app: IndicateurAppGreenKubeView | IndicateurAppGreenVmView, appNameLongMap?: Map<number | undefined, string | undefined>
): GreenITIndicateur {
    return {
        isModule: false,
        applicationId: app.applicationId ?? -1,
        applicationName: app.applicationName ?? DEFAULT_VALUE,
        appNameLong: appNameLongMap?.get(app.applicationId),
        sndi: (app as IndicateurAppGreenVmView).serviceDev ?? DEFAULT_VALUE,
        domaine: (app as IndicateurAppGreenVmView).domaineDev ?? DEFAULT_VALUE,
        domaineFonc: (app as IndicateurAppGreenVmView).domaineFonc ?? DEFAULT_VALUE,
        consoNormalized: getValue(app, "consoScore"),
        impactNormalized: getValue(app, "impactScore"),
        gaspillage: getValue(app, "gaspillageScore"),
        lettreGreen: getValue(app, "lettreGreen"),
        hasKube: false,
        hasVm: false
    } as GreenITIndicateur;
}

export function formatIndicateur(
    greentItAppKube: IndicateurAppGreenKubeView[],
    greenItAppVm: IndicateurAppGreenVmView[],
    appNameLongMap?: Map<number | undefined, string | undefined>
): GreenITIndicateur[] {
    const byId = new Map<number, GreenITIndicateur>();
    for (const kubeApp of greentItAppKube) {
        const id = kubeApp.applicationId ?? -1;
        const existing = byId.get(id) ?? getBaseAppGreen(kubeApp, appNameLongMap);

        byId.set(id, {
            ...existing,
            hasKube: true,

            cpuUsed: getValue(kubeApp, "cpuUsed"),
            cpuUsedHp: getValue(kubeApp, "cpuUsedHp"),
            ramUsed: getValue(kubeApp, "ramUsed"),
            ramUsedHp: getValue(kubeApp, "ramUsedHp"),
            s3Used: getValue(kubeApp, "s3Used"),
            s3UsedHp: getValue(kubeApp, "s3UsedHp"),
            pvcUsed: getValue(kubeApp, "pvcUsed"),
            pvcUsedHp: getValue(kubeApp, "pvcUsedHp"),
            nbPodMaxi: getValue(kubeApp, "nbPodMaxi"),
            nbPodMaxiHp: getValue(kubeApp, "nbPodMaxiHp"),

            cpuUsedProd: getValue(kubeApp, "cpuUsedProd"),
            ramUsedProd: getValue(kubeApp, "ramUsedProd"),
            s3UsedProd: getValue(kubeApp, "s3UsedProd"),
            pvcUsedProd: getValue(kubeApp, "pvcUsedProd"),
            nbPodMaxiProd: getValue(kubeApp, "nbPodMaxiProd"),

            cpuUsedHist: getValue(kubeApp, "cpuUsedHist"),
            cpuUsedHpHist: getValue(kubeApp, "cpuUsedHistHp"),
            ramUsedHist: getValue(kubeApp, "ramUsedHist"),
            ramUsedHpHist: getValue(kubeApp, "ramUsedHistHp"),
            s3UsedHist: getValue(kubeApp, "s3UsedHist"),
            s3UsedHpHist: getValue(kubeApp, "s3UsedHistHp"),
            pvcUsedHist: getValue(kubeApp, "pvcUsedHist"),
            pvcUsedHpHist: getValue(kubeApp, "pvcUsedHistHp"),
            nbPodMaxiHist: getValue(kubeApp, "nbPodMaxiHist"),
            nbPodMaxiHpHist: getValue(kubeApp, "nbPodMaxiHistHp"),

            cpuUsedProdHist: getValue(kubeApp, "cpuUsedHistProd"),
            ramUsedProdHist: getValue(kubeApp, "ramUsedHistProd"),
            s3UsedProdHist: getValue(kubeApp, "s3UsedHistProd"),
            pvcUsedProdHist: getValue(kubeApp, "pvcUsedHistProd"),
            nbPodMaxiProdHist: getValue(kubeApp, "nbPodMaxiHistProd")
        });
    }
    for (const vmApp of greenItAppVm) {
        const id = vmApp.applicationId ?? -1;
        const existing = byId.get(id) ?? getBaseAppGreen(vmApp, appNameLongMap);

        byId.set(id, {
            ...existing,
            hasVm: true,

            consoGlobal: getValue(vmApp, "conso"),
            consoHp: getValue(vmApp, "consoHp"),
            consoHpHist: getValue(vmApp, "consoHistHp"),
            cpuAllocatedGlobal: getValue(vmApp, "cpuAllocated"),
            cpuAllocatedHp: getValue(vmApp, "cpuAllocatedHp"),
            cpuAllocatedHpHist: getValue(vmApp, "cpuAllocatedHistHp"),
            diskAllocatedGlobal: getValue(vmApp, "diskAllocated"),
            diskAllocatedHp: getValue(vmApp, "diskAllocatedHp"),
            diskAllocatedHpHist: getValue(vmApp, "diskAllocatedHistHp"),
            ramAllocatedGlobal: getValue(vmApp, "ramAllocated"),
            ramAllocatedHp: getValue(vmApp, "ramAllocatedHp"),
            ramAllocatedHpHist: getValue(vmApp, "ramAllocatedHistHp"),
            nbVMHp: getValue(vmApp, "nbVmHp"),
            nbVMHpHist: getValue(vmApp, "nbVmHistHp"),
            nbVMGlobal: getValue(vmApp, "nbVm"),

            consoProd: getValue(vmApp, "consoProd"),
            cpuAllocatedProd: getValue(vmApp, "cpuAllocatedProd"),
            diskAllocatedProd: getValue(vmApp, "diskAllocatedProd"),
            ramAllocatedProd: getValue(vmApp, "ramAllocatedProd"),
            nbVMProd: getValue(vmApp, "nbVmProd"),

            consoGlobalHist: getValue(vmApp, "consoHist"),
            cpuAllocatedGlobalHist: getValue(vmApp, "cpuAllocatedHist"),
            diskAllocatedGlobalHist: getValue(vmApp, "diskAllocatedHist"),
            ramAllocatedGlobalHist: getValue(vmApp, "ramAllocatedHist"),
            nbVMGlobalHist: getValue(vmApp, "nbVmHist"),

            consoProdHist: getValue(vmApp, "consoHistProd"),
            cpuAllocatedProdHist: getValue(vmApp, "cpuAllocatedHistProd"),
            diskAllocatedProdHist: getValue(vmApp, "diskAllocatedHistProd"),
            ramAllocatedProdHist: getValue(vmApp, "ramAllocatedHistProd"),
            nbVMProdHist: getValue(vmApp, "nbVmHistProd"),

            ramMaxi: getValue(vmApp, "ramMaxi"),
            ramMaxiHp: getValue(vmApp, "ramMaxiHp"),
            cpuMaxi: getValue(vmApp, "cpuMaxi"),
            cpuMaxiHp: getValue(vmApp, "cpuMaxiHp"),
            diskUsed: getValue(vmApp, "diskUsed"),
            diskUsedHp: getValue(vmApp, "diskUsedHp"),

            ramMaxiProd: getValue(vmApp, "ramMaxiProd"),
            cpuMaxiProd: getValue(vmApp, "cpuMaxiProd"),
            diskUsedProd: getValue(vmApp, "diskUsedProd"),

            ramMaxiHist: getValue(vmApp, "ramMaxiHist"),
            ramMaxiHpHist: getValue(vmApp, "ramMaxiHistHp"),
            cpuMaxiHist: getValue(vmApp, "cpuMaxiHist"),
            cpuMaxiHpHist: getValue(vmApp, "cpuMaxiHistHp"),
            diskUsedHist: getValue(vmApp, "diskUsedHist"),
            diskUsedHpHist: getValue(vmApp, "diskUsedHistHp"),

            ramMaxiProdHist: getValue(vmApp, "ramMaxiHistProd"),
            cpuMaxiProdHist: getValue(vmApp, "cpuMaxiHistProd"),
            diskUsedProdHist: getValue(vmApp, "diskUsedHistProd"),

            asAllocated: getValue(vmApp, "asAllocated"),
            asAllocatedHist: getValue(vmApp, "asAllocatedHist"),
            asAllocatedHp: getValue(vmApp, "asAllocatedHp"),
            asAllocatedHpHist: getValue(vmApp, "asAllocatedHistHp"),
            asAllocatedProd: getValue(vmApp, "asAllocatedProd"),
            asAllocatedProdHist: getValue(vmApp, "asAllocatedHistProd"),

            asUsed: getValue(vmApp, "asUsed"),
            asUsedHist: getValue(vmApp, "asUsedHist"),
            asUsedHp: getValue(vmApp, "asUsedHp"),
            asUsedHpHist: getValue(vmApp, "asUsedHistHp"),
            asUsedProd: getValue(vmApp, "asUsedProd"),
            asUsedProdHist: getValue(vmApp, "asUsedHistProd")
        });
    }

    return Array.from(byId.values());
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
        },
        {
            header: GREENIT_HEADERS.STOCKAGE_ALLOUE_APPLISHARE,
            accessorKey: "_asAllocatedSort",
            Cell: ({ row }: MRT_RowData) => AsAllocatedCell({ row }, view),
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Stockage réservé applishare (Go)", cell: cell, row: row })
        },
        {
            header: GREENIT_HEADERS.STOCKAGE_UTILISE_APPLISHARE,
            accessorKey: "_asUsedSort",
            Cell: ({ row }: MRT_RowData) => AsUsedCell({ row }, view),
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Stockage utilisé applishare (Go)", cell: cell, row: row })
        }
    ];
    return [...BASE_COLONNE<GreenITIndicateur>(), ...colonnes];
};
