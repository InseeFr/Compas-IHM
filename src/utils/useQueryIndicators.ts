import { useQuery } from "@tanstack/react-query";
import { useFilterContext } from "store/filterContext";
import { groupModulesByApp } from "utils/group-module-by-apps";
import { applyDevFilters } from "utils/filters-functions";
import type { FilterableItem } from "models/indicateurs";

interface UseQueryIndicatorsOptions<T> {
    queryKey: string[];
    fetchData: () => Promise<T[] | undefined>;
    hasModules: false | true;
}

export function useQueryIndicators<T extends FilterableItem>({
    queryKey,
    fetchData
}: UseQueryIndicatorsOptions<T>) {
    const { state } = useFilterContext();

    console.log(fetchData);
    const { data = [], isLoading } = useQuery({
        queryKey: [queryKey.join(",")],
        queryFn: fetchData
    });

    const modulesByApp = groupModulesByApp(data);

    const filteredData = data.filter(item => applyDevFilters(item, state));

    return {
        data,
        isLoading,
        modulesByApp,
        filteredData
    };
}
