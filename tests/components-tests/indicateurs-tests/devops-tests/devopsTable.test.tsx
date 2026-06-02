/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DevopsIndicateurTable } from "pages/indicateurs/devops/DevopsIndicateur";
import { FilterProvider } from "store/filterContext";
import * as devopsConfig from "pages/indicateurs/devops/devopsConfig";
import { getApplications2, getModules2 } from "todos-api/client.gen";
import { useQueryIndicators } from "hooks/useQueryIndicators";

vi.mock("todos-api/client.gen", () => ({
    getApplications2: vi.fn(),
    getModules2: vi.fn()
}));

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

vi.mock("components/ButtonCsvExport", () => ({
    default: ({ onExport }: any) => <button onClick={() => onExport("mockTable")}>Export CSV</button>
}));

vi.mock("@tanstack/react-router", async () => {
    return {
        Link: ({ to, children, ...rest }: any) => (
            <a href={to} {...rest}>
                {children}
            </a>
        )
    };
});

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

vi.mock("utils/group-module-by-apps", () => ({
    groupModulesByApp: vi.fn(() => ({}))
}));

vi.mock("pages/indicateurs/devops/devopsConfig", () => ({
    columnsTable: vi.fn(() => []),
    formatIndicateur: vi.fn((x: any) => x),
    onExport: vi.fn(),
    paginationConfig: {}
}));

const mockApps = [{ applicationName: "App1" }, { applicationName: "App2" }];
const mockModules = [{ applicationName: "Module1", isModule: true, parentApplication: "App1" }];

vi.mock("hooks/useQueryIndicators", () => ({
    useQueryIndicators: vi.fn()
}));
describe("DevopsIndicateurTable", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useQueryIndicators as any).mockReturnValue({
            data: [...mockApps, ...mockModules],
            filteredData: mockApps,
            modulesByApp: { App1: [mockModules[0]] },
            isLoading: false
        });
    });

    it("affiche les applications (hors modules) après le fetch", () => {
        (useQueryIndicators as any).mockReturnValue({
            data: [...mockApps, ...mockModules],
            filteredData: mockApps, // les modules sont filtrés par le composant
            modulesByApp: { App1: [mockModules[0]] },
            isLoading: false
        });

        render(
            <FilterProvider>
                <DevopsIndicateurTable />
            </FilterProvider>
        );

        expect(screen.getByText("App1")).toBeDefined();
        expect(screen.getByText("App2")).toBeDefined();
        // Module1 est filtré par filteredData.filter(item => item.isModule ? null : item)
        expect(screen.queryByText("Module1")).toBeNull();
    });

    it("affiche un état de chargement (isLoading = true)", () => {
        (useQueryIndicators as any).mockReturnValue({
            data: [],
            filteredData: [],
            modulesByApp: {},
            isLoading: true
        });

        render(
            <FilterProvider>
                <DevopsIndicateurTable />
            </FilterProvider>
        );

        // Aucune application ne doit être affichée pendant le chargement
        expect(screen.queryByText("App1")).toBeNull();
    });

    it("affiche une liste vide si filteredData est vide", () => {
        (useQueryIndicators as any).mockReturnValue({
            data: [],
            filteredData: [],
            modulesByApp: {},
            isLoading: false
        });

        render(
            <FilterProvider>
                <DevopsIndicateurTable />
            </FilterProvider>
        );

        expect(screen.queryByText("App1")).toBeNull();
        expect(screen.queryByText("Module1")).toBeNull();
    });

    // ── Export CSV ────────────────────────────────────────────────────────────

    it("appelle onExport avec la table quand on clique sur Export CSV", () => {
        (useQueryIndicators as any).mockReturnValue({
            data: mockApps,
            filteredData: mockApps,
            modulesByApp: {},
            isLoading: false
        });

        render(
            <FilterProvider>
                <DevopsIndicateurTable />
            </FilterProvider>
        );

        fireEvent.click(screen.getByText("Export CSV"));
        expect(devopsConfig.onExport).toHaveBeenCalledWith("mockTable");
    });

    // ── fetchData (testé via useQueryIndicators) ──────────────────────────────

    it("fetchData appelle getApplications2 et getModules2 et formate les résultats", async () => {
        (getApplications2 as any).mockResolvedValue(mockApps);
        (getModules2 as any).mockResolvedValue(mockModules);

        let capturedFetchData: (() => Promise<any>) | undefined;

        (useQueryIndicators as any).mockImplementation(({ fetchData }: any) => {
            capturedFetchData = fetchData;
            return { data: [], filteredData: [], modulesByApp: {}, isLoading: false };
        });

        render(
            <FilterProvider>
                <DevopsIndicateurTable />
            </FilterProvider>
        );

        // On exécute directement la fetchData passée à useQueryIndicators
        const result = await capturedFetchData!();

        expect(getApplications2).toHaveBeenCalledOnce();
        expect(getModules2).toHaveBeenCalledOnce();
        // formatIndicateur appelé pour chaque app et chaque module
        expect(devopsConfig.formatIndicateur).toHaveBeenCalledTimes(
            mockApps.length + mockModules.length
        );
        // Les modules sont formatés avec isModule = true
        expect(devopsConfig.formatIndicateur).toHaveBeenCalledWith(mockModules[0], true);
        // Le résultat est la concaténation apps + modules formatés
        expect(result).toHaveLength(mockApps.length + mockModules.length);
    });

    it("fetchData retourne [] et log une erreur si le fetch échoue", async () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        const fetchError = new Error("Network error");

        (getApplications2 as any).mockRejectedValue(fetchError);
        (getModules2 as any).mockResolvedValue([]);

        let capturedFetchData: (() => Promise<any>) | undefined;

        (useQueryIndicators as any).mockImplementation(({ fetchData }: any) => {
            capturedFetchData = fetchData;
            return { data: [], filteredData: [], modulesByApp: {}, isLoading: false };
        });

        render(
            <FilterProvider>
                <DevopsIndicateurTable />
            </FilterProvider>
        );

        const result = await capturedFetchData!();

        expect(result).toEqual([]);
        expect(consoleSpy).toHaveBeenCalledWith(
            "Erreur lors de la récupération des données :",
            fetchError
        );

        consoleSpy.mockRestore();
    });

    // ── rowId ─────────────────────────────────────────────────────────────────

    it("useQueryIndicators est appelé avec le bon queryKey et hasModules", () => {
        (useQueryIndicators as any).mockReturnValue({
            data: [],
            filteredData: [],
            modulesByApp: {},
            isLoading: false
        });

        render(
            <FilterProvider>
                <DevopsIndicateurTable />
            </FilterProvider>
        );

        expect(useQueryIndicators).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: ["DevopsIndicator", "02/06/2026", "01/05/2026"],
                hasModules: true
            })
        );
    });
    it("gère une erreur lors du fetch des indicateurs devops", async () => {
        const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

        (useQueryIndicators as any).mockReturnValue({
            data: undefined,
            filteredData: [],
            modulesByApp: {},
            isLoading: false
        });

        render(<DevopsIndicateurTable />);

        expect(devopsConfig.formatIndicateur).not.toHaveBeenCalled();

        expect(screen.queryByText("App1")).toBeNull();
        expect(screen.queryByText("Mod1")).toBeNull();

        consoleSpy.mockRestore();
    });
});
