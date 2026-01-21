import { useMemo } from "react";
import { getApplications2, getModules2 } from "../../../todos-api/client.gen";
import ButtonCsvExport from "../../../pages/ButtonCsvExport";
import TablePageLayout from "../../../pages/TablePageLayout";
import { columnsTable, formatIndicateur, onExport, paginationConfig } from "./devopsConfig";
import { useFilterContext } from "store/filterContext";
import { Filters } from "components/Filters";
import { UseQueryIndicators } from "utils/useQueryIndicators";

export const DevopsIndicateurTable = () => {
    const { state, dispatch } = useFilterContext();

    const columns = useMemo(() => columnsTable(), []);

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

    const { data, isLoading, modulesByApp, filteredData } = UseQueryIndicators({
        queryKey: ["DevopsIndicator"],
        fetchData,
        hasModules: true
    });

    return (
        <>
            <Filters data={data} state={state} dispatch={dispatch} />
            <TablePageLayout
                titleTable="Table Indicateur DEVOPS"
                data={filteredData.filter(item => (item.isModule ? null : item))}
                columns={columns}
                isLoading={isLoading}
                paginationConfig={paginationConfig}
                rowId={row =>
                    row.isModule
                        ? `${row.parentApplication}-${row.applicationName}`
                        : row.applicationName
                }
                subRow={subRow => (subRow.isModule ? undefined : modulesByApp[subRow.applicationName])}
                renderTopCustom={({ table }) => <ButtonCsvExport table={table} onExport={onExport} />}
            />
        </>
    );
};
