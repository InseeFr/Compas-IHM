import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { fr } from "date-fns/locale";
import {
    TendancePeriodeForm,
    type TendancePeriodeFormProps
} from "components/filtersLayout/TendanceForm";

function renderWithProviders(props: TendancePeriodeFormProps) {
    return render(
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <TendancePeriodeForm {...props} />
        </LocalizationProvider>
    );
}

/** Returns the aria-hidden <input> whose id matches the `for` attribute of the given label text. */
function getHiddenInput(labelText: string): HTMLInputElement {
    const label = screen.getByText(labelText, { selector: "label" });
    const inputId = label.getAttribute("for")!;
    return document.getElementById(inputId) as HTMLInputElement;
}

const defaultProps: TendancePeriodeFormProps = {
    dateDebut: "",
    dateFin: "",
    handleChange: vi.fn()
};

describe("TendancePeriodeForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ─── Rendering ────────────────────────────────────────────────────────────

    describe("Rendering", () => {
        it("renders the 'Date début' label", () => {
            renderWithProviders(defaultProps);
            expect(screen.getByText("Date début", { selector: "label" })).toBeInTheDocument();
        });

        it("renders the 'Date fin' label", () => {
            renderWithProviders(defaultProps);
            expect(screen.getByText("Date fin", { selector: "label" })).toBeInTheDocument();
        });

        it("renders two DatePicker groups", () => {
            renderWithProviders(defaultProps);
            // MUI X wraps each picker in a role="group" labelled by the field label
            const groups = screen.getAllByRole("group");
            expect(groups).toHaveLength(2);
        });
    });

    // ─── Initial values ───────────────────────────────────────────────────────

    describe("Initial values", () => {
        it("shows empty value when dateDebut is an empty string", () => {
            renderWithProviders(defaultProps);
            expect(getHiddenInput("Date début").value).toBe("");
        });

        it("shows empty value when dateFin is an empty string", () => {
            renderWithProviders(defaultProps);
            expect(getHiddenInput("Date fin").value).toBe("");
        });

        it("displays the parsed dateDebut value", () => {
            renderWithProviders({ ...defaultProps, dateDebut: "15/03/2024" });
            expect(getHiddenInput("Date début").value).toBe("15/03/2024");
        });

        it("displays the parsed dateFin value", () => {
            renderWithProviders({ ...defaultProps, dateFin: "31/12/2024" });
            expect(getHiddenInput("Date fin").value).toBe("31/12/2024");
        });

        it("displays both date values simultaneously", () => {
            renderWithProviders({ ...defaultProps, dateDebut: "01/01/2024", dateFin: "31/12/2024" });
            expect(getHiddenInput("Date début").value).toBe("01/01/2024");
            expect(getHiddenInput("Date fin").value).toBe("31/12/2024");
        });
    });

    // ─── Accessibility ────────────────────────────────────────────────────────

    describe("Accessibility", () => {
        it("renders a label element for 'Date début'", () => {
            renderWithProviders(defaultProps);
            expect(screen.getByText("Date début", { selector: "label" })).toBeInTheDocument();
        });

        it("renders a label element for 'Date fin'", () => {
            renderWithProviders(defaultProps);
            expect(screen.getByText("Date fin", { selector: "label" })).toBeInTheDocument();
        });

        it("each DatePicker group is labelled by its label text", () => {
            renderWithProviders(defaultProps);
            // role="group" with accessible name derived from aria-labelledby
            expect(screen.getByRole("group", { name: "Date début" })).toBeInTheDocument();
            expect(screen.getByRole("group", { name: "Date fin" })).toBeInTheDocument();
        });

        it("renders Day/Month/Year spinbuttons for each picker (6 total)", () => {
            renderWithProviders(defaultProps);
            const spinbuttons = screen.getAllByRole("spinbutton");
            expect(spinbuttons).toHaveLength(6); // 3 sections × 2 pickers
        });

        it("renders 'Choose date' buttons for each picker", () => {
            renderWithProviders(defaultProps);
            const buttons = screen.getAllByRole("button", { name: /choose date/i });
            expect(buttons).toHaveLength(2);
        });
    });

    // ─── Date parsing ─────────────────────────────────────────────────────────

    describe("Date parsing (dd/MM/yyyy)", () => {
        it("correctly parses dd/MM/yyyy for dateDebut", () => {
            renderWithProviders({ ...defaultProps, dateDebut: "05/11/2023" });
            expect(getHiddenInput("Date début").value).toBe("05/11/2023");
        });

        it("correctly parses dd/MM/yyyy for dateFin", () => {
            renderWithProviders({ ...defaultProps, dateFin: "28/02/2024" });
            expect(getHiddenInput("Date fin").value).toBe("28/02/2024");
        });

        it("renders empty hidden input when dateDebut is empty", () => {
            renderWithProviders({ ...defaultProps, dateDebut: "" });
            expect(getHiddenInput("Date début").value).toBe("");
        });

        it("renders empty hidden input when dateFin is empty", () => {
            renderWithProviders({ ...defaultProps, dateFin: "" });
            expect(getHiddenInput("Date fin").value).toBe("");
        });
    });

    // ─── handleChange callbacks ───────────────────────────────────────────────

    describe("handleChange callbacks", () => {
        it("does not call handleChange on initial render", () => {
            const handleChange = vi.fn();
            renderWithProviders({ ...defaultProps, handleChange });
            expect(handleChange).not.toHaveBeenCalled();
        });
    });

    // ─── Layout ───────────────────────────────────────────────────────────────

    describe("Layout", () => {
        it("renders without crashing with all required props", () => {
            expect(() => renderWithProviders(defaultProps)).not.toThrow();
        });

        it("reflects updated dateDebut prop on rerender", () => {
            const { rerender } = renderWithProviders({ ...defaultProps, dateDebut: "01/01/2024" });
            expect(getHiddenInput("Date début").value).toBe("01/01/2024");

            rerender(
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                    <TendancePeriodeForm {...defaultProps} dateDebut="15/06/2024" />
                </LocalizationProvider>
            );
            expect(getHiddenInput("Date début").value).toBe("15/06/2024");
        });
    });
});
