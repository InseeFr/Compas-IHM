/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { getApplications1, creerMeteo } from "todos-api/client.gen";
import { MeteoForm } from "components/saisies/meteo/meteoForm";

/* =======================
   Variable pour piloter le formulaire
======================= */
let mockFormData: any = {};

/* =======================
   Mocks API
======================= */
vi.mock("todos-api/client.gen", () => ({
    getApplications1: vi.fn(),
    creerMeteo: vi.fn()
}));

/* =======================
   Mocks Layouts
======================= */
vi.mock("pages/formsPageLayout/MainPageLayout", () => ({
    MainFormPageLayout: ({ title, formulaires, onSubmit }: any) => (
        <form onSubmit={onSubmit}>
            <h1>{title}</h1>
            {formulaires}
        </form>
    )
}));

vi.mock("pages/formsPageLayout/SnackBarPageLayout", () => ({
    SnackBarPageLayout: ({ openSnack, render }: any) =>
        openSnack ? <div data-testid="snackbar">{render}</div> : null
}));

vi.mock("pages/formsPageLayout/FormPageLayout", () => ({
    FormPageLayout: ({ title, render, name }: any) => (
        <div>
            <h2>{title}</h2>
            {render({
                value: name === "idsApplication" ? (mockFormData.idsApplication ?? []) : 4,
                onChange: () => undefined
            })}
        </div>
    )
}));

/* =======================
   Mocks cellules
======================= */
vi.mock("components/saisies/meteo/meteoCell", () => ({
    RenderAppSelections: () => <div data-testid="render-app-selections" />,
    RenderMeteoSelection: () => <div data-testid="render-meteo-selection" />
}));

/* =======================
   Mock dynamique react-hook-form
======================= */
vi.mock("react-hook-form", async () => {
    const actual = await vi.importActual<any>("react-hook-form");

    return {
        ...actual,
        useForm: () => ({
            control: {},
            register: () => ({}),
            reset: vi.fn(),
            handleSubmit: (fn: any) => () =>
                fn({
                    valeurMeteo: 4,
                    date: "2024-01-01",
                    commentaire: mockFormData.commentaire ?? "",
                    idsApplication: mockFormData.idsApplication ?? []
                })
        })
    };
});

/* =======================
   Tests
======================= */
describe("MeteoForm", () => {
    const mockedGetApplications1 = getApplications1 as unknown as ReturnType<typeof vi.fn>;
    const mockedCreerMeteo = creerMeteo as unknown as ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockFormData = {};
    });

    it("charge la liste d'applications au montage", async () => {
        mockedGetApplications1.mockResolvedValueOnce([
            { idApplication: 1, appName: "App A" },
            { idApplication: 2, appName: "App B" }
        ]);

        render(<MeteoForm />);

        expect(await screen.findByText("Saisir une météo")).toBeInTheDocument();
        expect(await screen.findByText("Choisir les applications")).toBeInTheDocument();
        expect(await screen.findByText("Météo ressentie")).toBeInTheDocument();

        await waitFor(() => {
            expect(mockedGetApplications1).toHaveBeenCalledTimes(1);
        });
    });

    it("soumet le formulaire et affiche un snackbar de succès", async () => {
        mockFormData = {
            idsApplication: [1],
            commentaire: "Mon commentaire"
        };

        mockedGetApplications1.mockResolvedValueOnce([
            { idApplication: 1, appName: "App A" },
            { idApplication: 2, appName: "App B" }
        ]);

        mockedCreerMeteo.mockResolvedValueOnce(undefined);

        render(<MeteoForm />);

        fireEvent.click(screen.getByRole("button", { name: "Saisir" }));

        await waitFor(() => {
            expect(mockedCreerMeteo).toHaveBeenCalledTimes(1);
        });

        const args = mockedCreerMeteo.mock.calls[0][0];
        expect(args.commentaire).toBe("Mon commentaire");
        expect(args.idsApplication).toEqual([1]);

        expect(await screen.findByText(/Création de Météo Réussie/i)).toBeInTheDocument();
    });

    it("affiche une erreur si aucune application n'est sélectionnée", async () => {
        mockFormData = {
            idsApplication: [],
            commentaire: "Test"
        };

        mockedGetApplications1.mockResolvedValueOnce([{ idApplication: 1, appName: "App A" }]);

        render(<MeteoForm />);

        fireEvent.click(screen.getByRole("button", { name: "Saisir" }));

        expect(
            await screen.findByText("Veuillez sélectionner au moins une application.")
        ).toBeInTheDocument();

        expect(mockedCreerMeteo).not.toHaveBeenCalled();
    });
});
