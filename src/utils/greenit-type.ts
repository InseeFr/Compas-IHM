import type { ViewMode } from "constantes/constantes";
import type { GreenITIndicateur } from "models/indicateurs";
import type { MRT_ColumnDef } from "material-react-table";
import { columnsGreenIt } from "pages/indicateurs/greenIT/greenItConfig";
import { BASE_COLONNE } from "constantes/constantes";

export type InfraType = "ALL" | "KUB" | "VM";


const VM_KEYS = {
    GLOBAL: [
        "_nbVmSort",
        "_cpuSort",
        "_ramSort",
        "_diskSort",
        "_ramMaxiSort",
        "_cpuMaxiSort"
    ],

    PROD: [
        "_nbVmProdSort",
        "_cpuUsedProdSort",
        "_ramUsedProdSort",
        "_diskUsedProdSort",
        "_ramMaxiProdSort",
        "_cpuMaxiProdSort"
    ],

    HORSPROD: [
    "_nbVmHorsProdSort",
        "_cpuHorsProdSort",
        "_ramHorsProdSort",
        "_diskHorsProdSort",
        "_ramMaxiHorsProdSort",
        "_cpuMaxiHorsProdSort"
    ]
};


const KUB_KEYS = {
    GLOBAL: [
        "_cpuUsedSort",
        "_ramUsedSort",
        "_diskUsedSort",
        "_s3UsedSort",
        "_pvcUsedSort",
        "_nbPodMaxiSort"
    ],

    PROD: [
        "_cpuUsedProdSort",
        "_ramUsedProdSort",
        "_diskUsedProdSort",
        "_s3UsedProdSort",
        "_pvcUsedProdSort",
        "_nbPodMaxiProdSort"
    ],

    HORSPROD: [
        "_cpuUsedHorsProdSort",
        "_ramUsedHorsProdSort",
        "_diskUsedHorsProdSort",
        "_s3UsedHorsProdSort",
        "_pvcUsedHorsProdSort",
        "_nbPodMaxiHorsProdSort"
    ]
};

const ALL_KEYS = {
    GLOBAL:   [...VM_KEYS.GLOBAL,   ...VM_KEYS.PROD,   ...KUB_KEYS.GLOBAL,   ...KUB_KEYS.PROD],
    PROD:     [...VM_KEYS.PROD,                         ...KUB_KEYS.PROD],
    HORSPROD: [...VM_KEYS.HORSPROD,                     ...KUB_KEYS.HORSPROD]
};

export function buildInfraColumns(
    viewMode: ViewMode,
    infraType: InfraType
): MRT_ColumnDef<GreenITIndicateur>[] {

    const baseColumns = BASE_COLONNE<GreenITIndicateur>();
    const allInfraColumns = columnsGreenIt().filter(
        col => !baseColumns.some(base => base.accessorKey === col.accessorKey)
    );

    let allowedKeys: string[] = [];

    if (infraType === "ALL") {
        if (viewMode === "global") {
            allowedKeys = ALL_KEYS.GLOBAL;
        }
        if (viewMode === "prod") {
            allowedKeys = ALL_KEYS.PROD;
        }
        if (viewMode === "horsprod") {
            allowedKeys = ALL_KEYS.HORSPROD;
        }
    }

    if (infraType === "VM") {

        if (viewMode === "global") {
            allowedKeys = [...VM_KEYS.GLOBAL, ...VM_KEYS.PROD];
        }

        if (viewMode === "prod") {
            allowedKeys = VM_KEYS.PROD;
        }

        if (viewMode === "horsprod") {
            allowedKeys = VM_KEYS.HORSPROD;
        }
    }

    if (infraType === "KUB") {

        if (viewMode === "global") {
            allowedKeys = [...KUB_KEYS.GLOBAL, ...KUB_KEYS.PROD];
        }

        if (viewMode === "prod") {
            allowedKeys = KUB_KEYS.PROD;
        }

        if (viewMode === "horsprod") {
            allowedKeys = KUB_KEYS.HORSPROD;
        }
    }

    return [
        ...baseColumns,
        ...allInfraColumns.filter(col =>
            allowedKeys.includes(col.accessorKey as string)
        )
    ];
}