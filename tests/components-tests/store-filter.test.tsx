import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { useFilterContext, FilterProvider } from "store/filterContext";

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
