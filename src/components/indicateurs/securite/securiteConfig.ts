import { HEADERS_SECURITE } from "constantes/constantes-csv";
import type { MRT_Row, MRT_TableInstance } from "material-react-table";
import type { SecuriteIndicateur } from "models/indicateurs";
import type { ColumnTable, Pagination } from "models/table-model";
import { flattenRows, handleExportCsv } from "utils/exportCsv";
import { filteredColumns } from "utils/filterFunctions";
import { CveCell, MajVmCell } from "./SecuriteCell";
import type { Application, Module, IndicateurSecuriteView } from "todos-api/client.gen";

export const OnExport = (table: MRT_TableInstance<SecuriteIndicateur>) => {
    const filteredRows: MRT_Row<SecuriteIndicateur>[] = flattenRows(table.getExpandedRowModel().rows);
    const csvData: string[] = filteredRows.map(row =>
        [
            `"${row.original.isModule ? row.original.parentApplication : row.original.applicationName}"`,
            `"${row.original.isModule ? row.original.applicationName : ""}"`,
            `"${row.original.sndi}"`,
            `"${row.original.domaine}"`,
            `"${row.original.lettreCve}"`,
            `"${row.original.nbCveCritical}"`,
            `"${row.original.nbCveHigh}"`,
            `"${row.original.nbCveMedium}"`,
            `"${row.original.nbCveLow}"`,
            `"${row.original.nbVmNonMaj}"`,
            `"${row.original.lettreMajVm}"`,
            `"${row.original.delaiVmNonMiseAjour}"`,
            `"${row.original.lettreGlobaleSecurite}"`,
            `"${row.original.lettreGlobale}"`
        ].join(",")
    );
    handleExportCsv("sécurité", HEADERS_SECURITE, csvData);
};

export const paginationConfig: Pagination = {
    pagination: {
        pageIndex: 0,
        pageSize: 30
    }
};

export const columnsTable = (
    securiteIndicateur: SecuriteIndicateur[]
): ColumnTable<SecuriteIndicateur>[] => {
    return [
        { accessorKey: "applicationName", header: "Nom", enableColumnFilter: false },
        {
            accessorKey: "sndi",
            header: "Service dev.",
            enableColumnFilter: true,
            filterVariant: "select",
            filterSelectOptions: filteredColumns(securiteIndicateur, "sndi")
        },
        {
            accessorKey: "domaine",
            header: "Domaine dev.",
            filterVariant: "select",
            enableColumnFilter: true,
            filterSelectOptions: filteredColumns(securiteIndicateur, "domaine")
        },
        {
            accessorKey: "lettreNiveauCve",
            header: "CVE",
            enableColumnFilter: false,
            Cell: CveCell
        },
        {
            accessorKey: "lettreMajVm",
            header: "nb de VMs hors délai",
            enableColumnFilter: false,
            Cell: MajVmCell
        },
        {
            accessorKey: "delaiVmNonMiseAjour",
            header: "Max delai Maj VM",
            enableColumnFilter: false
        }
    ];
};

export function formatApplicationSecurite(
    app: Application,
    securiteItem?: IndicateurSecuriteView
): SecuriteIndicateur {
    return {
        applicationId: app.idApplication,
        applicationName: app.appName ?? "NR",
        sndi: app.sndi ?? "NR",
        domaine: app.domaineSndi ?? "NR",
        nbCveCritical: securiteItem?.nbCveCritical ?? "NR",
        nbCveHigh: securiteItem?.nbCveHigh ?? "NR",
        nbCveLow: securiteItem?.nbCveLow ?? "NR",
        nbCveMedium: securiteItem?.nbCveMedium ?? "NR",
        lettreCve: securiteItem?.lettreCve ?? "NR",
        lettreNiveauCve: securiteItem?.lettreCve ?? "NR",
        nbVmNonMaj: securiteItem?.nbVmNonMaj ?? "NR",
        lettreMajVm: securiteItem?.lettreMajVm ?? "NR",
        delaiVmNonMiseAjour: securiteItem?.delaiVmNonMiseAjour ?? "NR",
        lettreGlobaleSecurite: securiteItem?.lettreGlobaleSecurite ?? "NR",
        lettreGlobale: securiteItem?.lettreGlobale ?? "NR",
        isModule: false
    };
}

export function formatModuleSecurite(
    mod: Module,
    securiteItem?: IndicateurSecuriteView
): SecuriteIndicateur {
    return {
        moduleId: mod.id,
        applicationName: mod.modName ?? "NR",
        sndi: mod.sndi ?? "NR",
        domaine: mod.domaineSndi ?? "NR",
        nbCveCritical: securiteItem?.nbCveCritical ?? "NR",
        nbCveHigh: securiteItem?.nbCveHigh ?? "NR",
        nbCveLow: securiteItem?.nbCveLow ?? "NR",
        nbCveMedium: securiteItem?.nbCveMedium ?? "NR",
        lettreCve: securiteItem?.lettreCve ?? "NR",
        lettreNiveauCve: securiteItem?.lettreCve ?? "NR",
        nbVmNonMaj: securiteItem?.nbVmNonMaj ?? "NR",
        lettreMajVm: securiteItem?.lettreMajVm ?? "NR",
        delaiVmNonMiseAjour: securiteItem?.delaiVmNonMiseAjour ?? "NR",
        lettreGlobaleSecurite: securiteItem?.lettreGlobaleSecurite ?? "NR",
        lettreGlobale: securiteItem?.lettreGlobale ?? "NR",
        parentApplication: mod.appName ?? "NR",
        isModule: true
    };
}
