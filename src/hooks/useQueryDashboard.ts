import { useQuery } from "@tanstack/react-query";
import type { GlobalIndicator } from "models/indicateurs";
import { useFilterContext } from "store/filterContext";
import { applyDevFilters } from "utils/filters-functions";

interface IUseDashboard {
    queryKey: string[];
    fetchData: () => Promise<GlobalIndicator[] | undefined>;
}

export function useQueryDashboard(props: Readonly<IUseDashboard>) {
    const { state } = useFilterContext();

    const { data = [], isLoading } = useQuery({
        queryKey: [props.queryKey.join(",")],
        queryFn: props.fetchData
    });

    const filteredData = data.filter(item => applyDevFilters(item, state));

    return {
        data,
        isLoading,
        filteredData
    };
}
