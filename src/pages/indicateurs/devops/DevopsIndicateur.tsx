import { getApplications2, getModules2 } from "../../../todos-api/client.gen";
import { columnsTable, formatIndicateur, onExport, paginationConfig } from "./devopsConfig";
import { useFilterContext } from "store/filterContext";
import { Filters } from "pages/Filters";
import { useQueryIndicators } from "utils/useQueryIndicators";
import TablePageLayout from "components/TablePageLayout";
import ButtonCsvExport from "components/ButtonCsvExport";

export const DevopsIndicateurTable = () => {
    const { state, dispatch } = useFilterContext();

    const columns = columnsTable();

    const fetchData = async () => {
        try {
            const [apps, modules] = await Promise.all([getApplications2(), getModules2()]);

            const formattedApplications = apps.map(app => formatIndicateur(app));
            const formattedModules = modules.map(module => formatIndicateur(module, true));

            return [...formattedApplications, ...formattedModules];
        } catch (error) {
            console.error("Erreur lors de la récupération des données :", error);
        }
    };

    const { data, isLoading, modulesByApp, filteredData } = useQueryIndicators({
        queryKey: ["DevopsIndicator"],
        fetchData,
        hasModules: true
    });

    return (
        <TablePageLayout
            titleTable="Table Indicateur DEVOPS"
            filters={<Filters data={data} state={state} dispatch={dispatch} />}
            data={filteredData.filter(item => (item.isModule ? null : item))}
            columns={columns}
            isLoading={isLoading}
            paginationConfig={paginationConfig}
            rowId={row =>
                row.isModule ? `${row.parentApplication}-${row.applicationName}` : row.applicationName
            }
            subRow={subRow => (subRow.isModule ? undefined : modulesByApp[subRow.applicationName])}
            renderTopCustom={({ table }) => <ButtonCsvExport table={table} onExport={onExport} />}
        />
    );
};
