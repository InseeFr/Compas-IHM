import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { useFilterContext, FilterProvider, type FilterState } from "store/filterContext";
import { applyDevFilters } from "utils/filters-functions";

const emptyState: FilterState = {
    serviceDev: "",
    domaineDev: "",
    domaineFonc: ""
};

const item = {
    sndi: "SNDI-01",
    domaine: "domaine-A",
    domaineFonc: "fonc-X"
};

const TestComponent = () => {
    const { state, dispatch } = useFilterContext();

    return (
        <>
            <span data-testid="service">{state.serviceDev}</span>
            <button onClick={() => dispatch({ type: "SET_SERVICE_DEV", payload: "service-x" })}>
                set
            </button>
        </>
    );
};

const TestEmpty = () => {
    const { state, dispatch } = useFilterContext();

    return (
        <>
            <span data-testid="service">{state.serviceDev}</span>
            <button onClick={() => dispatch({ type: "SET_SERVICE_DEV", payload: "" })}>set</button>
        </>
    );
};

describe("FilterContext", () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup();
    });

    it("fournit l'état et permet le dispatch", async () => {
        render(
            <FilterProvider>
                <TestComponent />
            </FilterProvider>
        );

        expect(screen.getByTestId("service").textContent).toBe("");

        await user.click(screen.getByText("set"));

        expect(screen.getByTestId("service").textContent).toBe("service-x");
    });

    it("update un filtre avec un string vide", async () => {
        render(
            <FilterProvider>
                <TestEmpty />
            </FilterProvider>
        );

        await user.click(screen.getByText("set"));
        expect(screen.getByTestId("service").textContent).toBe("");
    });
});

describe("applyDevFilters", () => {
    it("retourne true si tous les filtres sont vides", () => {
        expect(applyDevFilters(item, emptyState)).toBe(true);
    });

    it("retourne true si les filtres correspondent à l'item", () => {
        const state: FilterState = {
            serviceDev: "SNDI-01",
            domaineDev: "domaine-A",
            domaineFonc: "fonc-X"
        };
        expect(applyDevFilters(item, state)).toBe(true);
    });

    it("retourne false si serviceDev ne correspond pas", () => {
        const state: FilterState = { ...emptyState, serviceDev: "SNDI-99" };
        expect(applyDevFilters(item, state)).toBe(false);
    });

    it("retourne false si domaineDev ne correspond pas", () => {
        const state: FilterState = { ...emptyState, domaineDev: "domaine-Z" };
        expect(applyDevFilters(item, state)).toBe(false);
    });

    it("retourne false si domaineFonc ne correspond pas", () => {
        const state: FilterState = { ...emptyState, domaineFonc: "fonc-Z" };
        expect(applyDevFilters(item, state)).toBe(false);
    });

    it("retourne true si les champs de l'item sont undefined et les filtres sont vides", () => {
        expect(applyDevFilters({}, emptyState)).toBe(true);
    });

    it("retourne false si le filtre est défini mais le champ de l'item est undefined", () => {
        const state: FilterState = { ...emptyState, serviceDev: "SNDI-01" };
        expect(applyDevFilters({}, state)).toBe(false);
    });
});
