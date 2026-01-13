import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import type {
    ControllerFieldState,
    ControllerRenderProps,
    PathValue,
    UseFormStateReturn
} from "react-hook-form";

import {
    RenderModuleSelections,
    RenderDeclaration,
    RenderDateDeclaration,
    RenderTypeAudit,
    RenderScoreAudit,
    RenderDateAudit
} from "components/saisies/a11y/a11yCell";

import type { A11yFormValues } from "components/saisies/a11y/a11yFormValues";
import type { Module } from "todos-api/client.gen";

function mockField<T extends keyof A11yFormValues>(
    name: T,
    value: PathValue<A11yFormValues, T>,
    onChange = vi.fn()
): {
    field: ControllerRenderProps<A11yFormValues, T>;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<A11yFormValues>;
} {
    return {
        field: {
            name,
            value,
            onChange,
            onBlur: vi.fn(),
            ref: vi.fn()
        },
        fieldState: {} as ControllerFieldState,
        formState: {} as UseFormStateReturn<A11yFormValues>
    };
}

describe("A11y renders", () => {
    describe("RenderModuleSelections", () => {
        const modules: Module[] = [
            { id: 1, modName: "Module A" },
            { id: 2, modName: "Module B" }
        ];

        it("affiche les modules sélectionnés", () => {
            const field = mockField("idsModule", [1]);

            render(<RenderModuleSelections {...field} modules={modules} />);

            expect(screen.getByText("Module A")).toBeInTheDocument();
        });

        it("permet de sélectionner un module", async () => {
            const user = userEvent.setup();
            const onChange = vi.fn();

            const field = mockField("idsModule", [], onChange);

            render(<RenderModuleSelections {...field} modules={modules} />);

            await user.click(screen.getByRole("combobox"));
            await user.click(screen.getByText("Module A"));

            expect(onChange).toHaveBeenCalledWith([1]);
        });
    });

    describe("RenderDeclaration", () => {
        it("sélectionne Oui quand la valeur est true", () => {
            const field = mockField("isDeclaration", true);

            render(<RenderDeclaration {...field} />);

            expect(screen.getByLabelText("Oui")).toBeChecked();
        });

        it("change la valeur à false quand on clique sur Non", async () => {
            const user = userEvent.setup();
            const onChange = vi.fn();

            const field = mockField("isDeclaration", true, onChange);

            render(<RenderDeclaration {...field} />);

            await user.click(screen.getByLabelText("Non"));

            expect(onChange).toHaveBeenCalledWith(false);
        });
    });

    describe("RenderDateDeclaration", () => {
        it("met à jour la date de déclaration", async () => {
            const user = userEvent.setup();
            const onChange = vi.fn();

            const field = mockField("dateDeclaration", "", onChange);

            render(<RenderDateDeclaration {...field} />);

            const input = screen.getByLabelText("Date de déclaration");

            await user.type(input, "2024-02-01");

            expect(onChange).toHaveBeenCalled();
        });
    });

    describe("RenderTypeAudit", () => {
        it("change le type d'audit", async () => {
            const user = userEvent.setup();
            const onChange = vi.fn();

            const field = mockField("idIndicateurTypeAudit", 510, onChange);

            render(<RenderTypeAudit {...field} />);

            await user.click(screen.getByRole("combobox"));
            await user.click(screen.getByText("Audit complet"));

            expect(onChange).toHaveBeenCalledWith(512);
        });
    });

    describe("RenderScoreAudit", () => {
        it("met à jour le score", async () => {
            const user = userEvent.setup();
            const onChange = vi.fn();

            const field = mockField("scoreAudit", undefined, onChange);

            render(<RenderScoreAudit {...field} />);

            const input = screen.getByLabelText("Score Audit");

            await user.type(input, "85");

            expect(onChange).toHaveBeenCalled();
        });
    });

    describe("RenderDateAudit", () => {
        it("met à jour la date d'audit", async () => {
            const user = userEvent.setup();
            const onChange = vi.fn();

            const field = mockField("dateAudit", "", onChange);

            render(<RenderDateAudit {...field} />);

            const input = screen.getByLabelText("Date Audit");

            await user.type(input, "2024-03-10");

            expect(onChange).toHaveBeenCalled();
        });
    });
});
