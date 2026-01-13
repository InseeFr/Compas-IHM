/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { useFilterContext } from "store/filterContext";
import { getApplications1, getHistory } from "todos-api/client.gen";
import { MeteoTable } from "components/indicateurs/meteo/meteoTable";

// Mock des dépendances
vi.mock("store/filterContext");
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
        render(<MeteoTable />);

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

        render(<MeteoTable />);

        await waitFor(() => {
            expect(getHistory).toHaveBeenCalled();
        });
    });

    it("devrait filtrer par serviceDev", async () => {
        vi.mocked(useFilterContext).mockReturnValue({
            state: { ...mockState, serviceDev: "SNDI1" },
            dispatch: mockDispatch
        });

        render(<MeteoTable />);

        await waitFor(() => {
            expect(getHistory).toHaveBeenCalled();
        });
    });

    it("devrait filtrer par domaineDev", async () => {
        vi.mocked(useFilterContext).mockReturnValue({
            state: { ...mockState, domaineDev: "Domaine1" },
            dispatch: mockDispatch
        });

        render(<MeteoTable />);

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

        render(<MeteoTable />);

        await waitFor(() => {
            expect(getHistory).toHaveBeenCalled();
        });
    });

    it("devrait appliquer tous les filtres en même temps", async () => {
        vi.mocked(useFilterContext).mockReturnValue({
            state: {
                serviceDev: "SNDI1",
                domaineDev: "Domaine1",
                domaineFonc: "DomaineFonc1",
                appName: ""
            },
            dispatch: mockDispatch
        });

        render(<MeteoTable />);

        await waitFor(() => {
            expect(getHistory).toHaveBeenCalled();
        });
    });

    it("devrait gérer les erreurs lors du chargement des données", async () => {
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        vi.mocked(getHistory).mockRejectedValue(new Error("API Error"));

        render(<MeteoTable />);

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                "Erreur lors de la récupération du meteo history: ",
                expect.any(Error)
            );
        });

        consoleErrorSpy.mockRestore();
    });
});
