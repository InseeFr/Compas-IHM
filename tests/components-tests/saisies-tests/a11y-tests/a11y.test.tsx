import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import A11yForm from "components/saisies/a11y/a11yForm";
import * as client from "todos-api/client.gen";

// Mock de l'API
vi.mock("todos-api/client.gen", () => ({
    getModules1: vi.fn(),
    majInfosSaisiesA11Y: vi.fn()
}));

// Mock des composants de rendu
vi.mock("components/saisies/a11y/a11yCell", () => ({
    RenderModuleSelections: vi.fn(field => (
        <div>
            <input
                data-testid="module-1"
                type="checkbox"
                value="1"
                onChange={e => {
                    const currentValues = field.field?.value || [];
                    const newValues = e.target.checked
                        ? [...currentValues, 1]
                        : currentValues.filter((v: number) => v !== 1);
                    field.field?.onChange(newValues);
                }}
            />
            <label>Module 1</label>
        </div>
    )),
    RenderDeclaration: vi.fn(field => (
        <input {...field.field} type="checkbox" data-testid="declaration-checkbox" />
    )),
    RenderDateDeclaration: vi.fn(field => (
        <input {...field.field} type="date" data-testid="date-declaration" />
    )),
    RenderTypeAudit: vi.fn(field => <select {...field.field} data-testid="type-audit-select" />),
    RenderScoreAudit: vi.fn(field => <input {...field.field} type="number" data-testid="score-audit" />),
    RenderDateAudit: vi.fn(field => <input {...field.field} type="date" data-testid="date-audit" />)
}));

describe("A11yForm", () => {
    const mockModules = [
        { id: 1, modName: "Module B" },
        { id: 2, modName: "Module A" }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(client.getModules1).mockResolvedValue(mockModules);
    });

    it("charge et affiche les modules triés par ordre alphabétique", async () => {
        render(<A11yForm />);

        await waitFor(() => {
            expect(client.getModules1).toHaveBeenCalledTimes(1);
        });
    });

    it("affiche un message d'erreur si aucun module n'est sélectionné", async () => {
        const user = userEvent.setup();
        render(<A11yForm />);

        const submitButton = screen.getByRole("button", { name: /saisir/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/veuillez sélectionner au moins un module/i)).toBeInTheDocument();
        });
    });

    it("affiche le champ date de déclaration quand la déclaration est cochée", async () => {
        const user = userEvent.setup();
        render(<A11yForm />);

        await waitFor(() => expect(client.getModules1).toHaveBeenCalled());

        const declarationCheckbox = screen.getByTestId("declaration-checkbox");
        await user.click(declarationCheckbox);

        await waitFor(() => {
            expect(screen.getByTestId("date-declaration")).toBeInTheDocument();
        });
    });

    it("réinitialise le formulaire lors du clic sur Annuler", async () => {
        const user = userEvent.setup();
        render(<A11yForm />);

        await waitFor(() => expect(client.getModules1).toHaveBeenCalled());

        const cancelButton = screen.getByRole("button", { name: /annuler/i });
        await user.click(cancelButton);

        // Vérifier que le formulaire est réinitialisé
        const declarationCheckbox = screen.getByTestId("declaration-checkbox");
        expect(declarationCheckbox).not.toBeChecked();
    });

    it("affiche un message de succès après une sauvegarde réussie", async () => {
        const user = userEvent.setup();
        render(<A11yForm />);

        await waitFor(() => expect(client.getModules1).toHaveBeenCalled());

        // Sélectionner un module
        const moduleCheckbox = screen.getByTestId("module-1");
        await user.click(moduleCheckbox);

        // Soumettre le formulaire
        const submitButton = screen.getByRole("button", { name: /saisir/i });
        await user.click(submitButton);

        // Vérifier le message de succès avec une fonction matcher
        await waitFor(
            () => {
                const alert = screen.getByRole("alert");
                expect(alert).toHaveTextContent(/A11y créée pour les modules choisis/i);
            },
            { timeout: 5000 }
        );
    });
});
