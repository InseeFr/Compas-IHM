/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ControllerRenderProps, ControllerFieldState, UseFormStateReturn } from "react-hook-form";
import type { Application, DemandeCreationMeteo } from "todos-api/client.gen";
import { RenderAppSelections } from "components/saisies/meteo/meteoCell";

describe("RenderAppSelections", () => {
    const apps: Application[] = [
        { idApplication: 1, appName: "App A" } as Application,
        { idApplication: 2, appName: "App B" } as Application
    ];

    const makeField = (value: number[] = []) => {
        const field: ControllerRenderProps<DemandeCreationMeteo, "idsApplication"> = {
            value,
            onChange: vi.fn(),
            onBlur: vi.fn(),
            name: "idsApplication",
            ref: vi.fn()
        };

        const fieldState: ControllerFieldState = {
            invalid: false,
            isTouched: false,
            isDirty: false,
            error: undefined,
            isValidating: false
        };

        const formState: UseFormStateReturn<DemandeCreationMeteo> = {} as any;

        return { field, fieldState, formState };
    };

    it("affiche la liste des applications dans le Select", () => {
        const field = makeField([]);

        render(<>{RenderAppSelections(field, apps)}</>);

        const selectButton = screen.getByRole("combobox");
        fireEvent.mouseDown(selectButton);

        const optionA = screen.getByText("App A");
        const optionB = screen.getByText("App B");

        expect(optionA).toBeInTheDocument();
        expect(optionB).toBeInTheDocument();
    });

    it("affiche des Chips pour les applications sélectionnées", () => {
        const field = makeField([1, 2]);

        render(<>{RenderAppSelections(field, apps)}</>);

        expect(screen.getByText("App A")).toBeInTheDocument();
        expect(screen.getByText("App B")).toBeInTheDocument();
    });

    it("appelle onChange avec la nouvelle sélection", () => {
        const field = makeField([]);

        render(<>{RenderAppSelections(field, apps)}</>);

        const select = screen.getByRole("combobox");
        fireEvent.mouseDown(select);

        const optionA = screen.getByText("App A");
        fireEvent.click(optionA);

        expect(field.field.onChange).toHaveBeenCalled();
    });
});
