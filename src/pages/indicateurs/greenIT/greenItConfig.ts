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
            header: GREENIT_HEADERS.CONSO_WH,
            accessorKey: "_consoSort",
            Cell: ({ row }: MRT_RowData) => row.original._conso,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Consommation en Watt", cell: cell, row: row })
        },
        {
            header: GREENIT_HEADERS.CPU_ALLOUE_GHZ,
            accessorKey: "_cpuSort",
            Cell: ({ row }: MRT_RowData) => row.original._cpu,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Cpu alloué en Ghz", cell: cell, row: row })
        },
        {
            header: GREENIT_HEADERS.RAM_ALLOUEE_GO,
            accessorKey: "_ramSort",
            Cell: ({ row }: MRT_RowData) => row.original._ram,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Ram allouée en Go", cell: cell, row: row })
        },
        {
            header: GREENIT_HEADERS.DISQUE_ALLOUE_GO,
            accessorKey: "_diskSort",
            Cell: ({ row }: MRT_RowData) => row.original._disk,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Disque alloué en Go", cell: cell, row: row })
        },
        {
            header: GREENIT_HEADERS.NOMBRE_VM,
            accessorKey: "_nbVmSort",
            Cell: ({ row }: MRT_RowData) => row.original._nbVm,
            sortingFn: sortHelper,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Nombre de VM", cell: cell, row: row })
        }
    ];
    return [...BASE_COLONNE<GreenITIndicateur>(), ...colonnes];
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
