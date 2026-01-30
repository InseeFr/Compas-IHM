import type { MRT_ColumnDef, MRT_Row, MRT_TableInstance } from "material-react-table";
import type { SecuriteIndicateur } from "models/indicateurs";
import type { Pagination } from "models/table-model";
import { flattenRows, getName, handleExportCsv } from "utils/exportCsv";
import { CveCell, MajVmCell } from "./SecuriteCell";
import type { Application, Module, IndicateurSecuriteView } from "todos-api/client.gen";
import { muiAriaCell } from "utils/accessibility-functions";
import { BASE_COLONNE } from "constantes/constantes";

export const OnExport = (table: MRT_TableInstance<SecuriteIndicateur>) => {
    const filteredRows: MRT_Row<SecuriteIndicateur>[] = flattenRows(table.getExpandedRowModel().rows);
    const csvData: string[] = filteredRows.map(row =>
        [
            `${getName(row)}`,
            `"${row.original.sndi}"`,
            `"${row.original.lettreCve}"`,
            `"${row.original.lettreMajVm}"`,
            `"${row.original.delaiVmNonMiseAjour}"`
        ].join(",")
    );
    handleExportCsv("sécurité", table, csvData);
};

export const paginationConfig: Pagination = {
    pagination: {
        pageIndex: 0,
        pageSize: 30
    }
};

export const columnsTable = (): MRT_ColumnDef<SecuriteIndicateur>[] => {
    const colonnes: MRT_ColumnDef<SecuriteIndicateur>[] = [
        {
            accessorKey: "lettreNiveauCve",
            header: "CVE",
            Cell: CveCell,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "CVE", cell: cell, row: row })
        },
        {
            accessorKey: "lettreMajVm",
            header: "nb de VMs hors délai",
            Cell: MajVmCell,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Maj VM", cell: cell, row: row })
        },
        {
            accessorKey: "delaiVmNonMiseAjour",
            header: "Max delai Maj VM",
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Délai des maj VM", cell: cell, row: row })
        }
    ];
    return [...BASE_COLONNE<SecuriteIndicateur>(), ...colonnes];
};

function formatSecuriteIndicateurBase(
    securiteItem?: IndicateurSecuriteView
): Partial<SecuriteIndicateur> {
    const defaultValue = "NR";

    return {
        nbCveCritical: securiteItem?.nbCveCritical ?? defaultValue,
        nbCveHigh: securiteItem?.nbCveHigh ?? defaultValue,
        nbCveLow: securiteItem?.nbCveLow ?? defaultValue,
        nbCveMedium: securiteItem?.nbCveMedium ?? defaultValue,
        lettreCve: securiteItem?.lettreCve ?? defaultValue,
        lettreNiveauCve: securiteItem?.lettreCve ?? defaultValue,
        nbVmNonMaj: securiteItem?.nbVmNonMaj ?? defaultValue,
        lettreMajVm: securiteItem?.lettreMajVm ?? defaultValue,
        delaiVmNonMiseAjour: securiteItem?.delaiVmNonMiseAjour ?? defaultValue,
        lettreGlobaleSecurite: securiteItem?.lettreGlobaleSecurite ?? defaultValue,
        lettreGlobale: securiteItem?.lettreGlobale ?? defaultValue
    };
}

export function formatApplicationSecurite(
    app: Application,
    securiteItem?: IndicateurSecuriteView
): SecuriteIndicateur {
    const defaultValue = "NR";

    return {
        applicationId: app.idApplication,
        applicationName: app.appName ?? defaultValue,
        sndi: app.sndi ?? defaultValue,
        domaine: app.domaineSndi ?? defaultValue,
        domaineFonc: app.domaineFonctionnel ?? defaultValue,
        ...formatSecuriteIndicateurBase(securiteItem),
        isModule: false
    };
}

export function formatModuleSecurite(
    mod: Module,
    securiteItem?: IndicateurSecuriteView
): SecuriteIndicateur {
    const defaultValue = "NR";

    return {
        moduleId: mod.id,
        applicationName: mod.modName ?? defaultValue,
        sndi: mod.sndi ?? defaultValue,
        domaine: mod.domaineSndi ?? defaultValue,
        domaineFonc: mod.domaineFonctionnel ?? defaultValue,
        ...formatSecuriteIndicateurBase(securiteItem),
        parentApplication: mod.appName ?? defaultValue,
        isModule: true
    };
}
