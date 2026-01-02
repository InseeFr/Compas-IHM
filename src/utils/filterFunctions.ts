import type { ColumnFiltersState, OnChangeFn } from "@tanstack/table-core";
import type { MRT_ColumnFiltersState } from "material-react-table";
import type { Dispatch } from "react";
import type { Action, FilterState } from "store/filterContext";

export function filteredColumns<U, K extends keyof U>(data: U[], key: K): string[] {
    const set = new Set<string>();

    for (const item of data) {
        const value = item[key];
        if (typeof value === "string" && value !== "") {
            set.add(value);
        }
    }

    return Array.from(set);
}

const createFilter = (id: string, value?: string) => (value ? { id, value } : null);

export function columnFilters(state: FilterState): MRT_ColumnFiltersState {
    return [createFilter("sndi", state.serviceDev), createFilter("domaine", state.domaineDev)].filter(
        (f): f is { id: string; value: string } => f !== null
    ) as MRT_ColumnFiltersState;
}

export function handleColumnFiltersChange(
    state: FilterState,
    dispatch: Dispatch<Action>
): OnChangeFn<ColumnFiltersState> {
    const handleFiltersChange: OnChangeFn<MRT_ColumnFiltersState> = updater => {
        const nextFilters = typeof updater === "function" ? updater(columnFilters(state)) : updater;

        dispatch({ type: "RESET_FILTERS" });

        nextFilters.forEach(filter => {
            switch (filter.id) {
                case "sndi":
                    dispatch({
                        type: "SET_SERVICE_DEV",
                        payload: String(filter.value)
                    });
                    break;
                case "domaine":
                    dispatch({
                        type: "SET_DOMAINE_DEV",
                        payload: String(filter.value)
                    });
                    break;
            }
        });
    };
    return handleFiltersChange;
}
