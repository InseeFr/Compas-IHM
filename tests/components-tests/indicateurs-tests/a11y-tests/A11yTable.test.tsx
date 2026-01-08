/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { A11yIndicateurTable } from "components/indicateurs/a11y/A11yIndicateur";
import * as clientApi from "todos-api/client.gen";
import * as exportCsv from "utils/exportCsv";
import { useFilterContext } from "store/filterContext";
import type { MRT_Row } from "material-react-table";
import type { A11yIndicateur } from "models/indicateurs";

vi.mock("store/filterContext", () => ({
    useFilterContext: vi.fn()
}));

vi.mock("utils/exportCsv", () => ({
    handleExportCsv: vi.fn(),
    flattenRows: vi.fn((rows: MRT_Row<A11yIndicateur>[]) => {
        const flatten = (arr: MRT_Row<A11yIndicateur>[]): MRT_Row<A11yIndicateur>[] => {
            return arr.flatMap((row: MRT_Row<A11yIndicateur>) => [
                row,
                ...(row.subRows ? flatten(row.subRows) : [])
            ]);
        };
        return flatten(rows);
    })
}));

vi.mock("utils/filterFunctions", () => ({
    filteredColumns: vi.fn(() => []),
    columnFilters: vi.fn(() => []),
    handleColumnFiltersChange: vi.fn(() => vi.fn())
}));

vi.mock("todos-api/client.gen", () => ({
    listerModulesA11y: vi.fn()
}));

const mockModules: clientApi.IndicateursModuleA11Y[] = [
    {
        modName: "Module1",
        sndi: "S1",
        domaineSndi: "D1",
        notation: "A",
        lettreIssueAccessibilite: "B",
        nbIssueAccessibilite: "5.00"
    },
    {
        modName: "Module2",
        sndi: "S2",
        domaineSndi: "D2",
        notation: "C",
        lettreIssueAccessibilite: "D",
        nbIssueAccessibilite: "10.00"
    }
];

describe("A11yIndicateurTable", () => {
    const dispatchMock = vi.fn();
    const stateMock = {};

    beforeEach(() => {
        vi.clearAllMocks();
        (useFilterContext as any).mockReturnValue({ state: stateMock, dispatch: dispatchMock });
        vi.mocked(clientApi.listerModulesA11y).mockResolvedValue(mockModules);
    });

    it("devrait retourner les données A11y", async () => {
        const modules = await clientApi.listerModulesA11y();
        expect(modules).toEqual(mockModules);
    });

    it("renders table with fetched data", async () => {
        render(<A11yIndicateurTable />);

        const heading = await screen.findByRole("heading", {
            name: /table indicateur accessibilité/i
        });
        expect(heading).toBeDefined();

        expect(await screen.findByText("Nom du module")).toBeInTheDocument();
        expect(screen.getByText("Service dev.")).toBeInTheDocument();
        expect(screen.getByText("Issue Sonar")).toBeInTheDocument();
        expect(await screen.findByText("Module1")).toBeInTheDocument();
        expect(await screen.findByText("Module2")).toBeInTheDocument();
    });

    it("exporte correctement les données en CSV", async () => {
        render(<A11yIndicateurTable />);
        await screen.findByText("Module1");

        const exportButton = screen.getByTestId("button-export-csv");
        fireEvent.click(exportButton);

        expect(exportCsv.handleExportCsv).toHaveBeenCalledTimes(1);
        const [filename, headers, csvData] = vi.mocked(exportCsv.handleExportCsv).mock.calls[0];

        expect(filename).toBe("accessibilité");
        expect(headers).toBeDefined();
        expect(Array.isArray(headers)).toBe(true);

        expect(csvData).toEqual(['"Module1","S1","D1","A","B","5"', '"Module2","S2","D2","C","D","10"']);
    });

    it("gère les erreurs de récupération des données", async () => {
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        vi.mocked(clientApi.listerModulesA11y).mockRejectedValue(new Error("API Error"));

        render(<A11yIndicateurTable />);

        await vi.waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                "Erreur lors de la récupération des données A11y: ",
                expect.any(Error)
            );
        });

        consoleErrorSpy.mockRestore();
    });
});
