/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ControllerRenderProps, ControllerFieldState, UseFormStateReturn } from "react-hook-form";
import type { Application, DemandeCreationMeteo } from "todos-api/client.gen";
import { RenderAppSelections, RenderMeteoSelection } from "pages/saisies/meteo/meteoCell";

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

describe("RenderMeteoSelection", () => {
    const makeField = (value: number[], onChange = vi.fn()) => {
        const field: ControllerRenderProps<DemandeCreationMeteo, "idsApplication"> = {
            value,
            onChange,
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

    it("affiche les 4 options météo", () => {
        render(<RenderMeteoSelection {...makeField([4])} />);
        expect(screen.getByLabelText("Soleil")).toBeDefined();
        expect(screen.getByLabelText("Nuage")).toBeDefined();
        expect(screen.getByLabelText("Pluie")).toBeDefined();
        expect(screen.getByLabelText("Orage")).toBeDefined();
    });

    it("coche 'Soleil' quand value = [4]", () => {
        render(<RenderMeteoSelection {...makeField([4])} />);
        const radio = screen.getByLabelText("Soleil") as HTMLInputElement;
        expect(radio.checked).toBe(true);
    });

    it("coche 'Nuage' quand value = [3]", () => {
        render(<RenderMeteoSelection {...makeField([3])} />);
        const radio = screen.getByLabelText("Nuage") as HTMLInputElement;
        expect(radio.checked).toBe(true);
    });

    it("coche 'Pluie' quand value = [2]", () => {
        render(<RenderMeteoSelection {...makeField([2])} />);
        const radio = screen.getByLabelText("Pluie") as HTMLInputElement;
        expect(radio.checked).toBe(true);
    });

    it("coche 'Orage' quand value = [1]", () => {
        render(<RenderMeteoSelection {...makeField([1])} />);
        const radio = screen.getByLabelText("Orage") as HTMLInputElement;
        expect(radio.checked).toBe(true);
    });

    it("appelle onChange avec la valeur numérique 4 quand on sélectionne Soleil", () => {
        const onChange = vi.fn();
        render(<RenderMeteoSelection {...makeField([3], onChange)} />);
        fireEvent.click(screen.getByLabelText("Soleil"));
        expect(onChange).toHaveBeenCalledWith(4);
    });

    it("appelle onChange avec la valeur numérique 1 quand on sélectionne Orage", () => {
        const onChange = vi.fn();
        render(<RenderMeteoSelection {...makeField([4], onChange)} />);
        fireEvent.click(screen.getByLabelText("Orage"));
        expect(onChange).toHaveBeenCalledWith(1);
    });

    it("appelle onChange avec un Number (pas une string)", () => {
        const onChange = vi.fn();
        render(<RenderMeteoSelection {...makeField([4], onChange)} />);
        fireEvent.click(screen.getByLabelText("Pluie"));
        expect(typeof onChange.mock.calls[0][0]).toBe("number");
    });
});
