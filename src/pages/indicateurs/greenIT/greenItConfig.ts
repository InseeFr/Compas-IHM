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
import {
    getApplications,
    getApplications1,
    type Application,
    type IndicateurApplicationGreenITView
} from "todos-api/client.gen";
import { muiAriaCell } from "utils/accessibility-functions";
import { escapeCsvValue, handleExportCsv } from "utils/exportCsv";
import { BASE_HEADERS, GREENIT_HEADERS } from "constantes/constantes-headers";
import type { InfraType } from "utils/greenit-type";


const firstNumberOrNull = (s: string | null | undefined): number | null => {
    if (!s) return null;
    const m = new RegExp(/[\d.,]+/).exec(String(s));
    if (!m) return null;
    const normalized = m[0].replaceAll(".", "").replace(",", ".");
    const num = Number(normalized);
    return Number.isFinite(num) ? num : null;
};

const diff = (globalVal?: string, prodVal?: string): number | null => {
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

const hasValue = (value: unknown) => {
    if (value === null || value === undefined) return false;
    if (value === "NR") return false;
    if (value === "") return false;
    const n = firstNumberOrNull(String(value));
    return n !== null && n > 0;
};


const INFRA_PROPERTIES = {
    KUB: {
        global: ["nbPodMaxi", "pvcUsed", "s3Used"] as (keyof GreenITIndicateur)[],
        prod:   ["nbPodMaxiProd", "pvcUsedProd", "s3UsedProd"] as (keyof GreenITIndicateur)[]
    },
    VM: {
        global: ["nbVMGlobal", "cpuAllocatedGlobal", "ramAllocatedGlobal"] as (keyof GreenITIndicateur)[],
        prod:   ["nbVMProd", "cpuAllocatedProd", "ramAllocatedProd"] as (keyof GreenITIndicateur)[]
    }
};

const filterByInfraType = (
    data: GreenITIndicateur[],
    infraType: InfraType,
    viewMode: ViewMode
): GreenITIndicateur[] => {
    if (infraType === "ALL") {
        if (viewMode === "global") return [...data];
        return data.filter(item =>
            INFRA_PROPERTIES.VM.prod.some(prop => hasValue(item[prop]))   ||
            INFRA_PROPERTIES.KUB.prod.some(prop => hasValue(item[prop]))  ||
            INFRA_PROPERTIES.VM.global.some(prop => hasValue(item[prop])) ||
            INFRA_PROPERTIES.KUB.global.some(prop => hasValue(item[prop]))
        );
    }
    const config = INFRA_PROPERTIES[infraType];
    if (!config) return [...data];
    const properties = viewMode === "prod" ? config.prod : config.global;
    return data.filter(item => properties.some(prop => hasValue(item[prop])));
};

export const filteredViewMode = (
    viewMode: ViewMode,
    greenItData: GreenITIndicateur[],
    infraType: InfraType
): GreenITIndicateur[] => {

    const filtered = filterByInfraType(greenItData, infraType, viewMode);

    return filtered.map(item => {

        const conso = firstNumberOrNull(
            viewMode === "prod"     ? item.consoProd    :
            viewMode === "horsprod" ? undefined         :
            item.consoGlobal
        );
        const cpu = firstNumberOrNull(
            viewMode === "prod"     ? item.cpuUsedProd ?? item.cpuAllocatedProd :
            viewMode === "horsprod" ? undefined :
            item.cpuUsed ?? item.cpuAllocatedGlobal
        );
        const ram = firstNumberOrNull(
            viewMode === "prod"     ? item.ramUsedProd ?? item.ramAllocatedProd :
            viewMode === "horsprod" ? undefined :
            item.ramUsed ?? item.ramAllocatedGlobal
        );
        const nbVm = firstNumberOrNull(
            viewMode === "prod"     ? item.nbVMProd    :
            viewMode === "horsprod" ? undefined        :
            item.nbVMGlobal
        );
        const disk = firstNumberOrNull(
            viewMode === "prod"     ? item.diskUsedProd :
            viewMode === "horsprod" ? undefined         :
            item.diskUsed
        );
        const ramMaxi = firstNumberOrNull(
            viewMode === "prod"     ? item.ramMaxiProd :
            viewMode === "horsprod" ? undefined        :
            item.ramMaxi
        );
        const cpuMaxi = firstNumberOrNull(
            viewMode === "prod"     ? item.cpuMaxiProd :
            viewMode === "horsprod" ? undefined        :
            item.cpuMaxi
        );

        const cpuHorsProd         = diff(item.cpuAllocatedGlobal, item.cpuAllocatedProd);
        const ramHorsProd         = diff(item.ramAllocatedGlobal, item.ramAllocatedProd);
        const nbVmHorsProd        = diff(item.nbVMGlobal,         item.nbVMProd);
        const diskHorsProd        = diff(item.diskUsed,           item.diskUsedProd);
        const ramMaxiHorsProd     = diff(item.ramMaxi,            item.ramMaxiProd);
        const cpuMaxiHorsProd     = diff(item.cpuMaxi,            item.cpuMaxiProd);
        const kubCpuHorsProd      = diff(item.cpuUsed,            item.cpuUsedProd);
        const kubRamHorsProd      = diff(item.ramUsed,            item.ramUsedProd);
        const kubDiskHorsProd     = diff(item.diskUsed,           item.diskUsedProd);
        const kubS3HorsProd       = diff(item.s3Used,             item.s3UsedProd);
        const kubPvcHorsProd      = diff(item.pvcUsed,            item.pvcUsedProd);
        const kubPodHorsProd      = diff(item.nbPodMaxi,          item.nbPodMaxiProd);

        const fmt  = (v: number | null, integer = false) =>
            v == null ? "NR" : formatNumberWithSpaces(v, integer);
        const fmtK = (v: number | null) =>
            v == null ? "NR" : formatNumberWithSpaces(v / 1000, true);

        return {
            ...item,

            // ── GLOBAL ──────────────────────────────────────────────
            _consoSort:     conso,
            _cpuSort:       cpu,
            _ramSort:       ram,
            _nbVmSort:      nbVm,
            _diskSort:      disk,
            _ramMaxiSort:   ramMaxi,
            _cpuMaxiSort:   cpuMaxi,

            _conso:   fmt(conso),
            _cpu:     fmtK(cpu),
            _ram:     fmt(ram,     true),
            _nbVm:    fmt(nbVm,    true),
            _disk:    fmt(disk,    true),
            _ramMaxi: fmt(ramMaxi, true),
            _cpuMaxi: fmtK(cpuMaxi),

            // ── PROD ────────────────────────────────────────────────
            _nbVmProdSort:      firstNumberOrNull(item.nbVMProd),
            _cpuUsedProdSort:   firstNumberOrNull(item.cpuUsedProd),
            _ramUsedProdSort:   firstNumberOrNull(item.ramUsedProd),
            _diskUsedProdSort:  firstNumberOrNull(item.diskUsedProd),
            _s3UsedProdSort:    firstNumberOrNull(item.s3UsedProd),
            _pvcUsedProdSort:   firstNumberOrNull(item.pvcUsedProd),
            _nbPodMaxiProdSort: firstNumberOrNull(item.nbPodMaxiProd),
            _ramMaxiProdSort:   firstNumberOrNull(item.ramMaxiProd),
            _cpuMaxiProdSort:   firstNumberOrNull(item.cpuMaxiProd),

            _nbVmProd:      fmt(firstNumberOrNull(item.nbVMProd),      true),
            _cpuUsedProd:   fmtK(firstNumberOrNull(item.cpuUsedProd)),
            _ramUsedProd:   fmt(firstNumberOrNull(item.ramUsedProd),   true),
            _diskUsedProd:  fmt(firstNumberOrNull(item.diskUsedProd),  true),
            _s3UsedProd:    fmt(firstNumberOrNull(item.s3UsedProd),    true),
            _pvcUsedProd:   fmt(firstNumberOrNull(item.pvcUsedProd),   true),
            _nbPodMaxiProd: fmt(firstNumberOrNull(item.nbPodMaxiProd), true),
            _ramMaxiProd:   fmt(firstNumberOrNull(item.ramMaxiProd),   true),
            _cpuMaxiProd:   fmtK(firstNumberOrNull(item.cpuMaxiProd)),

            // ── GLOBAL KUB ──────────────────────────────────────────
            _cpuUsedSort:   firstNumberOrNull(item.cpuUsed),
            _ramUsedSort:   firstNumberOrNull(item.ramUsed),
            _diskUsedSort:  firstNumberOrNull(item.diskUsed),
            _s3UsedSort:    firstNumberOrNull(item.s3Used),
            _pvcUsedSort:   firstNumberOrNull(item.pvcUsed),
            _nbPodMaxiSort: firstNumberOrNull(item.nbPodMaxi),

            _cpuUsed:   fmtK(firstNumberOrNull(item.cpuUsed)),
            _ramUsed:   fmt(firstNumberOrNull(item.ramUsed),   true),
            _diskUsed:  fmt(firstNumberOrNull(item.diskUsed),  true),
            _s3Used:    fmt(firstNumberOrNull(item.s3Used),    true),
            _pvcUsed:   fmt(firstNumberOrNull(item.pvcUsed),   true),
            _nbPodMaxi: fmt(firstNumberOrNull(item.nbPodMaxi), true),

            // ── HORS-PROD VM ────────────────────────────────────────
            _nbVmHorsProdSort:    nbVmHorsProd,
            _cpuHorsProdSort:     cpuHorsProd,
            _ramHorsProdSort:     ramHorsProd,
            _diskHorsProdSort:    diskHorsProd,
            _ramMaxiHorsProdSort: ramMaxiHorsProd,
            _cpuMaxiHorsProdSort: cpuMaxiHorsProd,

            _nbVmHorsProd:    fmt(nbVmHorsProd,    true),
            _cpuHorsProd:     cpuHorsProd     == null ? "NR" : formatNumberWithSpaces(cpuHorsProd / 1000,     true),
            _ramHorsProd:     fmt(ramHorsProd,     true),
            _diskHorsProd:    fmt(diskHorsProd,    true),
            _ramMaxiHorsProd: fmt(ramMaxiHorsProd, true),
            _cpuMaxiHorsProd: cpuMaxiHorsProd  == null ? "NR" : formatNumberWithSpaces(cpuMaxiHorsProd / 1000, true),

            // ── HORS-PROD KUB ───────────────────────────────────────
            _cpuUsedHorsProdSort:   kubCpuHorsProd,
            _ramUsedHorsProdSort:   kubRamHorsProd,
            _diskUsedHorsProdSort:  kubDiskHorsProd,
            _s3UsedHorsProdSort:    kubS3HorsProd,
            _pvcUsedHorsProdSort:   kubPvcHorsProd,
            _nbPodMaxiHorsProdSort: kubPodHorsProd,

            _cpuUsedHorsProd:   kubCpuHorsProd  == null ? "NR" : formatNumberWithSpaces(kubCpuHorsProd / 1000, true),
            _ramUsedHorsProd:   fmt(kubRamHorsProd,  true),
            _diskUsedHorsProd:  fmt(kubDiskHorsProd, true),
            _s3UsedHorsProd:    fmt(kubS3HorsProd,   true),
            _pvcUsedHorsProd:   fmt(kubPvcHorsProd,  true),
            _nbPodMaxiHorsProd: fmt(kubPodHorsProd,  true),
        };
    });
};

/* =========================================================
   EXPORT CSV
========================================================= */

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
        const baseFields      = [data.applicationName, data.sndi, data.domaine, data.domaineFonc];
        const greenItMetrics  = [getValue(data.lettreGreen), getValue(data.consoGlobal), getValue(data.consoNormalized), getValue(data.impactNormalized), getValue(data.gaspillage)];
        const globalResources = [getValue(data.nbVMGlobal), getValue(data.cpuAllocatedGlobal), getValue(data.cpuAllocatedGlobal), getValue(data.ramAllocatedGlobal), getValue(data.ramAllocatedGlobal), getValue(data.diskAllocatedGlobal), getValue(data.diskAllocatedGlobal)];
        const prodResources   = [getValue(data.nbVMProd), getValue(data.cpuAllocatedProd), getValue(data.cpuAllocatedProd), getValue(data.ramAllocatedProd), getValue(data.ramAllocatedProd), getValue(data.diskAllocatedProd), getValue(data.diskAllocatedProd), getValue(data.consoProd)];
        return [...baseFields, ...greenItMetrics, ...globalResources, ...prodResources]
            .map(value => `"${value}"`)
            .join(",");
    };

    const csvData: string[] = filteredRows.map(row => buildCsvRow(row.original));
    handleExportCsv("green-it", table, csvData, headers);
};

/* =========================================================
    COLUMNS
========================================================= */

export const columnsGreenIt = (): MRT_ColumnDef<GreenITIndicateur>[] => {
    const colonnes: MRT_ColumnDef<GreenITIndicateur>[] = [

        // ══ GLOBAL VM ══════════════════════════════════════════════
        {
            header: GREENIT_HEADERS.CONSO_WH,
            accessorKey: "_consoSort",
            Cell: ({ row }: MRT_RowData) => row.original._conso,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "Consommation en Watt", cell, row })
        },
        {
            header: GREENIT_HEADERS.CPU_ALLOUE_GHZ,
            accessorKey: "_cpuSort",
            Cell: ({ row }: MRT_RowData) => row.original._cpu,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "Cpu alloué en Ghz", cell, row })
        },
        {
            header: GREENIT_HEADERS.RAM_ALLOUEE_GO,
            accessorKey: "_ramSort",
            Cell: ({ row }: MRT_RowData) => row.original._ram,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "Ram allouée en Go", cell, row })
        },
        {
            header: GREENIT_HEADERS.DISQUE_ALLOUE_GO,
            accessorKey: "_diskSort",
            Cell: ({ row }: MRT_RowData) => row.original._disk,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "Disque alloué en Go", cell, row })
        },
        {
            header: GREENIT_HEADERS.NOMBRE_VM,
            accessorKey: "_nbVmSort",
            Cell: ({ row }: MRT_RowData) => row.original._nbVm,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "Nombre de VM", cell, row })
        },
        {
            header: "RAM maxi (Go)",
            accessorKey: "_ramMaxiSort",
            Cell: ({ row }: MRT_RowData) => row.original._ramMaxi,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "RAM maxi en Go", cell, row })
        },
        {
            header: "CPU maxi (GHz)",
            accessorKey: "_cpuMaxiSort",
            Cell: ({ row }: MRT_RowData) => row.original._cpuMaxi,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "CPU maxi en GHz", cell, row })
        },

        // ══ GLOBAL KUB ═════════════════════════════════════════════
        {
            header: "CPU utilisé (GHz)",
            accessorKey: "_cpuUsedSort",
            Cell: ({ row }: MRT_RowData) => row.original._cpuUsed,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "CPU utilisé en GHz", cell, row })
        },
        {
            header: "RAM utilisée Kube (Go)",
            accessorKey: "_ramUsedSort",
            Cell: ({ row }: MRT_RowData) => row.original._ramUsed,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "RAM utilisée en Go", cell, row })
        },
        {
            header: "Stockage utilisé VM (Go)",
            accessorKey: "_diskUsedSort",
            Cell: ({ row }: MRT_RowData) => row.original._diskUsed,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "Disque utilisé en Go", cell, row })
        },
        {
            header: "Stockage utilisé S3 (Go)",
            accessorKey: "_s3UsedSort",
            Cell: ({ row }: MRT_RowData) => row.original._s3Used,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "S3 utilisé", cell, row })
        },
        {
            header: "Stockage utilisé Kube (Go)",
            accessorKey: "_pvcUsedSort",
            Cell: ({ row }: MRT_RowData) => row.original._pvcUsed,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "PVC utilisé", cell, row })
        },
        {
            header: "Nombre (maxi) de POD",
            accessorKey: "_nbPodMaxiSort",
            Cell: ({ row }: MRT_RowData) => row.original._nbPodMaxi,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "Nombre de pods maxi", cell, row })
        },

        // ══ PROD ═══════════════════════════════════════════════════
        {
            header: "Nombre de VM prod",
            accessorKey: "_nbVmProdSort",
            Cell: ({ row }: MRT_RowData) => row.original._nbVmProd,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "Nombre de VM prod", cell, row })
        },
        {
            header: "RAM maxi prod (Go)",
            accessorKey: "_ramMaxiProdSort",
            Cell: ({ row }: MRT_RowData) => row.original._ramMaxiProd,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "RAM maxi prod en Go", cell, row })
        },
        {
            header: "CPU maxi prod (GHz)",
            accessorKey: "_cpuMaxiProdSort",
            Cell: ({ row }: MRT_RowData) => row.original._cpuMaxiProd,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "CPU maxi prod en GHz", cell, row })
        },
        {
            header: "CPU utilisé prod (GHz)",
            accessorKey: "_cpuUsedProdSort",
            Cell: ({ row }: MRT_RowData) => row.original._cpuUsedProd,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "CPU utilisé prod en GHz", cell, row })
        },
        {
            header: "RAM utilisée prod (Go)",
            accessorKey: "_ramUsedProdSort",
            Cell: ({ row }: MRT_RowData) => row.original._ramUsedProd,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "RAM utilisée prod en Go", cell, row })
        },
        {
            header: "Disque utilisé prod (Go)",
            accessorKey: "_diskUsedProdSort",
            Cell: ({ row }: MRT_RowData) => row.original._diskUsedProd,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "Disque utilisé prod en Go", cell, row })
        },
        {
            header: "S3 utilisé prod",
            accessorKey: "_s3UsedProdSort",
            Cell: ({ row }: MRT_RowData) => row.original._s3UsedProd,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "S3 utilisé prod", cell, row })
        },
        {
            header: "PVC utilisé prod",
            accessorKey: "_pvcUsedProdSort",
            Cell: ({ row }: MRT_RowData) => row.original._pvcUsedProd,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "PVC utilisé prod", cell, row })
        },
        {
            header: "Nombre de pods maxi prod",
            accessorKey: "_nbPodMaxiProdSort",
            Cell: ({ row }: MRT_RowData) => row.original._nbPodMaxiProd,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "Nombre de pods maxi prod", cell, row })
        },

        // ══ HORS-PROD VM ═══════════════════════════════════════════
        {
            header: "Nombre de VM hors prod",
            accessorKey: "_nbVmHorsProdSort",
            Cell: ({ row }: MRT_RowData) => row.original._nbVmHorsProd,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "Nombre de VM hors prod", cell, row })
        },
        {
            header: "CPU hors prod (GHz)",
            accessorKey: "_cpuHorsProdSort",
            Cell: ({ row }: MRT_RowData) => row.original._cpuHorsProd,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "CPU hors prod en GHz", cell, row })
        },
        {
            header: "RAM hors prod (Go)",
            accessorKey: "_ramHorsProdSort",
            Cell: ({ row }: MRT_RowData) => row.original._ramHorsProd,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "RAM hors prod en Go", cell, row })
        },
        {
            header: "Disque hors prod (Go)",
            accessorKey: "_diskHorsProdSort",
            Cell: ({ row }: MRT_RowData) => row.original._diskHorsProd,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "Disque hors prod en Go", cell, row })
        },
        {
            header: "RAM maxi hors prod (Go)",
            accessorKey: "_ramMaxiHorsProdSort",
            Cell: ({ row }: MRT_RowData) => row.original._ramMaxiHorsProd,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "RAM maxi hors prod en Go", cell, row })
        },
        {
            header: "CPU maxi hors prod (GHz)",
            accessorKey: "_cpuMaxiHorsProdSort",
            Cell: ({ row }: MRT_RowData) => row.original._cpuMaxiHorsProd,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "CPU maxi hors prod en GHz", cell, row })
        },

        // ══ HORS-PROD KUB ══════════════════════════════════════════
        {
            header: "CPU utilisé hors prod (GHz)",
            accessorKey: "_cpuUsedHorsProdSort",
            Cell: ({ row }: MRT_RowData) => row.original._cpuUsedHorsProd,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "CPU utilisé hors prod en GHz", cell, row })
        },
        {
            header: "RAM utilisée hors prod (Go)",
            accessorKey: "_ramUsedHorsProdSort",
            Cell: ({ row }: MRT_RowData) => row.original._ramUsedHorsProd,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "RAM utilisée hors prod en Go", cell, row })
        },
        {
            header: "Disque utilisé hors prod (Go)",
            accessorKey: "_diskUsedHorsProdSort",
            Cell: ({ row }: MRT_RowData) => row.original._diskUsedHorsProd,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "Disque utilisé hors prod en Go", cell, row })
        },
        {
            header: "S3 utilisé hors prod",
            accessorKey: "_s3UsedHorsProdSort",
            Cell: ({ row }: MRT_RowData) => row.original._s3UsedHorsProd,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "S3 utilisé hors prod", cell, row })
        },
        {
            header: "PVC utilisé hors prod",
            accessorKey: "_pvcUsedHorsProdSort",
            Cell: ({ row }: MRT_RowData) => row.original._pvcUsedHorsProd,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "PVC utilisé hors prod", cell, row })
        },
        {
            header: "Nombre de pods maxi hors prod",
            accessorKey: "_nbPodMaxiHorsProdSort",
            Cell: ({ row }: MRT_RowData) => row.original._nbPodMaxiHorsProd,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "Nombre de pods maxi hors prod", cell, row })
        },
    ];

    return [...BASE_COLONNE<GreenITIndicateur>(), ...colonnes];
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
            applicationName:     app.appName ?? DEFAULT_VALUE,
            sndi:                app.sndi ?? DEFAULT_VALUE,
            domaine:             app.domaineSndi ?? DEFAULT_VALUE,
            domaineFonc:         app.domaineFonctionnel ?? DEFAULT_VALUE,
            consoGlobal:         getValue(greenITApp, "conso"),
            cpuAllocatedGlobal:  getValue(greenITApp, "cpuAllocated"),
            diskAllocatedGlobal: getValue(greenITApp, "diskAllocated"),
            ramAllocatedGlobal:  getValue(greenITApp, "ramAllocated"),
            nbVMGlobal:          getValue(greenITApp, "nbVm"),
            consoProd:           getValue(greenITApp, "consoProd"),
            cpuAllocatedProd:    getValue(greenITApp, "cpuAllocatedProd"),
            diskAllocatedProd:   getValue(greenITApp, "diskAllocatedProd"),
            ramAllocatedProd:    getValue(greenITApp, "ramAllocatedProd"),
            nbVMProd:            getValue(greenITApp, "nbVmProd"),
            lettreGreen:         getValue(greenITApp, "lettreGreen"),
            gaspillage:          getValue(greenITApp, "gaspillageScore"),
            consoNormalized:     getValue(greenITApp, "consoScore"),
            impactNormalized:    getValue(greenITApp, "impactScore"),
            nbPodMaxi:     getValue(greenITApp, "nbPodMaxi"),
            nbPodMaxiProd: getValue(greenITApp, "nbPodMaxiProd"),
            diskUsed:     getValue(greenITApp, "diskUsed"),
            pvcUsed:      getValue(greenITApp, "pvcUsed"),
            diskUsedProd: getValue(greenITApp, "diskUsedProd"),
            pvcUsedProd:  getValue(greenITApp, "pvcUsedProd"),
            s3Used:       getValue(greenITApp, "s3Used"),
            s3UsedProd:   getValue(greenITApp, "s3UsedProd"),
            cpuUsed:      getValue(greenITApp, "cpuUsed"),
            cpuUsedProd:  getValue(greenITApp, "cpuUsedProd"),
            ramUsed:      getValue(greenITApp, "ramUsed"),
            ramUsedProd:  getValue(greenITApp, "ramUsedProd"),
            ramMaxi:      getValue(greenITApp, "ramMaxi"),
            cpuMaxi:      getValue(greenITApp, "cpuMaxi"),
            ramMaxiProd:  getValue(greenITApp, "ramMaxiProd"),
            cpuMaxiProd:  getValue(greenITApp, "cpuMaxiProd"),
            isModule: false
        };
    });
}


export const paginationConfig: Pagination = {
    pagination: { pageIndex: 0, pageSize: 30 }
};

export const fetchData = async () => {
    try {
        const [sndiAndDomainApp, appGreenIt] = await Promise.all([
            getApplications1(),
            getApplications()
        ]);
        return [...formatIndicateur(sndiAndDomainApp, appGreenIt)];
    } catch (error) {
        console.error("Erreur lors de la récupération des données: ", error);
        throw error;
    }
};
