/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Filters } from "components/filtersLayout/FiltersForms";
import type { AllIndicators } from "models/indicateurs";
import type { FilterState } from "store/filterContext";

vi.mock("components/filtersLayout/SelectedFiltersLayout", () => ({
    SelectedFiltersLayout: vi.fn(({ filters }) => (
        <div data-testid="selected-filters-layout">
            {filters.map((filter: any, index: number) => (
                <div key={index} data-testid={`filter-${index}`}>
                    <label>{filter.title}</label>
                    <select
                        data-testid={`select-${filter.title}`}
                        value={filter.selectedOne || ""}
                        onChange={filter.onChange}
                    >
                        <option value="">Tous</option>
                        {filter.dataFilter.map((item: any, idx: number) => {
                            const value = filter.getValue(item);
                            return (
                                <option key={idx} value={value}>
                                    {value}
                                </option>
                            );
                        })}
                    </select>
                </div>
            ))}
        </div>
    ))
}));

describe("Filters", () => {
    const mockDispatch = vi.fn();

    const mockData: AllIndicators[] = [
        {
            sndi: "SNDI1",
            domaine: "Domaine1",
            domaineFonc: "DomaineFonc1"
        },
        {
            sndi: "SNDI2",
            domaine: "Domaine2",
            domaineFonc: "DomaineFonc2"
        },
        {
            sndi: "SNDI1",
            domaine: "Domaine1",
            domaineFonc: "DomaineFonc2"
        },
        {
            sndi: "SNDI2",
            domaine: "Domaine1",
            domaineFonc: "DomaineFonc1"
        }
    ];

    const defaultState: FilterState = {
        serviceDev: "",
        domaineDev: "",
        domaineFonc: ""
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("devrait afficher les trois filtres", () => {
        render(<Filters state={defaultState} dispatch={mockDispatch} data={mockData} />);

        expect(screen.getByText("Service developpement")).toBeInTheDocument();
        expect(screen.getByText("Domaine developpement")).toBeInTheDocument();
        expect(screen.getByText("Domaine Fonctionnel")).toBeInTheDocument();
    });

    it("devrait dispatcher SET_SERVICE_DEV lors du changement", async () => {
        const user = userEvent.setup();

        render(<Filters state={defaultState} dispatch={mockDispatch} data={mockData} />);

        const select = screen.getByTestId("select-Service developpement");
        await user.selectOptions(select, "SNDI1");

        expect(mockDispatch).toHaveBeenCalledWith({
            type: "SET_SERVICE_DEV",
            payload: "SNDI1"
        });
    });

    it("devrait dispatcher SET_DOMAINE_DEV lors du changement", async () => {
        const user = userEvent.setup();

        render(<Filters state={defaultState} dispatch={mockDispatch} data={mockData} />);

        const select = screen.getByTestId("select-Domaine developpement");
        await user.selectOptions(select, "Domaine1");

        expect(mockDispatch).toHaveBeenCalledWith({
            type: "SET_DOMAINE_DEV",
            payload: "Domaine1"
        });
    });

    it("devrait dispatcher SET_DOMAINE_FONC lors du changement", async () => {
        const user = userEvent.setup();

        render(<Filters state={defaultState} dispatch={mockDispatch} data={mockData} />);

        const select = screen.getByTestId("select-Domaine Fonctionnel");
        await user.selectOptions(select, "DomaineFonc1");

        expect(mockDispatch).toHaveBeenCalledWith({
            type: "SET_DOMAINE_FONC",
            payload: "DomaineFonc1"
        });
    });

    describe("Filtrage des données pour Service dev.", () => {
        it("devrait filtrer par domaineDev quand il est défini", async () => {
            const stateWithDomaineDev: FilterState = {
                ...defaultState,
                domaineDev: "Domaine1"
            };

            render(<Filters state={stateWithDomaineDev} dispatch={mockDispatch} data={mockData} />);

            const SelectedFiltersLayout = vi.mocked(
                (await import("components/filtersLayout/SelectedFiltersLayout")).SelectedFiltersLayout
            );

            expect(SelectedFiltersLayout).toHaveBeenCalled();
            const lastCall = SelectedFiltersLayout.mock.calls.at(-1)!;
            const serviceFilter = lastCall[0].filters[0];

            expect(serviceFilter.dataFilter).toHaveLength(3);
        });

        it("devrait filtrer par domaineFonc quand il est défini", async () => {
            const stateWithDomaineFonc: FilterState = {
                ...defaultState,
                domaineFonc: "DomaineFonc1"
            };

            render(<Filters state={stateWithDomaineFonc} dispatch={mockDispatch} data={mockData} />);

            const SelectedFiltersLayout = vi.mocked(
                (await import("components/filtersLayout/SelectedFiltersLayout")).SelectedFiltersLayout
            );

            const lastCall = SelectedFiltersLayout.mock.calls.at(-1)!;
            const serviceFilter = lastCall[0].filters[0];

            expect(serviceFilter.dataFilter).toHaveLength(2);
        });

        it("devrait filtrer par les deux quand domaineDev et domaineFonc sont définis", async () => {
            const stateWithBoth: FilterState = {
                ...defaultState,
                domaineDev: "Domaine1",
                domaineFonc: "DomaineFonc1"
            };

            render(<Filters state={stateWithBoth} dispatch={mockDispatch} data={mockData} />);

            const SelectedFiltersLayout = vi.mocked(
                (await import("components/filtersLayout/SelectedFiltersLayout")).SelectedFiltersLayout
            );

            const lastCall = SelectedFiltersLayout.mock.calls.at(-1)!;
            const serviceFilter = lastCall[0].filters[0];

            expect(serviceFilter.dataFilter).toHaveLength(2);
        });
    });

    describe("Filtrage des données pour Domaine dev.", () => {
        it("devrait filtrer par serviceDev quand il est défini", async () => {
            const stateWithServiceDev: FilterState = {
                ...defaultState,
                serviceDev: "SNDI1"
            };

            render(<Filters state={stateWithServiceDev} dispatch={mockDispatch} data={mockData} />);

            const SelectedFiltersLayout = vi.mocked(
                (await import("components/filtersLayout/SelectedFiltersLayout")).SelectedFiltersLayout
            );

            const lastCall = SelectedFiltersLayout.mock.calls.at(-1)!;
            const domaineFilter = lastCall[0].filters[1];

            expect(domaineFilter.dataFilter).toHaveLength(2);
        });

        it("devrait filtrer par domaineFonc quand il est défini", async () => {
            const stateWithDomaineFonc: FilterState = {
                ...defaultState,
                domaineFonc: "DomaineFonc2"
            };

            render(<Filters state={stateWithDomaineFonc} dispatch={mockDispatch} data={mockData} />);

            const SelectedFiltersLayout = vi.mocked(
                (await import("components/filtersLayout/SelectedFiltersLayout")).SelectedFiltersLayout
            );

            const lastCall = SelectedFiltersLayout.mock.calls.at(-1)!;
            const domaineFilter = lastCall[0].filters[1];

            expect(domaineFilter.dataFilter).toHaveLength(2);
        });
    });

    describe("Filtrage des données pour Domaine Fonct.", () => {
        it("devrait filtrer par serviceDev quand il est défini", async () => {
            const stateWithServiceDev: FilterState = {
                ...defaultState,
                serviceDev: "SNDI2"
            };

            render(<Filters state={stateWithServiceDev} dispatch={mockDispatch} data={mockData} />);

            const SelectedFiltersLayout = vi.mocked(
                (await import("components/filtersLayout/SelectedFiltersLayout")).SelectedFiltersLayout
            );

            const lastCall = SelectedFiltersLayout.mock.calls.at(-1)!;
            const domaineFoncFilter = lastCall[0].filters[2];

            expect(domaineFoncFilter.dataFilter).toHaveLength(2);
        });

        it("devrait filtrer par domaineDev quand il est défini", async () => {
            const stateWithDomaineDev: FilterState = {
                ...defaultState,
                domaineDev: "Domaine2"
            };

            render(<Filters state={stateWithDomaineDev} dispatch={mockDispatch} data={mockData} />);

            const SelectedFiltersLayout = vi.mocked(
                (await import("components/filtersLayout/SelectedFiltersLayout")).SelectedFiltersLayout
            );

            const lastCall = SelectedFiltersLayout.mock.calls.at(-1)!;
            const domaineFoncFilter = lastCall[0].filters[2];

            expect(domaineFoncFilter.dataFilter).toHaveLength(1);
        });
    });

    it("devrait utiliser getValue correctement pour chaque filtre", async () => {
        render(<Filters state={defaultState} dispatch={mockDispatch} data={mockData} />);

        const SelectedFiltersLayout = vi.mocked(
            (await import("components/filtersLayout/SelectedFiltersLayout")).SelectedFiltersLayout
        );

        const lastCall = SelectedFiltersLayout.mock.calls.at(-1)!;
        const filters = lastCall[0].filters;

        // Tester getValue pour chaque filtre
        expect(filters[0].getValue(mockData[0])).toBe("SNDI1");
        expect(filters[1].getValue(mockData[0])).toBe("Domaine1");
        expect(filters[2].getValue(mockData[0])).toBe("DomaineFonc1");
    });

    it("devrait recalculer les filtres quand les données changent", async () => {
        const { rerender } = render(
            <Filters state={defaultState} dispatch={mockDispatch} data={mockData} />
        );

        const newData: AllIndicators[] = [
            {
                sndi: "SNDI3",
                domaine: "Domaine3",
                domaineFonc: "DomaineFonc3"
            }
        ];

        rerender(<Filters state={defaultState} dispatch={mockDispatch} data={newData} />);

        const SelectedFiltersLayout = vi.mocked(
            (await import("components/filtersLayout/SelectedFiltersLayout")).SelectedFiltersLayout
        );

        const lastCall = SelectedFiltersLayout.mock.calls.at(-1)!;
        const serviceFilter = lastCall[0].filters[0];

        expect(serviceFilter.dataFilter).toHaveLength(1);
        expect(serviceFilter.getValue(newData[0])).toBe("SNDI3");
    });

    it("devrait gérer les données vides", async () => {
        render(<Filters state={defaultState} dispatch={mockDispatch} data={[]} />);

        const SelectedFiltersLayout = vi.mocked(
            (await import("components/filtersLayout/SelectedFiltersLayout")).SelectedFiltersLayout
        );

        const lastCall = SelectedFiltersLayout.mock.calls.at(-1)!;
        const filters = lastCall[0].filters;

        expect(filters[0].dataFilter).toHaveLength(0);
        expect(filters[1].dataFilter).toHaveLength(0);
        expect(filters[2].dataFilter).toHaveLength(0);
    });
});
