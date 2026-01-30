import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFilterContext } from "store/filterContext";
import { getModules1, listerModulesA11y } from "todos-api/client.gen";
import { A11yIndicateurTable } from "pages/indicateurs/a11y/A11yIndicateur";
import * as a11yConfig from "pages/indicateurs/a11y/a11yConfig";

vi.mock("store/filterContext");
vi.mock("todos-api/client.gen");
vi.mock("pages/indicateurs/a11y/a11yConfig", () => ({
    columnsTable: vi.fn(() => [
        { id: "modName", header: "Module" },
        { id: "score", header: "Score" }
    ]),
    formatIndicateur: vi.fn((mod, module) => ({
        modName: mod.modName,
        score: mod.score,
        sndi: module?.sndi || "Unknown",
        domaine: module?.domaine || "Unknown",
        domaineFonc: module?.domaineFonc || "Unknown"
    })),
    OnExport: vi.fn(),
    paginationConfig: { pageSize: 10 }
}));

vi.mock("components/TablePageLayout", () => ({
    default: vi.fn(({ titleTable, data, isLoading }) => (
        <div data-testid="table-layout">
            <h1>{titleTable}</h1>
            <div data-testid="filters">Filters</div>
            {isLoading && <div>Chargement...</div>}
            {!isLoading && <div data-testid="table-data">{JSON.stringify(data)}</div>}
        </div>
    ))
}));

vi.mock("components/ButtonCsvExport", () => ({
    default: vi.fn(() => <button>Export CSV</button>)
}));

vi.mock("utils/filters-functions", () => ({
    applyDevFilters: vi.fn(() => true)
}));

// Test data
const mockModulesA11y = [
    { modName: "Module1", score: 85 },
    { modName: "Module2", score: 92 },
    { modName: "Module3", score: 78 }
];

const mockModules = [
    { modName: "Module1", sndi: "SNDI1", domaine: "Domaine1", domaineFonc: "DomaineFonc1" },
    { modName: "Module2", sndi: "SNDI2", domaine: "Domaine2", domaineFonc: "DomaineFonc2" },
    { modName: "Module3", sndi: "SNDI1", domaine: "Domaine1", domaineFonc: "DomaineFonc1" }
];

// Helper pour wrapper avec QueryClient
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0
            }
        }
    });

    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe("A11yIndicateurTable", () => {
    const mockDispatch = vi.fn();
    const mockState = {
        serviceDev: "",
        domaineDev: "",
        domaineFonc: "",
        appName: ""
    };

    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(useFilterContext).mockReturnValue({
            state: mockState,
            dispatch: mockDispatch
        });

        vi.mocked(listerModulesA11y).mockResolvedValue(mockModulesA11y);
        vi.mocked(getModules1).mockResolvedValue(mockModules);
    });

    it("devrait afficher le titre et les filtres", () => {
        render(<A11yIndicateurTable />, { wrapper: createWrapper() });

        expect(screen.getByText("Table Indicateur Accessibilité")).toBeInTheDocument();
        expect(screen.getByTestId("filters")).toBeInTheDocument();
    });

    it("devrait afficher le loader pendant le chargement", () => {
        render(<A11yIndicateurTable />, { wrapper: createWrapper() });

        expect(screen.getByText("Chargement...")).toBeInTheDocument();
    });

    it("devrait charger et afficher les données A11y", async () => {
        render(<A11yIndicateurTable />, { wrapper: createWrapper() });

        await waitFor(() => {
            expect(listerModulesA11y).toHaveBeenCalledTimes(1);
            expect(getModules1).toHaveBeenCalledTimes(1);
        });

        await waitFor(() => {
            expect(screen.queryByText("Chargement...")).not.toBeInTheDocument();
        });
    });

    it("devrait mapper correctement les modules avec leurs données", async () => {
        render(<A11yIndicateurTable />, { wrapper: createWrapper() });

        await waitFor(() => {
            expect(a11yConfig.formatIndicateur).toHaveBeenCalledTimes(3);
            expect(a11yConfig.formatIndicateur).toHaveBeenCalledWith(mockModulesA11y[0], mockModules[0]);
            expect(a11yConfig.formatIndicateur).toHaveBeenCalledWith(mockModulesA11y[1], mockModules[1]);
            expect(a11yConfig.formatIndicateur).toHaveBeenCalledWith(mockModulesA11y[2], mockModules[2]);
        });
    });

    it("devrait gérer les modules sans correspondance avec Unknown", async () => {
        const modulesA11yWithUnknown = [...mockModulesA11y, { modName: "UnknownModule", score: 50 }];

        vi.mocked(listerModulesA11y).mockResolvedValue(modulesA11yWithUnknown);

        render(<A11yIndicateurTable />, { wrapper: createWrapper() });

        await waitFor(() => {
            expect(a11yConfig.formatIndicateur).toHaveBeenCalledTimes(4);
            expect(a11yConfig.formatIndicateur).toHaveBeenCalledWith(
                { modName: "UnknownModule", score: 50 },
                undefined
            );
        });
    });

    it("devrait gérer les erreurs lors du chargement des données A11y", async () => {
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        const errorMessage = "Erreur API A11y";

        vi.mocked(listerModulesA11y).mockRejectedValue(new Error(errorMessage));

        render(<A11yIndicateurTable />, { wrapper: createWrapper() });

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                "Erreur lors de la récupération des données A11y: ",
                expect.any(Error)
            );
        });

        consoleErrorSpy.mockRestore();
    });

    it("devrait gérer les erreurs lors du chargement des modules", async () => {
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        vi.mocked(getModules1).mockRejectedValue(new Error("Erreur API Modules"));

        render(<A11yIndicateurTable />, { wrapper: createWrapper() });

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                "Erreur lors de la récupération des données A11y: ",
                expect.any(Error)
            );
        });

        consoleErrorSpy.mockRestore();
    });

    it("devrait utiliser Promise.all pour charger les données en parallèle", async () => {
        const promiseAllSpy = vi.spyOn(Promise, "all");

        render(<A11yIndicateurTable />, { wrapper: createWrapper() });

        await waitFor(() => {
            expect(promiseAllSpy).toHaveBeenCalled();
        });

        promiseAllSpy.mockRestore();
    });

    it("devrait créer une Map des modules avec modName comme clé", async () => {
        render(<A11yIndicateurTable />, { wrapper: createWrapper() });

        await waitFor(() => {
            expect(a11yConfig.formatIndicateur).toHaveBeenNthCalledWith(
                1,
                mockModulesA11y[0],
                mockModules[0]
            );
        });
    });

    it("devrait initialiser les colonnes via useMemo une seule fois", async () => {
        const { rerender } = render(<A11yIndicateurTable />, { wrapper: createWrapper() });

        await waitFor(() => {
            expect(a11yConfig.columnsTable).toHaveBeenCalledTimes(1);
        });

        rerender(<A11yIndicateurTable />);

        expect(a11yConfig.columnsTable).toHaveBeenCalledTimes(1);
    });

    it("devrait retourner un tableau vide en cas d'erreur", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        vi.mocked(listerModulesA11y).mockRejectedValue(new Error("Erreur"));

        render(<A11yIndicateurTable />, { wrapper: createWrapper() });

        await waitFor(() => {
            const tableData = screen.getByTestId("table-data");
            expect(tableData.textContent).toBe("[]");
        });
    });

    it("devrait passer les bonnes props à TablePageLayout après le chargement", async () => {
        const TablePageLayoutMock = vi.mocked(await import("components/TablePageLayout")).default;

        render(<A11yIndicateurTable />, { wrapper: createWrapper() });

        await waitFor(() => {
            expect(screen.queryByText("Chargement...")).not.toBeInTheDocument();
        });

        const lastCall = TablePageLayoutMock.mock.calls[TablePageLayoutMock.mock.calls.length - 1];

        expect(lastCall[0]).toMatchObject({
            titleTable: "Table Indicateur Accessibilité",
            isLoading: false,
            paginationConfig: a11yConfig.paginationConfig
        });

        expect(lastCall[0].columns).toHaveLength(2);
        expect(lastCall[0].data).toHaveLength(3);
        expect(typeof lastCall[0].rowId).toBe("function");
        expect(typeof lastCall[0].renderTopCustom).toBe("function");
    });
});
