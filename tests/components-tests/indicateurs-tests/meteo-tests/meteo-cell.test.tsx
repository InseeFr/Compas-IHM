/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import type { MeteoIndicateur } from "models/indicateurs";
import { MeteoCell, MeteoFormMonths } from "components/indicateurs/meteo/meteoCell";

vi.mock("pages/ToolTipLayout", () => ({
    ToolTipLayout: ({ title, content }: any) => (
        <div data-testid="tooltip">
            <div data-testid="tooltip-title">{title}</div>
            <div data-testid="tooltip-content">{content}</div>
        </div>
    )
}));

describe("MeteoCell", () => {
    const baseRow: { original: MeteoIndicateur } = {
        original: {
            byMonth: {
                "01": [
                    { date: "2026-01-01", valeur: 1, commentaire: "Orage" },
                    { date: "2026-01-02", valeur: 2 }
                ]
            },
            idApp: 0,
            applicationName: "",
            sndi: "",
            domaine: "",
            domaineFonc: ""
        }
    };

    it("rend les icônes correctes selon la valeur", () => {
        render(<MeteoCell row={baseRow} column={{ id: "m-01" }} />);
        const titles = screen.getAllByTestId("tooltip-title");
        expect(titles).toHaveLength(2);
        expect(titles[0].textContent).toContain("2026-01-01");
        expect(titles[0].textContent).toContain("Orage");
        expect(titles[1].textContent).toContain("2026-01-02");
    });

    it("rend un texte par défaut si la valeur n'est pas reconnue", () => {
        const row: any = {
            original: {
                byMonth: {
                    "01": [{ date: "2026-01-03", valeur: "99", commentaire: "Inconnu" }]
                }
            }
        };
        render(<MeteoCell row={row} column={{ id: "m-01" }} />);
        const title = screen.getByTestId("tooltip-title");
        expect(title.textContent).toContain("2026-01-03");
        expect(title.textContent).toContain("Inconnu");
    });

    it("retourne null si aucune donnée disponible", () => {
        const row: any = { original: { byMonth: { "01": [] } } };
        const { container } = render(<MeteoCell row={row} column={{ id: "m-01" }} />);
        expect(container.firstChild).toBeNull();
    });

    it("rend plusieurs points météo correctement", () => {
        const row: any = {
            original: {
                byMonth: {
                    "03": [
                        { date: "2026-03-01", valeur: "3" },
                        { date: "2026-03-02", valeur: "4" },
                        { date: "2026-03-03", valeur: "99", commentaire: "Inconnu" }
                    ]
                }
            }
        };
        render(<MeteoCell row={row} column={{ id: "m-03" }} />);
        const tooltips = screen.getAllByTestId("tooltip");
        expect(tooltips).toHaveLength(3);
        const titles = screen.getAllByTestId("tooltip-title");
        expect(titles[2].textContent).toContain("Inconnu");
    });
});

describe("MeteoFormMonths", () => {
    it("renders with default value", () => {
        const handleChange = vi.fn();
        render(<MeteoFormMonths nbMois={6} handleChange={handleChange} />);

        // Verify the combobox is rendered
        expect(screen.getByRole("combobox")).toBeInTheDocument();
        
        // Check the value via the hidden input
        const hiddenInput = document.querySelector('input.MuiSelect-nativeInput') as HTMLInputElement;
        expect(hiddenInput).toHaveValue("6");
    });

    it("renders all period options when opened", async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();
        render(<MeteoFormMonths nbMois={3} handleChange={handleChange} />);

        const select = screen.getByRole("combobox");
        await user.click(select);

        // Verify via role="option" which is more semantic
        const options = screen.getAllByRole("option");
        expect(options).toHaveLength(3);
        expect(options[0]).toHaveTextContent("3 mois");
        expect(options[1]).toHaveTextContent("6 mois");
        expect(options[2]).toHaveTextContent("12 mois");
    });

    it("calls handleChange when a new period is selected", async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();
        render(<MeteoFormMonths nbMois={3} handleChange={handleChange} />);

        const select = screen.getByRole("combobox");
        await user.click(select);
        
        // Get the option by role instead of text to avoid duplicates
        const options = screen.getAllByRole("option");
        const option12 = options.find(opt => opt.textContent?.includes("12 mois"));
        if (option12) {
            await user.click(option12);
        }

        expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it("is disabled when disabled prop is true", () => {
        const handleChange = vi.fn();
        render(<MeteoFormMonths nbMois={6} handleChange={handleChange} disabled={true} />);

        const select = screen.getByRole("combobox");
        // Material-UI uses aria-disabled instead of the disabled attribute
        expect(select).toHaveAttribute("aria-disabled", "true");
    });

    it("is enabled by default", () => {
        const handleChange = vi.fn();
        render(<MeteoFormMonths nbMois={6} handleChange={handleChange} />);

        const select = screen.getByRole("combobox");
        expect(select).not.toHaveAttribute("aria-disabled", "true");
    });

    it("displays calendar icon in label", () => {
        const handleChange = vi.fn();
        render(<MeteoFormMonths nbMois={6} handleChange={handleChange} />);

        // Verify the calendar icon is present by testId
        expect(screen.getByTestId("CalendarMonthIcon")).toBeInTheDocument();
        
        // Verify the combobox exists (which confirms the component rendered)
        expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
});