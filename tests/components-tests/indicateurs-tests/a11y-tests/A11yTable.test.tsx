import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { useFilterContext } from "store/filterContext";
import { getModules1, listerModulesA11y } from "todos-api/client.gen";
import { A11yIndicateurTable } from "components/indicateurs/a11y/A11yIndicateur";
import * as a11yConfig from "components/indicateurs/a11y/a11yConfig";

vi.mock("store/filterContext");
vi.mock("todos-api/client.gen");
vi.mock("components/indicateurs/a11y/a11yConfig", () => ({
    columnsTable: vi.fn(() => []),
    formatIndicateur: vi.fn((mod, module) => ({
        modName: mod.modName,
        sndi: module?.sndi || "Unknown",
        domaine: module?.domaine || "Unknown",
        domaineFonc: module?.domaineFonc || "Unknown"
    })),
    OnExport: vi.fn(),
    paginationConfig: {}
}));
vi.mock("pages/TablePageLayout");
vi.mock("pages/ButtonCsvExport");
vi.mock("components/Filters");

describe("A11yIndicateurTable", () => {
    const mockDispatch = vi.fn();
    const mockState = {
        serviceDev: "",
        domaineDev: "",
        domaineFonc: "",
        appName: ""
    };

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

    beforeEach(() => {
        vi.mocked(useFilterContext).mockReturnValue({
            state: mockState,
            dispatch: mockDispatch
        });

        vi.mocked(listerModulesA11y).mockResolvedValue(mockModulesA11y);
        vi.mocked(getModules1).mockResolvedValue(mockModules);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("devrait charger et afficher les données A11y", async () => {
        render(<A11yIndicateurTable />);

        await waitFor(() => {
            expect(listerModulesA11y).toHaveBeenCalledTimes(1);
            expect(getModules1).toHaveBeenCalledTimes(1);
        });
    });

    it("devrait mapper correctement les modules avec leurs données", async () => {
        render(<A11yIndicateurTable />);

        await waitFor(() => {
            expect(listerModulesA11y).toHaveBeenCalled();
            expect(getModules1).toHaveBeenCalled();
            expect(a11yConfig.formatIndicateur).toHaveBeenCalledTimes(3);
        });
    });

    it("devrait gérer les modules sans correspondance", async () => {
        const modulesA11yWithUnknown = [...mockModulesA11y, { modName: "UnknownModule", score: 50 }];

        vi.mocked(listerModulesA11y).mockResolvedValue(modulesA11yWithUnknown);

        render(<A11yIndicateurTable />);

        await waitFor(() => {
            expect(listerModulesA11y).toHaveBeenCalled();
            expect(a11yConfig.formatIndicateur).toHaveBeenCalledTimes(4);
        });
    });

    it("devrait filtrer par serviceDev", async () => {
        vi.mocked(useFilterContext).mockReturnValue({
            state: { ...mockState, serviceDev: "SNDI1" },
            dispatch: mockDispatch
        });

        render(<A11yIndicateurTable />);

        await waitFor(() => {
            expect(listerModulesA11y).toHaveBeenCalled();
        });
    });

    it("devrait filtrer par domaineDev", async () => {
        vi.mocked(useFilterContext).mockReturnValue({
            state: { ...mockState, domaineDev: "Domaine1" },
            dispatch: mockDispatch
        });

        render(<A11yIndicateurTable />);

        await waitFor(() => {
            expect(listerModulesA11y).toHaveBeenCalled();
        });
    });

    it("devrait filtrer par domaineFonc", async () => {
        vi.mocked(useFilterContext).mockReturnValue({
            state: { ...mockState, domaineFonc: "DomaineFonc1" },
            dispatch: mockDispatch
        });

        render(<A11yIndicateurTable />);

        await waitFor(() => {
            expect(listerModulesA11y).toHaveBeenCalled();
        });
    });

    it("devrait appliquer plusieurs filtres simultanément", async () => {
        vi.mocked(useFilterContext).mockReturnValue({
            state: {
                serviceDev: "SNDI1",
                domaineDev: "Domaine1",
                domaineFonc: "DomaineFonc1",
                appName: ""
            },
            dispatch: mockDispatch
        });

        render(<A11yIndicateurTable />);

        await waitFor(() => {
            expect(listerModulesA11y).toHaveBeenCalled();
        });
    });

    it("devrait retourner toutes les données quand aucun filtre n'est appliqué", async () => {
        render(<A11yIndicateurTable />);

        await waitFor(() => {
            expect(listerModulesA11y).toHaveBeenCalled();
        });
    });

    it("devrait gérer les erreurs lors du chargement des données", async () => {
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        const errorMessage = "API Error";

        vi.mocked(listerModulesA11y).mockRejectedValue(new Error(errorMessage));

        render(<A11yIndicateurTable />);

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

        vi.mocked(getModules1).mockRejectedValue(new Error("Modules API Error"));

        render(<A11yIndicateurTable />);

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                "Erreur lors de la récupération des données A11y: ",
                expect.any(Error)
            );
        });

        consoleErrorSpy.mockRestore();
    });

    it("devrait créer correctement la Map des modules par nom", async () => {
        render(<A11yIndicateurTable />);

        await waitFor(() => {
            expect(listerModulesA11y).toHaveBeenCalled();
            expect(getModules1).toHaveBeenCalled();
            expect(a11yConfig.formatIndicateur).toHaveBeenCalledWith(mockModulesA11y[0], mockModules[0]);
        });
    });

    it("devrait initialiser les colonnes via useMemo", () => {
        render(<A11yIndicateurTable />);

        expect(a11yConfig.columnsTable).toHaveBeenCalledTimes(1);
    });
});
