import { HEADERS_SECURITE } from "constantes/constantes-csv";
import type { MRT_Row, MRT_TableInstance } from "material-react-table";
import type { SecuriteIndicateur } from "models/indicateurs";
import type { ColumnTable, Pagination } from "models/table-model";
import { flattenRows, handleExportCsv } from "utils/exportCsv";
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

export const columnsTable = (): ColumnTable<SecuriteIndicateur>[] => {
    return [
        { accessorKey: "applicationName", header: "Nom" },
        { accessorKey: "sndi", header: "serviceDev" },
        {
            accessorKey: "lettreNiveauCve",
            header: "CVE",
            Cell: CveCell
        },
        {
            accessorKey: "lettreMajVm",
            header: "nb de VMs hors délai",
            Cell: MajVmCell
        },
        {
            accessorKey: "delaiVmNonMiseAjour",
            header: "Max delai Maj VM"
        }
    ];
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
