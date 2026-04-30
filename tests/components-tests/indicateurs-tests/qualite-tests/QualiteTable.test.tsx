/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import QualiteIndicateurTable from "pages/indicateurs/qualité/QualiteIndicateur";
import { useFilterContext } from "store/filterContext";
import * as clientApi from "todos-api/client.gen";
import * as qualiteConfig from "pages/indicateurs/qualité/qualiteConfig";
import * as groupModuleUtils from "utils/group-module-by-apps";
import { useQueryIndicators } from "hooks/useQueryIndicators";

vi.mock("store/filterContext", () => ({
    useFilterContext: vi.fn()
}));

vi.mock("@tanstack/react-router", () => ({
    Link: ({ to, children, ...rest }: any) => (
        <a href={to} {...rest}>
            {children}
        </a>
    )
}));

vi.mock("todos-api/client.gen", () => ({
    getIndicateurQualiteByApplication: vi.fn(),
    getIndicateurQualiteByModule: vi.fn()
}));

vi.mock("utils/group-module-by-apps", () => ({
    groupModulesByApp: vi.fn(() => ({}))
}));

vi.mock("components/TablePageLayout", () => ({
    default: ({ data, renderTopCustom }: any) => (
        <div>
            {renderTopCustom?.({ table: "mockTable" })}
            {data.map((item: any) => (
                <div key={item.applicationName}>{item.applicationName}</div>
            ))}
        </div>
    )
}));

vi.mock("components/ButtonCsvExport", () => ({
    default: ({ onExport }: any) => <button onClick={() => onExport("mockTable")}>Export CSV</button>
}));

vi.mock("pages/indicateurs/qualité/qualiteConfig", () => ({
    columnsTable: vi.fn(() => []),
    formatIndicateur: vi.fn((x: any, isModule = false) => ({ ...x, isModule })),
    OnExport: vi.fn(),
    paginationConfig: {}
}));

vi.mock("pages/Filters", () => ({
    Filters: () => <div data-testid="filters" />
}));

vi.mock("hooks/useQueryIndicators", () => ({
    useQueryIndicators: vi.fn()
}));

const mockApps = [
    { applicationName: "App1", sndi: "S1", domaineSndi: "D1", isModule: false },
    { applicationName: "App2", sndi: "S2", domaineSndi: "D2", isModule: false }
];
const mockModules = [
    { applicationName: "Mod1", sndi: "S1", domaineSndi: "D1", isModule: true, parentApplication: "App1" }
];

describe("QualiteIndicateurTable", () => {
    const stateMock = {};
    const dispatchMock = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useFilterContext as any).mockReturnValue({ state: stateMock, dispatch: dispatchMock });
        (clientApi.getIndicateurQualiteByApplication as any).mockResolvedValue(mockApps);
        (clientApi.getIndicateurQualiteByModule as any).mockResolvedValue(mockModules);
        vi.spyOn(groupModuleUtils, "groupModulesByApp").mockImplementation(data => ({
            App1: data.filter(d => d.isModule)
        }));
        (useQueryIndicators as any).mockReturnValue({
            data: [...mockApps, ...mockModules],
            filteredData: mockApps,
            modulesByApp: { App1: [mockModules[0]] },
            isLoading: false
        });
    });

    it("affiche les applications (hors modules) après le fetch", async () => {
        render(<QualiteIndicateurTable />);

        await waitFor(() => {
            expect(screen.getByText("App1")).toBeDefined();
        });

        expect(screen.queryByText("Mod1")).toBeNull();
    });

    it("affiche un état de chargement (isLoading = true)", () => {
        (useQueryIndicators as any).mockReturnValue({
            data: [],
            filteredData: [],
            modulesByApp: {},
            isLoading: true
        });

        render(<QualiteIndicateurTable />);

        expect(screen.queryByText("App1")).toBeNull();
    });

    it("affiche une liste vide si filteredData est vide", () => {
        (useQueryIndicators as any).mockReturnValue({
            data: [],
            filteredData: [],
            modulesByApp: {},
            isLoading: false
        });

        render(<QualiteIndicateurTable />);

        expect(screen.queryByText("App1")).toBeNull();
        expect(screen.queryByText("Mod1")).toBeNull();
    });

    it("appelle OnExport avec la table quand on clique sur Export CSV", async () => {
        render(<QualiteIndicateurTable />);

        const exportButton = await screen.findByText("Export CSV");
        fireEvent.click(exportButton);

        expect(qualiteConfig.OnExport).toHaveBeenCalledWith("mockTable");
    });

    it("fetchData appelle les deux endpoints et formate les résultats", async () => {
        let capturedFetchData: (() => Promise<any>) | undefined;

        (useQueryIndicators as any).mockImplementation(({ fetchData }: any) => {
            capturedFetchData = fetchData;
            return { data: [], filteredData: [], modulesByApp: {}, isLoading: false };
        });

        render(<QualiteIndicateurTable />);

        const result = await capturedFetchData!();

        expect(clientApi.getIndicateurQualiteByApplication).toHaveBeenCalledOnce();
        expect(clientApi.getIndicateurQualiteByModule).toHaveBeenCalledOnce();
        expect(qualiteConfig.formatIndicateur).toHaveBeenCalledTimes(
            mockApps.length + mockModules.length
        );
        // Les modules sont formatés avec isModule = true
        expect(qualiteConfig.formatIndicateur).toHaveBeenCalledWith(mockModules[0], true);
        // Le résultat concatène apps + modules
        expect(result).toHaveLength(mockApps.length + mockModules.length);
    });

    it("fetchData retourne [] et log une erreur si le fetch échoue", async () => {
        const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
        const fetchError = new Error("Network error");

        (clientApi.getIndicateurQualiteByApplication as any).mockRejectedValue(fetchError);

        let capturedFetchData: (() => Promise<any>) | undefined;

        (useQueryIndicators as any).mockImplementation(({ fetchData }: any) => {
            capturedFetchData = fetchData;
            return { data: [], filteredData: [], modulesByApp: {}, isLoading: false };
        });

        render(<QualiteIndicateurTable />);

        const result = await capturedFetchData!();

        expect(result).toEqual([]);
        expect(consoleSpy).toHaveBeenCalledWith(
            "Erreur lors de la récupération des données qualité: ",
            fetchError
        );

        consoleSpy.mockRestore();
    });

    it("useQueryIndicators est appelé avec le bon queryKey et hasModules", () => {
        render(<QualiteIndicateurTable />);

        expect(useQueryIndicators).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: ["QualiteIndicator","MOIS"],
                hasModules: true
            })
        );
    });
});
