/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { getApplications1, creerMeteo } from "todos-api/client.gen";
import { MeteoForm } from "pages/saisies/meteo/meteoForm";

// ─── État partagé du formulaire ───────────────────────────────────────────────

let mockFormData: any = {};
const mockReset = vi.fn();

// ─── Mocks API ────────────────────────────────────────────────────────────────

vi.mock("todos-api/client.gen", () => ({
    getApplications1: vi.fn(),
    creerMeteo: vi.fn()
}));

// ─── Mock router ──────────────────────────────────────────────────────────────

vi.mock("@tanstack/react-router", () => ({
    Link: ({ to, children, ...rest }: any) => (
        <a href={to} {...rest}>
            {children}
        </a>
    )
}));

// ─── Mock useQueryForm ────────────────────────────────────────────────────────
// getApplications1 est appelé à l'intérieur de useQueryForm ; comme ce hook
// est entièrement mocké, getApplications1 ne sera jamais déclenché directement
// dans les tests. On ne doit donc pas asserter sur son nombre d'appels.

const { mockUseQueryForm } = vi.hoisted(() => ({
    mockUseQueryForm: vi.fn()
}));

vi.mock("hooks/useQueryForm", () => ({
    useQueryForm: mockUseQueryForm
}));

// ─── Mocks layouts ────────────────────────────────────────────────────────────

vi.mock("components/formsPageLayout/MainPageLayout", () => ({
    MainFormPageLayout: ({ title, formulaires, onSubmit, reset }: any) => (
        <form onSubmit={onSubmit}>
            <h1>{title}</h1>
            {formulaires}
            <button type="button" onClick={reset}>
                Annuler
            </button>
            <button type="submit">Saisir</button>
        </form>
    )
}));

vi.mock("components/formsPageLayout/SnackBarPageLayout", () => ({
    SnackBarPageLayout: ({ openSnack, render }: any) =>
        openSnack ? <div data-testid="snackbar">{render}</div> : null
}));

vi.mock("components/formsPageLayout/FormPageLayout", () => ({
    FormPageLayout: ({ title, render, name, required }: any) => {
        const value = name === "idsApplication" ? (mockFormData.idsApplication ?? []) : 4;

        const hasError = required && Array.isArray(value) && value.length === 0;

        return (
            <div>
                <h2>{title}</h2>
                {render({ value, onChange: () => undefined, required })}
                {hasError && <span>Veuillez renseigner ce champ</span>}
            </div>
        );
    }
}));

// ─── Mocks cellules ───────────────────────────────────────────────────────────

vi.mock("pages/saisies/meteo/meteoCell", () => ({
    RenderAppSelections: () => <div data-testid="render-app-selections" />,
    RenderMeteoSelection: () => <div data-testid="render-meteo-selection" />
}));

// ─── Mock react-hook-form ─────────────────────────────────────────────────────

vi.mock("react-hook-form", async () => {
    const actual = await vi.importActual<any>("react-hook-form");

    return {
        ...actual,
        useWatch: () => 4,
        useForm: () => ({
            control: {},
            register: () => ({}),
            reset: mockReset,
            formState: {
                errors:
                    mockFormData.idsApplication?.length === 0
                        ? {
                              idsApplication: {
                                  type: "required",
                                  message: "Veuillez renseigner ce champ"
                              }
                          }
                        : {}
            },
            handleSubmit: (fn: any) => () => {
                if (mockFormData.idsApplication?.length === 0) {
                    return;
                }
                fn({
                    valeurMeteo: 4,
                    date: "2024-01-01",
                    commentaire: mockFormData.commentaire ?? "",
                    idsApplication: mockFormData.idsApplication ?? []
                });
            }
        })
    };
});

// ─── Suite de tests ───────────────────────────────────────────────────────────

describe("MeteoForm", () => {
    const mockedGetApplications1 = getApplications1 as unknown as ReturnType<typeof vi.fn>;
    const mockedCreerMeteo = creerMeteo as unknown as ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();

        // useQueryForm est mocké → getApplications1 n'est jamais appelé
        // directement, on retourne simplement des données vides.
        mockUseQueryForm.mockReturnValue({
            data: [],
            filteredData: []
        });

        mockFormData = {};
    });

    // ── 1. Rendu initial ──────────────────────────────────────────────────────
    // ⚠️  Correction : getApplications1 est encapsulé dans useQueryForm (mocké),
    //    il n'est donc JAMAIS appelé directement. On vérifie uniquement que les
    //    sections du formulaire sont bien rendues.

    it("affiche les sections du formulaire au montage", async () => {
        mockedGetApplications1.mockResolvedValueOnce([
            { idApplication: 1, appName: "App A" },
            { idApplication: 2, appName: "App B" }
        ]);

        render(<MeteoForm />);

        expect(await screen.findByText("Saisir une météo")).toBeInTheDocument();
        expect(await screen.findByText("Choisir les applications")).toBeInTheDocument();
        expect(await screen.findByText("Météo ressentie")).toBeInTheDocument();

        // On NE vérifie PAS getApplications1 : il n'est pas appelé directement
        // car useQueryForm est mocké et absorbe cet appel en interne.
    });

    // ── 2. Soumission réussie ─────────────────────────────────────────────────

    it("soumet le formulaire et affiche un snackbar de succès", async () => {
        mockFormData = {
            idsApplication: [1],
            commentaire: "Mon commentaire"
        };

        mockedGetApplications1.mockResolvedValueOnce([{ idApplication: 1, appName: "App A" }]);
        mockedCreerMeteo.mockResolvedValueOnce(undefined);

        render(<MeteoForm />);

        fireEvent.click(screen.getByRole("button", { name: "Saisir" }));

        await waitFor(() => {
            expect(mockedCreerMeteo).toHaveBeenCalledTimes(1);
        });

        expect(mockedCreerMeteo).toHaveBeenCalledWith(
            expect.objectContaining({
                commentaire: "Mon commentaire",
                idsApplication: [1]
            })
        );

        expect(await screen.findByText(/création de la météo réussie/i)).toBeInTheDocument();
    });

    // ── 3. Validation : champ applications obligatoire ────────────────────────

    it("affiche une erreur si aucune application n'est sélectionnée", async () => {
        mockFormData = {
            idsApplication: [],
            commentaire: "Test"
        };

        mockedGetApplications1.mockResolvedValueOnce([{ idApplication: 1, appName: "App A" }]);

        render(<MeteoForm />);

        fireEvent.click(screen.getByRole("button", { name: "Saisir" }));

        expect(await screen.findByText("Veuillez renseigner ce champ")).toBeInTheDocument();

        expect(mockedCreerMeteo).not.toHaveBeenCalled();
    });

    // ── 4. Erreur API à la création ───────────────────────────────────────────

    it("affiche une erreur si erreur durant la création", async () => {
        mockFormData = {
            idsApplication: [1],
            commentaire: "Test"
        };

        mockedGetApplications1.mockResolvedValueOnce([{ idApplication: 1, appName: "App A" }]);
        mockedCreerMeteo.mockRejectedValueOnce(new Error("une erreur lors de la création de météo"));

        render(<MeteoForm />);

        fireEvent.click(screen.getByRole("button", { name: "Saisir" }));

        expect(
            await screen.findByText("Une erreur est survenue lors de la création météo.")
        ).toBeInTheDocument();
    });

    // ── 5. Réinitialisation du formulaire ─────────────────────────────────────

    it("reset le formulaire quand on clique sur Annuler", async () => {
        mockedGetApplications1.mockResolvedValueOnce([{ idApplication: 1, appName: "App A" }]);

        render(<MeteoForm />);

        fireEvent.click(screen.getByRole("button", { name: "Annuler" }));

        expect(mockReset).toHaveBeenCalledTimes(1);
    });
});
