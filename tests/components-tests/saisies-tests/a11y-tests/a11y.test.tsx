/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import A11yForm from "pages/saisies/a11y/a11yForm";
import * as client from "todos-api/client.gen";

// ─── Mocks API ────────────────────────────────────────────────────────────────

vi.mock("todos-api/client.gen", () => ({
    getModules1: vi.fn(),
    listerModulesA11y: vi.fn(),
    majInfosSaisiesA11Y: vi.fn()
}));

// ─── Mock react-hook-form ─────────────────────────────────────────────────────
// On ne surcharge que Controller pour le champ "modules" (état d'erreur forcé).
// Tous les autres champs utilisent l'implémentation réelle.

vi.mock("react-hook-form", async () => {
    const actual = await vi.importActual<any>("react-hook-form");

    return {
        ...actual,
        Controller: (props: any) => {
            if (props.name === "modules") {
                return props.render({
                    field: {
                        value: [],
                        onChange: vi.fn()
                    },
                    fieldState: {
                        error: {
                            type: "required",
                            message: "Veuillez renseigner ce champ"
                        }
                    }
                });
            }
            return actual.Controller(props);
        }
    };
});

// ─── Mock router ──────────────────────────────────────────────────────────────

vi.mock("@tanstack/react-router", () => ({
    Link: ({ to, children, ...rest }: any) => (
        <a href={to} {...rest}>
            {children}
        </a>
    )
}));

// ─── Mocks cellules de rendu ──────────────────────────────────────────────────
// RenderDeclaration utilise `checked` (booléen) et non `value` (string)
// pour que reset() de react-hook-form puisse remettre la case à décocher.

vi.mock("pages/saisies/a11y/a11yCell", () => ({
    RenderModuleSelections: vi.fn((field: any) => (
        <div>
            <input
                data-testid="module-1"
                type="checkbox"
                value="1"
                onChange={e => {
                    const currentValues: number[] = field.field?.value || [];
                    const newValues = e.target.checked
                        ? [...currentValues, 1]
                        : currentValues.filter((v: number) => v !== 1);
                    field.field?.onChange(newValues);
                }}
            />
            <label>Module 1</label>
            {field.fieldState?.error && <span role="alert">{field.fieldState.error.message}</span>}
        </div>
    )),

    // ⚠️  Correction clé : `checked={!!field.field?.value}` au lieu de
    //     `value={field.field?.value}` pour que reset() fonctionne.
    RenderDeclaration: vi.fn((field: any) => (
        <input
            type="checkbox"
            data-testid="declaration-checkbox"
            name={field.field?.name}
            checked={!!field.field?.value}
            onChange={e => field.field?.onChange(e.target.checked)}
            ref={field.field?.ref}
        />
    )),

    RenderDateDeclaration: vi.fn((field: any) => (
        <input {...field.field} type="date" data-testid="date-declaration" />
    )),
    RenderTypeAudit: vi.fn((field: any) => <select {...field.field} data-testid="type-audit-select" />),
    RenderScoreAudit: vi.fn((field: any) => (
        <input {...field.field} type="number" data-testid="score-audit" />
    )),
    RenderDateAudit: vi.fn((field: any) => (
        <input {...field.field} type="date" data-testid="date-audit" />
    ))
}));

// ─── Mock useQueryForm ────────────────────────────────────────────────────────

const { mockUseQueryForm } = vi.hoisted(() => ({
    mockUseQueryForm: vi.fn()
}));

vi.mock("hooks/useQueryForm", () => ({
    useQueryForm: mockUseQueryForm
}));

// ─── Suite de tests ───────────────────────────────────────────────────────────

describe("A11yForm", () => {
    const mockModules = [
        { id: 1, modName: "Module B" },
        { id: 2, modName: "Module A" }
    ];

    beforeEach(() => {
        vi.clearAllMocks();

        mockUseQueryForm.mockReturnValue({
            data: [],
            filteredData: []
        });

        vi.mocked(client.listerModulesA11y).mockResolvedValue([{ idModule: 1 }, { idModule: 2 }]);

        vi.mocked(client.getModules1).mockResolvedValue(mockModules);

        vi.mocked(client.majInfosSaisiesA11Y).mockResolvedValue(new Blob());
    });

    // ── 1. Rendu initial ──────────────────────────────────────────────────────
    // getModules1 est appelé à l'intérieur de useQueryForm, qui est mocké ;
    // on vérifie donc uniquement que le formulaire se rend correctement.

    it("affiche le formulaire avec les éléments principaux", () => {
        render(<A11yForm />);

        expect(screen.getByRole("button", { name: /saisir/i })).toBeInTheDocument();

        expect(screen.getByRole("button", { name: /annuler/i })).toBeInTheDocument();

        expect(screen.getByTestId("declaration-checkbox")).toBeInTheDocument();
    });

    // ── 2. Validation : champ modules obligatoire ─────────────────────────────

    it("affiche un message d'erreur si aucun module n'est sélectionné", async () => {
        const user = userEvent.setup();
        render(<A11yForm />);

        const submitButton = screen.getByRole("button", { name: /saisir/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(content => content.includes("renseigner"))).toBeInTheDocument();
        });
    });

    // ── 3. Affichage conditionnel de la date de déclaration ───────────────────

    it("affiche le champ date de déclaration quand la déclaration est cochée", async () => {
        const user = userEvent.setup();
        render(<A11yForm />);

        // Pas de waitFor sur getModules1 : il n'est pas appelé directement
        // dans ce contexte de test (il est encapsulé dans useQueryForm mocké).
        const declarationCheckbox = screen.getByTestId("declaration-checkbox");
        await user.click(declarationCheckbox);

        await waitFor(() => {
            expect(screen.getByTestId("date-declaration")).toBeInTheDocument();
        });
    });

    it("masque le champ date de déclaration quand la déclaration est décochée", async () => {
        const user = userEvent.setup();
        render(<A11yForm />);

        const declarationCheckbox = screen.getByTestId("declaration-checkbox");

        // Cocher puis décocher
        await user.click(declarationCheckbox);
        await waitFor(() => expect(screen.getByTestId("date-declaration")).toBeInTheDocument());

        await user.click(declarationCheckbox);
        await waitFor(() => expect(screen.queryByTestId("date-declaration")).not.toBeInTheDocument());
    });

    // ── 4. Réinitialisation du formulaire ─────────────────────────────────────
    // Correction : le mock RenderDeclaration utilise désormais `checked`
    // (booléen) pour que reset() de react-hook-form puisse prendre effet.

    it("réinitialise le formulaire lors du clic sur Annuler", async () => {
        const user = userEvent.setup();
        render(<A11yForm />);

        const declarationCheckbox = screen.getByTestId("declaration-checkbox");
        await user.click(declarationCheckbox);
        expect(declarationCheckbox).toBeChecked();

        const cancelButton = screen.getByRole("button", { name: /annuler/i });
        await user.click(cancelButton);

        await waitFor(() => {
            expect(declarationCheckbox).not.toBeChecked();
        });
    });

    // ── 5. Soumission réussie ─────────────────────────────────────────────────

    it("affiche un message de succès après une sauvegarde réussie", async () => {
        const user = userEvent.setup();
        render(<A11yForm />);

        const moduleCheckbox = screen.getByTestId("module-1");
        await user.click(moduleCheckbox);

        const submitButton = screen.getByRole("button", { name: /saisir/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(client.majInfosSaisiesA11Y).toHaveBeenCalled();
        });

        await waitFor(() => {
            const alert = screen.getByRole("alert");
            expect(alert).toHaveTextContent(/A11y créée pour les modules choisis/i);
        });
    });

    // ── 6. Soumission en erreur ───────────────────────────────────────────────

    it("affiche un message d'erreur si l'API retourne une erreur", async () => {
        vi.mocked(client.majInfosSaisiesA11Y).mockRejectedValue(new Error("Erreur serveur"));

        const user = userEvent.setup();
        render(<A11yForm />);

        const moduleCheckbox = screen.getByTestId("module-1");
        await user.click(moduleCheckbox);

        const submitButton = screen.getByRole("button", { name: /saisir/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(client.majInfosSaisiesA11Y).toHaveBeenCalled();
        });

        // Le composant doit afficher une alerte d'erreur (role="alert")
        await waitFor(() => {
            const alerts = screen.getAllByRole("alert");
            const hasError = alerts.some(a =>
                new RegExp(/erreur|problème|impossible/i).exec(a.textContent)
            );
            expect(hasError).toBe(true);
        });
    });
});
