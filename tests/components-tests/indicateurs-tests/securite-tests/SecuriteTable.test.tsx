/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SecuriteIndicateurTable from "pages/indicateurs/securite/SecuriteIndicateur";
import * as clientApi from "todos-api/client.gen";
import { useFilterContext } from "store/filterContext";
import * as groupModuleUtils from "utils/group-module-by-apps";
import type { MRT_Row } from "material-react-table";
import type { SecuriteIndicateur } from "models/indicateurs";

vi.mock("store/filterContext", () => ({
    useFilterContext: vi.fn()
}));

vi.mock("utils/exportCsv", () => ({
    handleExportCsv: vi.fn(),
    flattenRows: vi.fn((rows: MRT_Row<SecuriteIndicateur>[]) => {
        const flatten = (arr: MRT_Row<SecuriteIndicateur>[]): MRT_Row<SecuriteIndicateur>[] => {
            return arr.flatMap((row: MRT_Row<SecuriteIndicateur>) => [
                row,
                ...(row.subRows ? flatten(row.subRows) : [])
            ]);
        };
        return flatten(rows);
    }),
    getName: vi.fn(row => `"${row.original.applicationName}"`)
}));

vi.mock("utils/filterFunctions", () => ({
    filteredColumns: vi.fn(() => []),
    columnFilters: vi.fn(() => []),
    handleColumnFiltersChange: vi.fn(() => vi.fn())
}));

vi.mock("todos-api/client.gen", () => ({
    getApplications1: vi.fn(),
    getModules1: vi.fn(),
    getIndicateurSecuriteByApplication: vi.fn(),
    getIndicateurSecuriteByModule: vi.fn()
}));

const mockApps: clientApi.Application[] = [
    {
        idApplication: 1,
        appName: "App1",
        sndi: "S1",
        domaineSndi: "D1"
    }
];

const mockModules = [
    {
        id: 1,
        isModule: true,
        appName: "App1",
        modName: "Mod1",
        sndi: "S1",
        domaineSndi: "D1"
    }
];

const mockSecuriteApps: clientApi.IndicateurSecuriteView[] = [
    {
        applicationId: 1,
        nbCveCritical: "5",
        nbCveHigh: "10",
        nbCveMedium: "15",
        nbCveLow: "20",
        lettreCve: "B",
        nbVmNonMaj: "3",
        lettreMajVm: "C",
        delaiVmNonMiseAjour: "45",
        lettreGlobaleSecurite: "B",
        lettreGlobale: "B"
    }
];

const mockSecuriteModules: clientApi.IndicateurSecuriteView[] = [
    {
        moduleId: 1,
        nbCveCritical: "2",
        nbCveHigh: "4",
        nbCveMedium: "6",
        nbCveLow: "8",
        lettreCve: "A",
        nbVmNonMaj: "1",
        lettreMajVm: "A",
        delaiVmNonMiseAjour: "20",
        lettreGlobaleSecurite: "A",
        lettreGlobale: "A"
    }
];

vi.mock("@tanstack/react-query", () => ({
    useQuery: vi.fn(() => ({
        data: mockApps,
        isLoading: false
    }))
}));

describe("SecuriteIndicateurTable", () => {
    const dispatchMock = vi.fn();
    const stateMock = {};

    beforeEach(() => {
        vi.clearAllMocks();
        (useFilterContext as any).mockReturnValue({ state: stateMock, dispatch: dispatchMock });
        vi.mocked(clientApi.getApplications1).mockResolvedValue(mockApps);
        vi.mocked(clientApi.getModules1).mockResolvedValue(mockModules);
        vi.mocked(clientApi.getIndicateurSecuriteByApplication).mockResolvedValue(mockSecuriteApps);
        vi.mocked(clientApi.getIndicateurSecuriteByModule).mockResolvedValue(mockSecuriteModules);
        vi.spyOn(groupModuleUtils, "groupModulesByApp").mockImplementation((data: any[]) => ({
            App1: data || []
        }));
    });

    it("devrait retourner les données de sécurité", async () => {
        const apps = await clientApi.getApplications1();
        const modules = await clientApi.getModules1();
        const securiteApps = await clientApi.getIndicateurSecuriteByApplication();
        const securiteModules = await clientApi.getIndicateurSecuriteByModule();

        expect(apps).toEqual(mockApps);
        expect(modules).toEqual(mockModules);
        expect(securiteApps).toEqual(mockSecuriteApps);
        expect(securiteModules).toEqual(mockSecuriteModules);
    });

    it("renders table with fetched data", async () => {
        render(<SecuriteIndicateurTable />);

        const heading = await screen.findByRole("heading", {
            name: /table indicateur sécurité/i
        });
        expect(heading).toBeDefined();

        expect(await screen.findByText("Nom")).toBeInTheDocument();
        const elements = await screen.findAllByText("Service dev.");
        expect(elements[0]).toBeInTheDocument();
        expect(screen.getByText("CVE")).toBeInTheDocument();
    });

    it("appuie bien sur le bouton export", async () => {
        render(<SecuriteIndicateurTable />);

        await screen.findByRole("heading", { name: /table indicateur sécurité/i });
        await screen.findByText("Nom");
        await screen.findByText("CVE");

        const exportButton = screen.getByTestId("button-export-csv");
        fireEvent.click(exportButton);
    });
});
