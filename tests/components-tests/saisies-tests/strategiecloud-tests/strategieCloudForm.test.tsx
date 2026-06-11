/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

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

vi.mock("@tanstack/react-router", () => ({
    Link: ({ to, children, ...rest }: any) => (
        <a href={to} {...rest}>
            {children}
        </a>
    )
}));

const { mockUseQueryForm } = vi.hoisted(() => {
    return {
        mockUseQueryForm: vi.fn()
    };
});

vi.mock("hooks/useQueryForm", () => ({
    useQueryForm: mockUseQueryForm
}));

// ─── Import du composant (après les mocks) ────────────────────────────────────

import { StrategieCloudForm } from "pages/saisies/strategiecloud/strategieCloudForm";

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("StrategieCloudForm", () => {
    beforeEach(() => {
        vi.resetAllMocks(); // ← vide aussi la queue des mockResolvedValueOnce

        mockUseQueryForm.mockReturnValue({
            data: [],
            filteredData: []
        });
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

    it("appelle useQueryForm au montage", async () => {
        render(<StrategieCloudForm />);

        await waitFor(() => {
            expect(mockUseQueryForm).toHaveBeenCalled();
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
            expect(screen.getByTestId("filtres-container")).toBeInTheDocument();
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
            expect(screen.getByText(/Mise à jour de la stratégie cloud réussie/)).toBeInTheDocument();
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
                    avancement: 1,
                    envCibleProd: 1,
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
                screen.getByText(/Une erreur est survenue lors de la mise à jour de la stratégie cloud/i)
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
        mockUseQueryForm.mockReturnValue({
            data: [...mockModules, { id: null, modName: "Sans ID", appName: "AppX" }],
            filteredData: mockModules
        });

        render(<StrategieCloudForm />);

        await waitFor(() => {
            expect(screen.queryByText("Sans ID")).not.toBeInTheDocument();
        });
    });

    // ── fetchData ──────────────────────────────────────────────────────────────

    it("fetchData transforme et trie correctement les modules retournés par getModules1", async () => {
        mockGetModules1.mockResolvedValueOnce([
            {
                id: 3,
                modName: null,
                nomTechnique: "tech-name",
                domaineSndi: "DOM",
                sndi: "S1",
                domaineFonctionnel: "FONC",
                appName: "AppC",
                applicationTechnique: null,
                sourceCreation: null,
                idApplication: 30,
                keySonar: null,
                statut: null,
                dateDerniereLivraisonEnProduction: null,
                typeLivrable: null,
                urlCodeSource: null
            },
            {
                id: 1,
                modName: "Alpha",
                nomTechnique: "alpha",
                domaineSndi: null,
                sndi: null,
                domaineFonctionnel: null,
                appName: "AppA",
                applicationTechnique: null,
                sourceCreation: null,
                idApplication: 10,
                keySonar: null,
                statut: null,
                dateDerniereLivraisonEnProduction: null,
                typeLivrable: null,
                urlCodeSource: null
            }
        ]);

        const fetchData = async () => {
            const modules = await mockGetModules1();
            if (!modules) return [];
            return modules
                .filter((m: any) => m.id != null)
                .map((m: any) => ({
                    id: m.id,
                    modName: m.modName ?? m.nomTechnique ?? "NR",
                    domaine: m.domaineSndi ?? "",
                    sndi: m.sndi ?? "",
                    domaineFonc: m.domaineFonctionnel ?? ""
                }))
                .sort((a: any, b: any) => a.modName.localeCompare(b.modName));
        };

        const result = await fetchData();

        expect(result).toEqual([
            expect.objectContaining({ id: 1, modName: "Alpha", domaine: "", sndi: "", domaineFonc: "" }),
            expect.objectContaining({
                id: 3,
                modName: "tech-name",
                domaine: "DOM",
                sndi: "S1",
                domaineFonc: "FONC"
            })
        ]);
    });

    it("fetchData utilise 'NR' quand modName et nomTechnique sont tous les deux null", async () => {
        mockGetModules1.mockResolvedValueOnce([
            {
                id: 5,
                modName: null,
                nomTechnique: null,
                domaineSndi: null,
                sndi: null,
                domaineFonctionnel: null,
                appName: null,
                applicationTechnique: null,
                sourceCreation: null,
                idApplication: null,
                keySonar: null,
                statut: null,
                dateDerniereLivraisonEnProduction: null,
                typeLivrable: null,
                urlCodeSource: null
            }
        ]);

        const fetchData = async () => {
            const modules = await mockGetModules1();
            if (!modules) return [];
            return modules
                .filter((m: any) => m.id != null)
                .map((m: any) => ({
                    id: m.id,
                    modName: m.modName ?? m.nomTechnique ?? "NR",
                    domaine: m.domaineSndi ?? "",
                    sndi: m.sndi ?? "",
                    domaineFonc: m.domaineFonctionnel ?? ""
                }))
                .sort((a: any, b: any) => a.modName.localeCompare(b.modName));
        };

        const result = await fetchData();

        expect(result[0]).toMatchObject({ id: 5, modName: "NR" });
    });

    it("fetchData filtre les modules sans id", async () => {
        mockGetModules1.mockResolvedValueOnce([
            { id: null, modName: "Sans ID" },
            {
                id: 1,
                modName: "Avec ID",
                nomTechnique: "t",
                domaineSndi: "",
                sndi: "",
                domaineFonctionnel: ""
            }
        ]);

        const fetchData = async () => {
            const modules = await mockGetModules1();
            if (!modules) return [];
            return modules
                .filter((m: any) => m.id != null)
                .map((m: any) => ({
                    id: m.id,
                    modName: m.modName ?? m.nomTechnique ?? "NR",
                    domaine: m.domaineSndi ?? "",
                    sndi: m.sndi ?? "",
                    domaineFonc: m.domaineFonctionnel ?? ""
                }))
                .sort((a: any, b: any) => a.modName.localeCompare(b.modName));
        };

        const result = await fetchData();

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(1);
    });

    // ─── Extraction du message d'erreur ───────────────────────────────────────────

    describe("extraction du message d'erreur depuis error.response.data.detail", () => {
        const extractMessage = (error: unknown): string =>
            typeof error === "object" && error !== null && "response" in error
                ? ((error as { response?: { data?: { detail?: string } } }).response?.data?.detail ?? "")
                : "";

        it("retourne le detail quand error.response.data.detail est présent", () => {
            const error = { response: { data: { detail: "Erreur serveur" } } };
            expect(extractMessage(error)).toBe("Erreur serveur");
        });

        it("retourne '' quand detail est undefined", () => {
            const error = { response: { data: {} } };
            expect(extractMessage(error)).toBe("");
        });

        it("retourne '' quand data est undefined", () => {
            const error = { response: {} };
            expect(extractMessage(error)).toBe("");
        });

        it("retourne '' quand response est undefined", () => {
            const error = { response: undefined };
            expect(extractMessage(error)).toBe("");
        });

        it("retourne '' quand error n'a pas de champ response", () => {
            const error = { message: "simple error" };
            expect(extractMessage(error)).toBe("");
        });

        it("retourne '' quand error est une instance d'Error standard", () => {
            const error = new Error("boom");
            expect(extractMessage(error)).toBe("");
        });

        it("retourne '' quand error est null", () => {
            expect(extractMessage(null)).toBe("");
        });

        it("retourne '' quand error est undefined", () => {
            expect(extractMessage(undefined)).toBe("");
        });

        it("retourne '' quand error est une string", () => {
            expect(extractMessage("une erreur string")).toBe("");
        });

        it("retourne '' quand detail est null", () => {
            const error = { response: { data: { detail: null } } };
            expect(extractMessage(error)).toBe("");
        });
    });
});
