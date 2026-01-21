import { useMemo } from "react";
import { useFilterContext } from "store/filterContext";
import { columnsTable, formatIndicateur, OnExport, paginationConfig } from "./qualiteConfig";
import { getIndicateurQualiteByApplication, getIndicateurQualiteByModule } from "todos-api/client.gen";
import TablePageLayout from "pages/TablePageLayout";
import ButtonCsvExport from "pages/ButtonCsvExport";
import { Filters } from "components/Filters";
import { UseQueryIndicators } from "utils/useQueryIndicators";

const QualiteIndicateurTable = () => {
    const { state, dispatch } = useFilterContext();
    const columns = useMemo(() => columnsTable(), []);

    const fetchData = async () => {
        try {
            const [apps, modules] = await Promise.all([
                getIndicateurQualiteByApplication(),
                getIndicateurQualiteByModule()
            ]);
            const formattedApps = apps.map(app => formatIndicateur(app));
            const formattedModules = modules.map(mod => formatIndicateur(mod, true));
            return [...formattedApps, ...formattedModules];
        } catch (error) {
            console.log("Erreur lors de la récupération des données qualité: ", error);
        }
    };

    const { data, isLoading, modulesByApp, filteredData } = UseQueryIndicators({
        queryKey: ["QualiteIndicator"],
        fetchData,
        hasModules: true
    });

    return (
        <>
            <Filters data={data} state={state} dispatch={dispatch} />
            <TablePageLayout
                titleTable="Table Indicateur Qualité"
                data={filteredData.filter(item => (item.isModule ? null : item))}
                isLoading={isLoading}
                columns={columns}
                paginationConfig={paginationConfig}
                rowId={row =>
                    row.isModule
                        ? `${row.parentApplication}-${row.applicationName}`
                        : row.applicationName
                }
                subRow={subRow => (subRow.isModule ? undefined : modulesByApp[subRow.applicationName])}
                renderTopCustom={({ table }) => <ButtonCsvExport table={table} onExport={OnExport} />}
            />
        </>
    );
};

export default QualiteIndicateurTable;
