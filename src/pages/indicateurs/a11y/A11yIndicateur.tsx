import { useFilterContext } from "store/filterContext";
import { columnsTable, formatIndicateur, OnExport, paginationConfig } from "./a11yConfig";
import { getModules1, listerModulesA11y } from "todos-api/client.gen";
import TablePageLayout from "components/TablePageLayout";
import ButtonCsvExport from "components/ButtonCsvExport";
import { Filters } from "pages/Filters";
import { useQueryIndicators } from "utils/useQueryIndicators";

export const A11yIndicateurTable = () => {
    const { state, dispatch } = useFilterContext();
    const columns = columnsTable();

    const fetchData = async () => {
        try {
            const [modulesA11y, modules] = await Promise.all([listerModulesA11y(), getModules1()]);

            const modulesByName = new Map(modules.map(module => [module.modName, module]));

            return modulesA11y.map(mod => formatIndicateur(mod, modulesByName.get(mod.modName)));
        } catch (error) {
            console.error("Erreur lors de la récupération des données A11y: ", error);
        }
    };

    const { data, isLoading, filteredData } = useQueryIndicators({
        queryKey: ["A11YIndicator"],
        fetchData,
        hasModules: true
    });

    return (
        <TablePageLayout
            titleTable="Table Indicateur Accessibilité"
            filters={<Filters data={data} state={state} dispatch={dispatch} />}
            data={filteredData}
            columns={columns}
            isLoading={isLoading}
            paginationConfig={paginationConfig}
            rowId={row => row.modName}
            renderTopCustom={({ table }) => <ButtonCsvExport table={table} onExport={OnExport} />}
        />
    );
};
