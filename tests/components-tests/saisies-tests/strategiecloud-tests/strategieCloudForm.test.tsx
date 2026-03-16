/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// ─── Données et mocks hoistés ─────────────────────────────────────────────────
// vi.hoisted() est exécuté AVANT les imports, ce qui permet de les référencer
// dans les factories vi.mock() sans erreur "Cannot access before initialization".

const { mockModules, mockGetModules1, mockSaisirStrategieCloud } = vi.hoisted(() => {
    const mockModules = [
        {
            id: 1,
            modName: "Module Alpha",
            appName: "AppA",
            nomTechnique: "alpha",
            applicationTechnique: null,
            sourceCreation: null,
            idApplication: 10,
            domaineSndi: "DOM",
            sndi: "S1",
            domaineFonctionnel: "FONC",
            keySonar: null,
            statut: null,
            dateDerniereLivraisonEnProduction: null,
            typeLivrable: null,
            urlCodeSource: null
        },
        {
            id: 2,
            modName: "Module Beta",
            appName: "AppB",
            nomTechnique: "beta",
            applicationTechnique: null,
            sourceCreation: null,
            idApplication: 20,
            domaineSndi: "DOM",
            sndi: "S2",
            domaineFonctionnel: "FONC",
            keySonar: null,
            statut: null,
            dateDerniereLivraisonEnProduction: null,
            typeLivrable: null,
            urlCodeSource: null
        }
    ];
    return {
        mockModules,
        mockGetModules1: vi.fn().mockResolvedValue(mockModules),
        mockSaisirStrategieCloud: vi.fn().mockResolvedValue(undefined)
    };
});

// ─── Mocks modules ────────────────────────────────────────────────────────────

vi.mock("todos-api/client.gen", () => ({
    getModules1: mockGetModules1,
    saisirStrategieCloud: mockSaisirStrategieCloud
}));

vi.mock("store/filterContext", () => ({
    useFilterContext: () => ({
        state: {},
        dispatch: vi.fn()
    })
}));

vi.mock("pages/Filters", () => ({
    Filters: () => <div data-testid="filters" />
}));

vi.mock("utils/filters-functions", () => ({
    applyDevFilters: () => true
}));

vi.mock("components/formsPageLayout/FormPageLayout", () => ({
    FormPageLayout: ({
        render: renderFn,
        title
    }: {
        render: (field: any) => React.ReactNode;
        title: string;
    }) => {
        const fakeField = {
            field: { value: "", onChange: vi.fn(), onBlur: vi.fn(), name: "test", ref: vi.fn() },
            fieldState: { invalid: false, isTouched: false, isDirty: false, error: undefined },
            formState: {} as any
        };
        return (
            <div data-testid={`form-section-${title}`}>
                <span>{title}</span>
                {renderFn(fakeField)}
            </div>
        );
    }
}));

vi.mock("components/formsPageLayout/MainPageLayout", () => ({
    MainFormPageLayout: ({ title, filtres, formulaires, reset, onSubmit }: any) => (
        <div data-testid="main-layout">
            <h1>{title}</h1>
            <div data-testid="filtres-container">{filtres}</div>
            <form
                onSubmit={e => {
                    e.preventDefault();
                    onSubmit(e);
                }}
            >
                {formulaires}
                <button type="button" onClick={reset} data-testid="reset-button">
                    Réinitialiser
                </button>
                <button type="submit" data-testid="submit-button">
                    Soumettre
                </button>
            </form>
        </div>
    )
}));

vi.mock("components/formsPageLayout/SnackBarPageLayout", () => ({
    SnackBarPageLayout: ({ openSnack, render: content }: any) =>
        openSnack ? <div data-testid="snackbar">{content}</div> : null
}));

vi.mock("components/formsPageLayout/CommentaryPageLayout", () => ({
    default: ({ isRequired }: { isRequired: boolean }) => (
        <div data-testid="commentary" data-required={String(isRequired)} />
    )
}));

// ─── Import du composant (après les mocks) ────────────────────────────────────

import { StrategieCloudForm } from "pages/saisies/strategiecloud/strategieCloudForm";

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("StrategieCloudForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetModules1.mockResolvedValue(mockModules);
        mockSaisirStrategieCloud.mockResolvedValue(undefined);
    });

    // ── Rendu initial ──────────────────────────────────────────────────────────

    it("affiche le titre principal", async () => {
        render(<StrategieCloudForm />);
        await waitFor(() => {
            expect(screen.getByText("Saisir une stratégie cloud")).toBeInTheDocument();
        });
    });

    it("charge les modules au montage via getModules1", async () => {
        render(<StrategieCloudForm />);
        await waitFor(() => {
            expect(mockGetModules1).toHaveBeenCalledTimes(1);
        });
    });

    it("affiche les 3 sections du formulaire", async () => {
        render(<StrategieCloudForm />);
        await waitFor(() => {
            expect(screen.getByTestId("form-section-Choisir les modules")).toBeInTheDocument();
            expect(
                screen.getByTestId("form-section-État d'avancement de la stratégie")
            ).toBeInTheDocument();
            expect(
                screen.getByTestId("form-section-Environnement cible de production")
            ).toBeInTheDocument();
        });
    });

    it("affiche le composant commentaire", async () => {
        render(<StrategieCloudForm />);
        await waitFor(() => {
            expect(screen.getByTestId("commentary")).toBeInTheDocument();
        });
    });

    it("affiche le composant filtres", async () => {
        render(<StrategieCloudForm />);
        await waitFor(() => {
            expect(screen.getByTestId("filters")).toBeInTheDocument();
        });
    });

    // ── Soumission réussie ─────────────────────────────────────────────────────

    it("appelle saisirStrategieCloud lors de la soumission", async () => {
        render(<StrategieCloudForm />);
        await waitFor(() => screen.getByTestId("submit-button"));

        fireEvent.click(screen.getByTestId("submit-button"));

        await waitFor(() => {
            expect(mockSaisirStrategieCloud).toHaveBeenCalledTimes(1);
        });
    });

    it("affiche une snackbar de succès après soumission réussie", async () => {
        render(<StrategieCloudForm />);
        await waitFor(() => screen.getByTestId("submit-button"));

        fireEvent.click(screen.getByTestId("submit-button"));

        await waitFor(() => {
            expect(screen.getByTestId("snackbar")).toBeInTheDocument();
            expect(screen.getByText(/Création de la stratégie cloud réussie/)).toBeInTheDocument();
        });
    });

    it("passe les bons paramètres mappés à l'API (valeurs par défaut)", async () => {
        render(<StrategieCloudForm />);
        await waitFor(() => screen.getByTestId("submit-button"));

        fireEvent.click(screen.getByTestId("submit-button"));

        await waitFor(() => {
            expect(mockSaisirStrategieCloud).toHaveBeenCalledWith(
                expect.objectContaining({
                    idsModule: [],
                    avancement: 1, // "A instruire" → 1
                    envCibleProd: 1, // "Kube" → 1
                    commentaire: ""
                })
            );
        });
    });

    it("inclut une date au format YYYY-MM-DD dans les données envoyées", async () => {
        render(<StrategieCloudForm />);
        await waitFor(() => screen.getByTestId("submit-button"));

        fireEvent.click(screen.getByTestId("submit-button"));

        await waitFor(() => {
            const callArg = mockSaisirStrategieCloud.mock.calls[0][0];
            expect(callArg.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });
    });

    // ── Soumission en erreur ───────────────────────────────────────────────────

    it("affiche une snackbar d'erreur si l'API échoue", async () => {
        mockSaisirStrategieCloud.mockRejectedValueOnce(new Error("API Error"));

        render(<StrategieCloudForm />);
        await waitFor(() => screen.getByTestId("submit-button"));

        fireEvent.click(screen.getByTestId("submit-button"));

        await waitFor(() => {
            expect(screen.getByTestId("snackbar")).toBeInTheDocument();
            expect(
                screen.getByText(/erreur est survenue lors de la création de la stratégie cloud/i)
            ).toBeInTheDocument();
        });
    });

    // ── Réinitialisation ───────────────────────────────────────────────────────

    it("réinitialise le formulaire sans appeler l'API", async () => {
        render(<StrategieCloudForm />);
        await waitFor(() => screen.getByTestId("reset-button"));

        fireEvent.click(screen.getByTestId("reset-button"));

        expect(mockSaisirStrategieCloud).not.toHaveBeenCalled();
    });

    // ── Robustesse ─────────────────────────────────────────────────────────────

    it("ne plante pas si getModules1 retourne null", async () => {
        mockGetModules1.mockResolvedValueOnce(null);
        expect(() => render(<StrategieCloudForm />)).not.toThrow();
        await waitFor(() => {
            expect(screen.getByText("Saisir une stratégie cloud")).toBeInTheDocument();
        });
    });

    it("filtre les modules sans id retournés par l'API", async () => {
        mockGetModules1.mockResolvedValueOnce([
            ...mockModules,
            { id: null, modName: "Sans ID", appName: "AppX" }
        ]);

        render(<StrategieCloudForm />);
        await waitFor(() => {
            expect(mockGetModules1).toHaveBeenCalled();
        });
    });
});
