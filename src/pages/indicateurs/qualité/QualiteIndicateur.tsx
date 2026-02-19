import { useFilterContext } from "store/filterContext";
import { columnsTable, formatIndicateur, OnExport, paginationConfig } from "./qualiteConfig";
import { getIndicateurQualiteByApplication, getIndicateurQualiteByModule } from "todos-api/client.gen";
import TablePageLayout from "components/TablePageLayout";
import ButtonCsvExport from "components/ButtonCsvExport";
import { Filters } from "pages/Filters";
import { useQueryIndicators } from "utils/useQueryIndicators";

const QualiteIndicateurTable = () => {
    const { state, dispatch } = useFilterContext();
    const columns = columnsTable();

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

    const { data, isLoading, modulesByApp, filteredData } = useQueryIndicators({
        queryKey: ["QualiteIndicator"],
        fetchData,
        hasModules: true
    });

    return (
        <TablePageLayout
            titleTable="Table Indicateur Qualité"
            filters={<Filters data={data} state={state} dispatch={dispatch} />}
            data={filteredData.filter(item => (item.isModule ? null : item))}
            isLoading={isLoading}
            columns={columns}
            paginationConfig={paginationConfig}
            rowId={row =>
                row.isModule ? `${row.parentApplication}-${row.applicationName}` : row.applicationName
            }
            subRow={subRow => (subRow.isModule ? undefined : modulesByApp[subRow.applicationName])}
            renderTopCustom={({ table }) => <ButtonCsvExport table={table} onExport={OnExport} />}
        />
    );
};

export default QualiteIndicateurTable;
