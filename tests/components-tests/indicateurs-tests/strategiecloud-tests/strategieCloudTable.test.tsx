import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Type local pour les props de TablePageLayout ─────────────────────────────

type MockTablePageLayoutProps = {
    titleTable: string;
    isLoading: boolean;
    data: unknown[];
    fetch: () => Promise<unknown>;
    columns: unknown[];
    paginationConfig: unknown;
    rowId: (row: Record<string, unknown>) => string;
    subRow: (row: Record<string, unknown>) => unknown;
    filters: React.ReactNode;
    renderTopCustom?: (args: { table: unknown }) => React.ReactNode;
};

const { mockGetIndicateur, mockUseQueryIndicators, mockTablePageLayout } = vi.hoisted(() => ({
    mockGetIndicateur: vi.fn(),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mockUseQueryIndicators: vi.fn((_args: unknown) => ({
        data: [],
        isLoading: false,
        modulesByApp: {},
        filteredData: []
    })),
    mockTablePageLayout: vi.fn((props: MockTablePageLayoutProps) => (
        <div>
            <h1>{props.titleTable}</h1>
            {props.isLoading && <div data-testid="loading">Chargement...</div>}
            {props.renderTopCustom?.({ table: {} })}
            <button data-testid="button-refresh" onClick={props.fetch}>
                Rafraichir les données
            </button>
        </div>
    ))
}));

// ─── Mocks des modules ────────────────────────────────────────────────────────

// Vitest résout les alias : "todos-api/client.gen" et le chemin relatif pointent vers le même
// module canonique. On mocke l'alias (forme courte) qui est la clé de résolution finale.
vi.mock("todos-api/client.gen", () => ({
    getIndicateur: (...args: unknown[]) => mockGetIndicateur(...args)
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

vi.mock("pages/indicateurs/strategiecloud/strategieCloud-config", () => ({
    columnsTable: () => [],
    formatIndicateur: (item: { appName?: string }) => ({
        applicationName: item.appName ?? "NR",
        isModule: false,
        sndi: "NR",
        tauxCloud: "NR",
        envActuelProd: "NR",
        envCibleProd: "NR",
        ecartCible: "NR",
        stratCloud: "NR",
        commentaire: "NR",
        maturiteCloud: "NR",
        idModule: -1,
        idApp: -1,
        parentApplication: item.appName,
        domaine: "NR",
        domaineFonc: "NR"
    }),
    onExport: vi.fn(),
    paginationConfig: { pagination: { pageIndex: 0, pageSize: 30 } }
}));

vi.mock("store/filterContext", () => ({
    useFilterContext: () => ({
        state: { domaine: null, domaineFonc: null },
        dispatch: vi.fn()
    })
}));

vi.mock("pages/Filters", () => ({
    Filters: () => <div data-testid="filters" />
}));

// CORRECTION 2 : camelCase pour correspondre à l'import du composant
vi.mock("hooks/useQueryIndicators", () => ({
    useQueryIndicators: (args: unknown) => mockUseQueryIndicators(args)
}));

vi.mock("components/TablePageLayout", () => ({
    default: (props: MockTablePageLayoutProps) => mockTablePageLayout(props)
}));

// CORRECTION 3 : le mock reçoit aussi `table` comme le vrai composant
vi.mock("components/ButtonCsvExport", () => ({
    default: ({ onExport }: { table: unknown; onExport: () => void }) => (
        <button onClick={onExport} data-testid="btn-export">
            Exporter CSV
        </button>
    )
}));

vi.mock("components/RefreshButton", () => ({
    default: ({ refetch }: { refetch: () => Promise<unknown>; disabled: boolean }) => (
        <button onClick={refetch} data-testid="button-refresh">
            Rafraichir les données
        </button>
    )
}));

// ─── Import du composant (après les mocks) ────────────────────────────────────

import { StrategieCloudTable } from "pages/indicateurs/strategiecloud/strategieCloudTable";

// ─── Tests de rendu de base ───────────────────────────────────────────────────

describe("StrategieCloudTable", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetIndicateur.mockResolvedValue([]);
        mockUseQueryIndicators.mockReturnValue({
            data: [],
            isLoading: false,
            modulesByApp: {},
            filteredData: []
        });
        mockTablePageLayout.mockImplementation((props: MockTablePageLayoutProps) => (
            <div>
                <h1>{props.titleTable}</h1>
                {props.isLoading && <div data-testid="loading">Chargement...</div>}
                {props.renderTopCustom?.({ table: {} })}
            </div>
        ));
    });

    it("affiche le titre de la table", () => {
        render(<StrategieCloudTable />);
        expect(screen.getByText("Table Indicateur Stratégie Cloud")).toBeInTheDocument();
    });

    it("n'affiche pas le loader quand isLoading est false", () => {
        render(<StrategieCloudTable />);
        expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });

    it("affiche le bouton d'export CSV", () => {
        render(<StrategieCloudTable />);
        expect(screen.getByTestId("btn-export")).toBeInTheDocument();
    });
});

// ─── Tests état isLoading ─────────────────────────────────────────────────────

describe("StrategieCloudTable – état isLoading", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetIndicateur.mockResolvedValue([]);
        mockTablePageLayout.mockImplementation((props: MockTablePageLayoutProps) => (
            <div>
                <h1>{props.titleTable}</h1>
                {props.isLoading && <div data-testid="loading">Chargement...</div>}
                {props.renderTopCustom?.({ table: {} })}
            </div>
        ));
    });

    it("affiche le loader quand isLoading est true", () => {
        mockUseQueryIndicators.mockReturnValueOnce({
            data: [],
            isLoading: true,
            modulesByApp: {},
            filteredData: []
        });

        render(<StrategieCloudTable />);
        expect(screen.getByTestId("loading")).toBeInTheDocument();
    });
});

// ─── Tests de fetchData ───────────────────────────────────────────────────────

describe("fetchData dans StrategieCloudTable", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockTablePageLayout.mockImplementation((props: MockTablePageLayoutProps) => (
            <div>
                <h1>{props.titleTable}</h1>
                <button data-testid="button-refresh" onClick={props.fetch}>
                    Rafraichir les données
                </button>
            </div>
        ));
    });

    it("appelle getIndicateur et formate les données", async () => {
        const fakeItems = [
            { appName: "AppA", isModule: false },
            { appName: "AppB", isModule: false }
        ];
        mockGetIndicateur.mockResolvedValue(fakeItems);

        let capturedFetchData: (() => Promise<unknown>) | null = null;
        mockUseQueryIndicators.mockImplementationOnce((args: unknown) => {
            capturedFetchData = (args as { fetchData: () => Promise<unknown> }).fetchData;
            return { data: [], isLoading: false, modulesByApp: {}, filteredData: [] };
        });

        render(<StrategieCloudTable />);

        expect(capturedFetchData).not.toBeNull();
        const result = await capturedFetchData!();
        expect(mockGetIndicateur).toHaveBeenCalledOnce();
        expect(result).toHaveLength(2);
    });

    it("retourne [] et logue l'erreur si getIndicateur échoue", async () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        mockGetIndicateur.mockRejectedValue(new Error("API KO"));

        let capturedFetchData: (() => Promise<unknown>) | null = null;
        mockUseQueryIndicators.mockImplementationOnce((args: unknown) => {
            capturedFetchData = (args as { fetchData: () => Promise<unknown> }).fetchData;
            return { data: [], isLoading: false, modulesByApp: {}, filteredData: [] };
        });

        render(<StrategieCloudTable />);

        const result = await capturedFetchData!();
        expect(result).toEqual([]);
        expect(consoleSpy).toHaveBeenCalledWith(
            "Erreur lors de la récupération des données :",
            expect.any(Error)
        );

        consoleSpy.mockRestore();
    });

    it("Rafraichit les données via le bouton", async () => {
        mockGetIndicateur.mockResolvedValue([]);

        let capturedRefetch: (() => Promise<unknown>) | null = null;
        mockUseQueryIndicators.mockImplementationOnce((args: unknown) => {
            capturedRefetch = vi
                .fn()
                .mockImplementation((args as { fetchData: () => Promise<unknown> }).fetchData);
            return {
                data: [],
                isLoading: false,
                modulesByApp: {},
                filteredData: [],
                refetch: capturedRefetch
            };
        });

        render(<StrategieCloudTable />);

        const refreshButton = screen.getByTestId("button-refresh");
        fireEvent.click(refreshButton);

        await waitFor(() => {
            expect(capturedRefetch).toHaveBeenCalled();
            expect(mockGetIndicateur).toHaveBeenCalled();
        });
    });

    it("gère le cas où getIndicateur retourne null/undefined", async () => {
        mockGetIndicateur.mockResolvedValue(null);

        let capturedFetchData: (() => Promise<unknown>) | null = null;
        mockUseQueryIndicators.mockImplementationOnce((args: unknown) => {
            capturedFetchData = (args as { fetchData: () => Promise<unknown> }).fetchData;
            return { data: [], isLoading: false, modulesByApp: {}, filteredData: [] };
        });

        render(<StrategieCloudTable />);

        const result = await capturedFetchData!();
        expect(result).toEqual([]);
    });

    it("passe queryKey et hasModules corrects à useQueryIndicators", () => {
        mockUseQueryIndicators.mockReturnValueOnce({
            data: [],
            isLoading: false,
            modulesByApp: {},
            filteredData: []
        });

        render(<StrategieCloudTable />);

        expect(mockUseQueryIndicators).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: ["StrategieCloudIndicator"],
                hasModules: true
            })
        );
    });
});

// ─── Tests rowId et subRow ────────────────────────────────────────────────────

describe("rowId et subRow dans StrategieCloudTable", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetIndicateur.mockResolvedValue([]);
        mockUseQueryIndicators.mockReturnValue({
            data: [],
            isLoading: false,
            modulesByApp: {},
            filteredData: []
        });
    });

    it("passe une fonction rowId à TablePageLayout", () => {
        let capturedRowId: MockTablePageLayoutProps["rowId"] | null = null;

        mockTablePageLayout.mockImplementationOnce((props: MockTablePageLayoutProps) => {
            capturedRowId = props.rowId;
            return <div>{props.titleTable}</div>;
        });

        render(<StrategieCloudTable />);

        expect(capturedRowId).not.toBeNull();
        expect(
            capturedRowId!({ isModule: false, applicationName: "MonApp", parentApplication: "MonApp" })
        ).toBe("MonApp");
        expect(
            capturedRowId!({ isModule: true, applicationName: "MonModule", parentApplication: "MonApp" })
        ).toBe("MonApp-MonModule");
    });

    it("subRow retourne undefined pour un module", () => {
        let capturedSubRow: MockTablePageLayoutProps["subRow"] | null = null;

        mockTablePageLayout.mockImplementationOnce((props: MockTablePageLayoutProps) => {
            capturedSubRow = props.subRow;
            return <div>{props.titleTable}</div>;
        });

        render(<StrategieCloudTable />);

        expect(capturedSubRow).not.toBeNull();
        expect(capturedSubRow!({ isModule: true, applicationName: "MonModule" })).toBeUndefined();
    });

    it("subRow retourne les sous-modules pour une application", () => {
        const subModules = [{ applicationName: "Module1", isModule: true }];

        mockUseQueryIndicators.mockReturnValueOnce({
            data: [],
            isLoading: false,
            modulesByApp: { MonApp: subModules },
            filteredData: []
        });

        let capturedSubRow: MockTablePageLayoutProps["subRow"] | null = null;

        mockTablePageLayout.mockImplementationOnce((props: MockTablePageLayoutProps) => {
            capturedSubRow = props.subRow;
            return <div>{props.titleTable}</div>;
        });

        render(<StrategieCloudTable />);

        expect(capturedSubRow).not.toBeNull();
        expect(capturedSubRow!({ isModule: false, applicationName: "MonApp" })).toEqual(subModules);
    });
});
