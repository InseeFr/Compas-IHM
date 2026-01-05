import { describe, it, expect, vi } from "vitest";
import type { MRT_ColumnFiltersState } from "material-react-table";
import { columnFilters, filteredColumns, handleColumnFiltersChange } from "utils/filterFunctions";
import type { Action, FilterState } from "store/filterContext";
import { groupModulesByApp } from "utils/group-module-by-apps";

describe("filteredColumns", () => {
    it("retourne les valeurs uniques non vides", () => {
        const data = [
            { name: "Alice", age: 20 },
            { name: "Bob", age: 25 },
            { name: "Alice", age: 30 },
            { name: "", age: 40 }
        ];

        const result = filteredColumns(data, "name");

        expect(result).toEqual(["Alice", "Bob"]);
    });

    it("ignore les valeurs non string", () => {
        const data = [{ value: 1 }, { value: 2 }, { value: 1 }];

        const result = filteredColumns(data, "value");

        expect(result).toEqual([]);
    });
});

describe("columnFilters", () => {
    it("retourne tous les filtres quand ils sont définis", () => {
        const state: FilterState = {
            serviceDev: "service-1",
            domaineDev: "domaine-1",
            appName: ""
        };

        const result = columnFilters(state);

        expect(result).toEqual([
            { id: "sndi", value: "service-1" },
            { id: "domaine", value: "domaine-1" }
        ]);
    });

    it("ignore les filtres vides", () => {
        const state: FilterState = {
            serviceDev: "",
            domaineDev: "domaine-1",
            appName: ""
        };

        const result = columnFilters(state);

        expect(result).toEqual([{ id: "domaine", value: "domaine-1" }]);
    });
});

describe("handleColumnFiltersChange", () => {
    it("dispatch RESET_FILTERS puis les actions de filtres", () => {
        const state: FilterState = {
            serviceDev: "",
            domaineDev: "",
            appName: ""
        };

        const dispatch = vi.fn() as React.Dispatch<Action>;

        const handler = handleColumnFiltersChange(state, dispatch);

        const nextFilters: MRT_ColumnFiltersState = [
            { id: "sndi", value: "service-x" },
            { id: "domaine", value: "domaine-y" }
        ];

        handler(nextFilters);

        expect(dispatch).toHaveBeenCalledWith({ type: "RESET_FILTERS" });
        expect(dispatch).toHaveBeenCalledWith({
            type: "SET_SERVICE_DEV",
            payload: "service-x"
        });
        expect(dispatch).toHaveBeenCalledWith({
            type: "SET_DOMAINE_DEV",
            payload: "domaine-y"
        });

        expect(dispatch).toHaveBeenCalledTimes(3);
    });

    it("gère un updater function", () => {
        const state: FilterState = {
            serviceDev: "old-service",
            domaineDev: "",
            appName: ""
        };

        const dispatch = vi.fn() as React.Dispatch<Action>;
        const handler = handleColumnFiltersChange(state, dispatch);

        handler(prev => [...prev, { id: "domaine", value: "new-domaine" }]);

        expect(dispatch).toHaveBeenCalledWith({ type: "RESET_FILTERS" });
        expect(dispatch).toHaveBeenCalledWith({
            type: "SET_SERVICE_DEV",
            payload: "old-service"
        });
        expect(dispatch).toHaveBeenCalledWith({
            type: "SET_DOMAINE_DEV",
            payload: "new-domaine"
        });
    });
});

type TestModule = {
    name: string;
    isModule?: boolean;
    parentApplication?: string;
};

describe("groupModulesByApp", () => {
    it("devrait grouper les modules par parent d'application", () => {
        const modules: TestModule[] = [
            { name: "A", isModule: true, parentApplication: "App1" },
            { name: "B", isModule: true, parentApplication: "App2" },
            { name: "C", isModule: true, parentApplication: "App1" },
            { name: "D" },
            { name: "E", isModule: false, parentApplication: "App2" }
        ];

        const result = groupModulesByApp(modules);

        expect(result).toEqual({
            App1: [
                { name: "A", isModule: true, parentApplication: "App1" },
                { name: "C", isModule: true, parentApplication: "App1" }
            ],
            App2: [{ name: "B", isModule: true, parentApplication: "App2" }]
        });
    });

    it("devrait retourner un tableau vide si c'est une app", () => {
        const modules: TestModule[] = [{ name: "X" }, { name: "Y", isModule: false }];

        const result = groupModulesByApp(modules);

        expect(result).toEqual({});
    });

    it("devrait retourner un tableau vide", () => {
        const result = groupModulesByApp([]);
        expect(result).toEqual({});
    });
});
