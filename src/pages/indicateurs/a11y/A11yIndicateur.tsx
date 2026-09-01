import { columnsTable, formatIndicateur, OnExport, paginationConfig } from "./a11yConfig";
import { getModules, listerModulesA11y } from "todos-api/client.gen";
import GenericIndicatorTable from "components/indicators/GenericIndicatorTable";
import { filterByApplicationName } from "constantes/constantes";

export const A11yIndicateurTable = () => {
    const columns = columnsTable();

    const fetchData = async () => {
        try {
            const [modulesA11y, modules] = await Promise.all([listerModulesA11y(), getModules()]);

            const modulesByName = new Map(modules.map(module => [module.modName, module]));

            return modulesA11y.map(mod => formatIndicateur(mod, modulesByName.get(mod.modName)));
        } catch (error) {
            console.error("Erreur lors de la récupération des données A11y: ", error);
            return [];
        }
    };

    return (
        <GenericIndicatorTable
            title="Table Indicateur Accessibilité"
            fetchData={fetchData}
            columns={columns}
            queryKey={["A11YIndicator"]}
            hasModules={true}
            paginationConfig={paginationConfig}
            onExport={OnExport}
            rowId={row => row.modName}
            filterPredicate={filterByApplicationName}
        />
    );
};
