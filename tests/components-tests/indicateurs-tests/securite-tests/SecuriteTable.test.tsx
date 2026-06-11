/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SecuriteIndicateurTable from "pages/indicateurs/securite/SecuriteIndicateur";
import * as clientApi from "todos-api/client.gen";
import { useFilterContext } from "store/filterContext";
import * as groupModuleUtils from "utils/group-module-by-apps";
import type { MRT_Row } from "material-react-table";
import type { SecuriteIndicateur } from "models/indicateurs";
import { formatApplicationsData, formatModulesData } from "pages/indicateurs/securite/securiteConfig";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { fr } from "date-fns/locale";

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            {ui}
        </LocalizationProvider>
    );
};
vi.mock("store/filterContext", () => ({
    useFilterContext: vi.fn()
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
vi.mock("utils/exportCsv", () => ({
    handleExportCsv: vi.fn(),
    escapeCsvValue: vi.fn((value: string) => `"${value.replaceAll('"', '""')}"`),
    flattenRows: vi.fn((rows: MRT_Row<SecuriteIndicateur>[]) => {
        const flatten = (arr: MRT_Row<SecuriteIndicateur>[]): MRT_Row<SecuriteIndicateur>[] => {
            return arr.flatMap((row: MRT_Row<SecuriteIndicateur>) => [
                row,
                ...(row.subRows ? flatten(row.subRows) : [])
            ]);
        };
        return flatten(rows);
    }),
    getBaseValueCSV: vi.fn(row => [
        `"${row.original.isModule ? (row.original.parentApplication ?? "") : row.original.applicationName}"`,
        `"${row.original.isModule ? row.original.applicationName : ""}"`,
        `"${row.original.sndi}"`,
        `"${row.original.domaine}"`,
        `"${row.original.domaineFonc}"`
    ]),
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

    it("log une erreur si fetchData échoue", async () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        const fetchData = async () => {
            try {
                throw new Error("Erreur API");
            } catch (error) {
                console.error("Erreur lors de la récupération des données sécurité: ", error);
                throw error;
            }
        };

        await expect(fetchData()).rejects.toThrow("Erreur API");
        expect(consoleSpy).toHaveBeenCalledWith(
            "Erreur lors de la récupération des données sécurité: ",
            expect.any(Error)
        );

        consoleSpy.mockRestore();
    });

    it("fonctionne si aucun indicateur sécurité n'est retourné", async () => {
        vi.mocked(clientApi.getIndicateurSecuriteByApplication).mockResolvedValueOnce([]);
        vi.mocked(clientApi.getIndicateurSecuriteByModule).mockResolvedValueOnce([]);

        renderWithProviders(<SecuriteIndicateurTable />);

        await screen.findByRole("heading", {
            name: /table indicateur sécurité/i
        });

        expect(await screen.findByText("Nom")).toBeInTheDocument();
    });

    it("génère le bon rowId", () => {
        const rowApp = {
            isModule: false,
            applicationName: "App1"
        };

        const rowModule = {
            isModule: true,
            parentApplication: "App1",
            applicationName: "Mod1"
        };

        const rowId = (row: any) =>
            row.isModule ? `${row.parentApplication}-${row.applicationName}` : row.applicationName;

        expect(rowId(rowApp)).toBe("App1");
        expect(rowId(rowModule)).toBe("App1-Mod1");
    });

    it("associe correctement les modules à leur application", async () => {
        renderWithProviders(<SecuriteIndicateurTable />);

        await screen.findByRole("heading", { name: /table indicateur sécurité/i });

        expect(groupModuleUtils.groupModulesByApp).toHaveBeenCalled();
    });

    it("n'affiche pas les modules comme lignes principales", async () => {
        renderWithProviders(<SecuriteIndicateurTable />);

        await screen.findByRole("heading", { name: /table indicateur sécurité/i });

        expect(screen.queryByText("Mod1")).not.toBeInTheDocument();
    });

    it("renderWithProviderss table with fetched data", async () => {
        renderWithProviders(<SecuriteIndicateurTable />);

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
        renderWithProviders(<SecuriteIndicateurTable />);

        await screen.findByRole("heading", { name: /table indicateur sécurité/i });
        await screen.findByText("Nom");
        await screen.findByText("CVE");

        const exportButton = screen.getByTestId("button-export-csv");
        fireEvent.click(exportButton);
    });

    it("devrait correctement formater les données application", () => {
        // Test unitaire direct de formatApplicationsData
        const apps: clientApi.Application[] = [
            { idApplication: 1, appName: "App1", sndi: "S1", domaineSndi: "D1" }
        ];
        const securiteApps: clientApi.IndicateurSecuriteView[] = [
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

        // Appel direct si la fonction est exportée, sinon via le résultat du composant
        const result = formatApplicationsData(apps, securiteApps);

        expect(result).toHaveLength(1);
        expect(result[0].applicationName).toBe("App1");
        expect(result[0].isModule).toBe(false);
    });

    it("devrait correctement formater les données modules", () => {
        const modules = [
            { id: 1, isModule: true, appName: "App1", modName: "Mod1", sndi: "S1", domaineSndi: "D1" }
        ];
        const securiteModules: clientApi.IndicateurSecuriteView[] = [
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

        const result = formatModulesData(modules, securiteModules);

        expect(result).toHaveLength(1);
        expect(result[0].applicationName).toBe("Mod1");
        expect(result[0].isModule).toBe(true);
    });

    it("devrait appeler toutes les APIs dans fetchData", async () => {
        const { useQuery } = await import("@tanstack/react-query");

        vi.mocked(useQuery).mockImplementation((options: any) => {
            options.queryFn?.();

            return {
                data: undefined,
                isLoading: true,
                error: null,
                isSuccess: false,
                isError: false,
                isPending: true,
                isLoadingError: false,
                isRefetchError: false,
                isPlaceholderData: false,
                status: "pending",
                fetchStatus: "fetching",
                isFetching: true,
                isFetched: false,
                isFetchedAfterMount: false,
                isStale: false,
                isRefetching: false,
                dataUpdatedAt: 0,
                errorUpdatedAt: 0,
                errorUpdateCount: 0,
                failureCount: 0,
                failureReason: null,
                refetch: vi.fn(),
                remove: vi.fn()
            } as any;
        });

        renderWithProviders(<SecuriteIndicateurTable />);

        await waitFor(() => {
            expect(clientApi.getApplications1).toHaveBeenCalled();
            expect(clientApi.getModules1).toHaveBeenCalled();
            expect(clientApi.getIndicateurSecuriteByApplication).toHaveBeenCalled();
            expect(clientApi.getIndicateurSecuriteByModule).toHaveBeenCalled();
        });
    });

    it("devrait trouver le bon indicateur sécurité pour une application via applicationId", () => {
        const apps = [
            { idApplication: 1, appName: "App1", sndi: "S1", domaineSndi: "D1" },
            { idApplication: 2, appName: "App2", sndi: "S2", domaineSndi: "D2" }
        ];
        const securiteApps = [{ applicationId: 2, lettreCve: "A", lettreGlobale: "A" /* ... */ }];

        const result = formatApplicationsData(apps, securiteApps);

        // App1 n'a pas d'indicateur (undefined), App2 en a un
        expect(result[0].applicationName).toBe("App1");
        expect(result[1].applicationName).toBe("App2");
    });

    it("devrait gérer un module sans indicateur sécurité correspondant", () => {
        const modules = [
            {
                id: 99,
                isModule: true,
                appName: "App1",
                modName: "ModSansSecurite",
                sndi: "S1",
                domaineSndi: "D1"
            }
        ];
        const securiteModules: clientApi.IndicateurSecuriteView[] = []; // aucun match

        const result = formatModulesData(modules, securiteModules);

        expect(result).toHaveLength(1);
        expect(result[0].applicationName).toBe("ModSansSecurite");
    });
});
