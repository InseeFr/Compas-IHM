import type { MRT_ColumnDef, MRT_Row, MRT_TableInstance } from "material-react-table";
import type { Pagination } from "models/table-model";
import { CveCell, MajVmCell } from "./SecuriteCell";
import type { Application, Module, IndicateurSecuriteView } from "todos-api/client.gen";
import { muiAriaCell } from "utils/accessibility-functions";
import { BASE_COLONNE } from "constantes/constantes";
import type { SecuriteIndicateur } from "models/indicateurs";
import { flattenRows, handleExportCsv, escapeCsvValue, getBaseValueCSV } from "utils/exportCsv";
import { SECURITE_HEADERS, BASE_HEADERS, GLOBAL_HEADERS } from "constantes/constantes-headers";

const getValueSecurityCSV = (row: MRT_Row<SecuriteIndicateur>) => {
    return [
        `"${row.original.lettreGlobaleSecurite ?? "NR"}"`,
        `"${row.original.lettreNiveauCve ?? "NR"}"`,
        `"${row.original.nbCveCritical ?? "NR"}"`,
        `"${row.original.nbCveHigh ?? "NR"}"`,
        `"${row.original.nbCveMedium ?? "NR"}"`,
        `"${row.original.nbCveLow ?? "NR"}"`,
        `"${row.original.nbVmNonMaj ?? "NR"}"`,
        `"${row.original.delaiVmNonMiseAjour ?? "NR"}"`
    ];
};

export const OnExport = (table: MRT_TableInstance<SecuriteIndicateur>) => {
    const headers = [
        BASE_HEADERS.NOM_APPLICATION,
        BASE_HEADERS.NOM_MODULE,
        BASE_HEADERS.SERVICE_DEV,
        BASE_HEADERS.DOMAINE_DEV,
        BASE_HEADERS.DOMAINE_FONCTIONNEL,
        GLOBAL_HEADERS.SECURITE,
        SECURITE_HEADERS.NIVEAU_CVE,
        SECURITE_HEADERS.CVE_CRITIQUE,
        SECURITE_HEADERS.CVE_ELEVE,
        SECURITE_HEADERS.CVE_MOYEN,
        SECURITE_HEADERS.CVE_FAIBLE,
        SECURITE_HEADERS.NB_VMS_HORS_DELAI,
        SECURITE_HEADERS.MAX_DELAI_MAJ_VM
    ].map(escapeCsvValue);

    const filteredRows: MRT_Row<SecuriteIndicateur>[] = flattenRows(table.getExpandedRowModel().rows);

    const csvData: string[] = filteredRows.map(row => {
        return [...getBaseValueCSV(row), ...getValueSecurityCSV(row)].join(",");
    });

    handleExportCsv("sécurité", table, csvData, headers);
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
            header: SECURITE_HEADERS.CVE,
            Cell: CveCell,
            muiTableBodyCellProps: ({ cell, row }) => muiAriaCell({ title: "CVE", cell: cell, row: row })
        },
        {
            accessorKey: "lettreMajVm",
            header: SECURITE_HEADERS.NB_VMS_HORS_DELAI,
            Cell: MajVmCell,
            muiTableBodyCellProps: ({ cell, row }) =>
                muiAriaCell({ title: "Maj VM", cell: cell, row: row })
        },
        {
            accessorKey: "delaiVmNonMiseAjour",
            header: SECURITE_HEADERS.MAX_DELAI_MAJ_VM,
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

export function formatApplicationsData(
    apps: Application[],
    securiteApps: IndicateurSecuriteView[]
): SecuriteIndicateur[] {
    return apps.map(app => {
        const securiteApp = securiteApps.find(s => s.applicationId === app.idApplication);
        return formatApplicationSecurite(app, securiteApp);
    });
}

export function formatModulesData(
    modules: Module[],
    securiteModules: IndicateurSecuriteView[]
): SecuriteIndicateur[] {
    return modules.map(mod => {
        const securiteModule = securiteModules.find(s => s.moduleId === mod.id);
        return formatModuleSecurite(mod, securiteModule);
    });
}
