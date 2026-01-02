/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import QualiteIndicateurTable from "components/indicateurs/qualité/QualiteIndicateur";
import * as clientApi from "todos-api/client.gen";
import * as exportCsv from "utils/exportCsv";
import { useFilterContext } from "store/filterContext";
import * as groupModuleUtils from "utils/group-module-by-apps";

vi.mock("store/filterContext", () => ({
    useFilterContext: vi.fn()
}));

vi.mock("utils/exportCsv", () => ({
    handleExportCsv: vi.fn()
}));

vi.mock("todos-api/client.gen", () => ({
    getIndicateurQualiteByApplication: vi.fn(),
    getIndicateurQualiteByModule: vi.fn()
}));

const mockApps: clientApi.IndicateurQualiteView[] = [
    { applicationName: "App1", sndi: "S1", domaineSndi: "D1" }
];
const mockModules: clientApi.IndicateurQualiteView[] = [
    { applicationName: "App1", moduleName: "Mod1", sndi: "S1", domaineSndi: "D1" }
];

describe("QualiteIndicateurTable", () => {
    const dispatchMock = vi.fn();
    const stateMock = {};

    beforeEach(() => {
        vi.clearAllMocks();

        (useFilterContext as any).mockReturnValue({ state: stateMock, dispatch: dispatchMock });

        vi.mocked(clientApi.getIndicateurQualiteByApplication).mockResolvedValue(mockApps);
        vi.mocked(clientApi.getIndicateurQualiteByModule).mockResolvedValue(mockModules);

        vi.spyOn(groupModuleUtils, "groupModulesByApp").mockImplementation(data => ({
            App1: data.filter(d => d.isModule)
        }));
    });

    it("devrait retourner les données de qualité", async () => {
        const apps = await clientApi.getIndicateurQualiteByApplication();
        const modules = await clientApi.getIndicateurQualiteByModule();

        expect(apps).toEqual(mockApps);
        expect(modules).toEqual(mockModules);
    });

    it("renders table with fetched data", async () => {
        render(<QualiteIndicateurTable />);

        expect(await screen.findByText("Table Indicateur Qualité")).toBeDefined();

        expect(await screen.findByText("Nom")).toBeInTheDocument();
        expect(screen.getByText("Service dev.")).toBeInTheDocument();

        expect(await screen.findByText("App1")).toBeInTheDocument();
        expect(await screen.findByText("Mod1")).toBeInTheDocument();
    });

    it("exporte correctement les données en CSV", async () => {
        render(<QualiteIndicateurTable />);
        await screen.findByText("App1");

        const exportButton = screen.getByTestId("button-export-csv");
        exportButton.click();

        expect(exportCsv.handleExportCsv).toHaveBeenCalledTimes(1);

        const [filename, headers, csvData] = vi.mocked(exportCsv.handleExportCsv).mock.calls[0];

        expect(filename).toBe("qualité");
        expect(headers).toBeDefined();
        expect(Array.isArray(headers)).toBe(true);

        expect(csvData).toEqual([
            '"App1","","S1","D1","NR","NR","NR","NR","NR"',
            '"App1","Mod1","S1","D1","NR","NR","NR","NR","NR"'
        ]);
    });
});
