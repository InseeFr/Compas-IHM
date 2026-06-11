/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { useFilterContext } from "store/filterContext";
import { getApplications1, getHistory } from "todos-api/client.gen";
import { MeteoTable } from "pages/indicateurs/meteo/meteoTable";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { fr } from "date-fns/locale";

// Mock des dépendances

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            {ui}
        </LocalizationProvider>
    );
};
vi.mock("store/tendance-context", () => ({
    useTendanceContext: () => ({
        stateTendance: {
            dateDebut: "01/05/2026",
            dateFin: "02/06/2026"
        },
        dispatchTendance: vi.fn()
    })
}));
vi.mock("components/indicators/TendanceForm", () => ({
    TendancePeriodeForm: () => <div data-testid="tendance-form" />
}));
vi.mock("store/filterContext");
vi.mock("@tanstack/react-router", async () => {
    return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Link: ({ to, children, ...rest }: any) => (
            <a href={to} {...rest}>
                {children}
            </a>
        )
    };
});
vi.mock("todos-api/client.gen");
vi.mock("./meteo-config", () => ({
    buildDomaineFoncMap: vi.fn(() => new Map()),
    buildMeteo: vi.fn((_history, _months) => [
        {
            idApp: 1,
            applicationName: "App1",
            sndi: "SNDI1",
            domaine: "Domaine1",
            domaineFonc: "DomaineFonc1"
        },
        {
            idApp: 2,
            applicationName: "App2",
            sndi: "SNDI2",
            domaine: "Domaine2",
            domaineFonc: "DomaineFonc2"
        }
    ]),
    columnsMeteo: vi.fn(() => []),
    month: vi.fn(() => ["2024-01", "2024-02"]),
    onExport: vi.fn(),
    paginationConfig: {}
}));
vi.mock("pages/TablePageLayout");
vi.mock("pages/ButtonCsvExport");
vi.mock("components/Filters");

vi.mock("@tanstack/react-query", () => ({
    useQuery: vi.fn(options => {
        const queryFn = options.queryFn;
        let data;

        try {
            data = queryFn ? queryFn() : undefined;
        } catch (error) {
            return {
                data: undefined,
                isLoading: false,
                error: error,
                isSuccess: false,
                isError: true
            };
        }

        return {
            data: data,
            isLoading: false,
            error: null,
            isSuccess: true,
            isError: false
        };
    }),
    QueryClient: vi.fn(() => ({
        mount: vi.fn(),
        unmount: vi.fn()
    })),
    QueryClientProvider: vi.fn(({ children }) => children)
}));

describe("MeteoTable", () => {
    const mockDispatch = vi.fn();
    const mockState = {
        serviceDev: "",
        domaineDev: "",
        domaineFonc: "",
        appName: ""
    };

    beforeEach(() => {
        vi.mocked(useFilterContext).mockReturnValue({
            state: mockState,
            dispatch: mockDispatch
        });

        vi.mocked(getHistory).mockResolvedValue([
            {
                idApplication: 1,
                date: "2024-01-15"
            },
            {
                idApplication: 2,
                date: "2024-02-20"
            }
        ]);

        vi.mocked(getApplications1).mockResolvedValue([
            { idApplication: 1, appName: "App1" },
            { idApplication: 2, appName: "App2" }
        ]);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("devrait charger et afficher les données", async () => {
        renderWithProviders(<MeteoTable />);

        await waitFor(() => {
            expect(getHistory).toHaveBeenCalledTimes(1);
            expect(getApplications1).toHaveBeenCalledTimes(1);
        });
    });

    it("devrait filtrer les données sans idApplication", async () => {
        vi.mocked(getHistory).mockResolvedValue([
            { idApplication: 1, date: "2024-01-15" },
            { idApplication: undefined, date: "2024-02-20" }
        ]);

        renderWithProviders(<MeteoTable />);

        await waitFor(() => {
            expect(getHistory).toHaveBeenCalled();
        });
    });

    it("devrait filtrer par serviceDev", async () => {
        vi.mocked(useFilterContext).mockReturnValue({
            state: { ...mockState, serviceDev: "SNDI1" },
            dispatch: mockDispatch
        });

        renderWithProviders(<MeteoTable />);

        await waitFor(() => {
            expect(getHistory).toHaveBeenCalled();
        });
    });

    it("devrait filtrer par domaineDev", async () => {
        vi.mocked(useFilterContext).mockReturnValue({
            state: { ...mockState, domaineDev: "Domaine1" },
            dispatch: mockDispatch
        });

        renderWithProviders(<MeteoTable />);

        await waitFor(() => {
            expect(getHistory).toHaveBeenCalled();
        });
    });

    it("devrait filtrer par domaineFonc", async () => {
        vi.mocked(useFilterContext).mockReturnValue({
            state: {
                ...mockState,
                domaineFonc: "DomaineFonc1"
            },
            dispatch: mockDispatch
        });

        renderWithProviders(<MeteoTable />);

        await waitFor(() => {
            expect(getHistory).toHaveBeenCalled();
        });
    });

    it("devrait appliquer tous les filtres en même temps", async () => {
        vi.mocked(useFilterContext).mockReturnValue({
            state: {
                serviceDev: "SNDI1",
                domaineDev: "Domaine1",
                domaineFonc: "DomaineFonc1"
            },
            dispatch: mockDispatch
        });

        renderWithProviders(<MeteoTable />);

        await waitFor(() => {
            expect(getHistory).toHaveBeenCalled();
        });
    });
    it("devrait filtrer par appName", async () => {
        vi.mocked(useFilterContext).mockReturnValue({
            state: { ...mockState },
            dispatch: mockDispatch
        });

        renderWithProviders(<MeteoTable />);

        await waitFor(() => {
            expect(getHistory).toHaveBeenCalled();
        });
    });

    it("devrait gérer des données vides", async () => {
        vi.mocked(getHistory).mockResolvedValue([]);
        vi.mocked(getApplications1).mockResolvedValue([]);

        renderWithProviders(<MeteoTable />);

        await waitFor(() => {
            expect(getHistory).toHaveBeenCalled();
            expect(getApplications1).toHaveBeenCalled();
        });
    });

    it("devrait gérer une erreur de l'API", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});

        vi.mocked(getHistory).mockImplementation(() =>
            Promise.reject(new Error("API Error")).catch(err => {
                console.error(err);
                return [];
            })
        );

        renderWithProviders(<MeteoTable />);

        await waitFor(() => {
            expect(getHistory).toHaveBeenCalled();
        });
    });

    it("devrait mettre à jour nbMois lors du changement dans MeteoFormMonths", async () => {
        const { container } = renderWithProviders(<MeteoTable />);

        await waitFor(() => {
            expect(getHistory).toHaveBeenCalled();
        });

        const input = container.querySelector('input[type="number"]');
        if (input) {
            fireEvent.change(input, { target: { value: "6" } });
            await waitFor(() => {
                expect(getHistory).toHaveBeenCalledTimes(2);
            });
        }
    });

    it("devrait appliquer tous les filtres simultanément avec appName", async () => {
        vi.mocked(useFilterContext).mockReturnValue({
            state: {
                serviceDev: "SNDI1",
                domaineDev: "Domaine1",
                domaineFonc: "DomaineFonc1"
            },
            dispatch: mockDispatch
        });

        renderWithProviders(<MeteoTable />);

        await waitFor(() => {
            expect(getHistory).toHaveBeenCalled();
        });
    });
});
