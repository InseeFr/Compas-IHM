/* eslint-disable @typescript-eslint/no-explicit-any */
// MeteoCell.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { MeteoIndicateur } from "models/indicateurs";
import { MeteoCell } from "components/indicateurs/meteo/meteoCell";

// Mock de ToolTipLayout pour simplifier le test
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
