import { useMemo } from "react";
import { useFilterContext } from "store/filterContext";
import { columnsTable, formatIndicateur, OnExport, paginationConfig } from "./a11yConfig";
import { getModules1, listerModulesA11y } from "todos-api/client.gen";
import TablePageLayout from "pages/TablePageLayout";
import ButtonCsvExport from "pages/ButtonCsvExport";
import { Filters } from "components/Filters";
import { UseQueryIndicators } from "utils/useQueryIndicators";

export const A11yIndicateurTable = () => {
    const { state, dispatch } = useFilterContext();
    const columns = useMemo(() => columnsTable(), []);

    const fetchData = async () => {
        try {
            const [modulesA11y, modules] = await Promise.all([listerModulesA11y(), getModules1()]);

            const modulesByName = new Map(modules.map(module => [module.modName, module]));

            return modulesA11y.map(mod => formatIndicateur(mod, modulesByName.get(mod.modName)));
        } catch (error) {
            console.error("Erreur lors de la récupération des données A11y: ", error);
        }
    };

    const { data, isLoading, filteredData } = UseQueryIndicators({
        queryKey: ["A11YIndicator"],
        fetchData,
        hasModules: true
    });

    return (
        <>
            <Filters data={data} state={state} dispatch={dispatch} />
            <TablePageLayout
                titleTable="Table Indicateur Accessibilité"
                data={filteredData}
                columns={columns}
                isLoading={isLoading}
                paginationConfig={paginationConfig}
                rowId={row => row.modName}
                renderTopCustom={({ table }) => <ButtonCsvExport table={table} onExport={OnExport} />}
            />
        </>
    );
};
