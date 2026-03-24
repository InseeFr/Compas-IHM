import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ACCESSIBILITE } from "constantes/constantes";
import Footer from "pages/Footer";
import { getTags } from "todos-api/client.gen";

// Mock de l'API
vi.mock("todos-api/client.gen", () => ({
    getTags: vi.fn()
}));

const mockGetTags = vi.mocked(getTags);

describe("Test Footer", () => {
    beforeEach(() => {
        mockGetTags.mockResolvedValue({});
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    // --- Accessibilité ---

    it("Affiche l'accessibilité", () => {
        const access: ACCESSIBILITE[] = ["Non-conforme", "conforme", "partiel"];
        const texts: string[] = ["Non conforme", "Totalement conforme", "Partiellement conforme"];
        access.forEach((a, i) => {
            render(<Footer darkmode={true} accessibility={a} />);
            expect(screen.getByText(texts[i])).toBeDefined();
        });
    });

    it("Affiche toujours le label fixe 'Accessibilité :'", () => {
        render(<Footer darkmode={false} accessibility="conforme" />);
        expect(screen.getByText("Accessibilité :")).toBeDefined();
    });

    it("Applique la couleur rouge pour 'Non-conforme'", () => {
        const { container } = render(<Footer darkmode={false} accessibility="Non-conforme" />);
        const iconBox = container.querySelector(".footer-box-access-icon");
        expect(iconBox).toHaveStyle({ "--main-color": "#d32f2f" });
    });

    it("Applique la couleur orange pour 'partiel'", () => {
        const { container } = render(<Footer darkmode={false} accessibility="partiel" />);
        const iconBox = container.querySelector(".footer-box-access-icon");
        expect(iconBox).toHaveStyle({ "--main-color": "#f57c00" });
    });

    it("Applique la couleur verte pour 'conforme'", () => {
        const { container } = render(<Footer darkmode={false} accessibility="conforme" />);
        const iconBox = container.querySelector(".footer-box-access-icon");
        expect(iconBox).toHaveStyle({ "--main-color": "#388e3c" });
    });

    // --- Structure DOM ---

    it("Rend un élément <footer> avec l'id 'pied-de-page'", () => {
        const { container } = render(<Footer darkmode={false} accessibility="conforme" />);
        const footer = container.querySelector("footer#pied-de-page");
        expect(footer).not.toBeNull();
    });

    it("L'élément <output> possède l'attribut aria-live='polite'", () => {
        const { container } = render(<Footer darkmode={false} accessibility="conforme" />);
        const output = container.querySelector("output");
        expect(output).toHaveAttribute("aria-live", "polite");
    });

    it("Les icônes SVG ont aria-hidden='true'", () => {
        const access: ACCESSIBILITE[] = ["Non-conforme", "conforme", "partiel"];
        access.forEach(a => {
            const { container } = render(<Footer darkmode={false} accessibility={a} />);
            const svgs = container.querySelectorAll("svg");
            svgs.forEach(svg => {
                expect(svg).toHaveAttribute("aria-hidden", "true");
            });
        });
    });

    // --- Tags API ---

    it("Affiche 'Non défini' quand les tags ne sont pas encore chargés", () => {
        mockGetTags.mockImplementation(() => new Promise(() => {})); // promesse en suspens
        render(<Footer darkmode={false} accessibility="conforme" />);
        const nonDefinis = screen.getAllByText("Non défini");
        expect(nonDefinis.length).toBeGreaterThanOrEqual(2);
    });

    it("Affiche les tags API et IHM une fois chargés", async () => {
        mockGetTags.mockResolvedValue({
            apiTagView: { tag: "v1.2.3", createdAt: "2024-01-15" },
            ihmTagView: { tag: "v2.0.0", createdAt: "2024-02-20" }
        });

        render(<Footer darkmode={false} accessibility="conforme" />);

        await waitFor(() => {
            expect(screen.getByText("v1.2.3")).toBeDefined();
            expect(screen.getByText("v2.0.0")).toBeDefined();
        });
    });

    it("Appelle getTags une seule fois au montage", async () => {
        render(<Footer darkmode={false} accessibility="conforme" />);

        await waitFor(() => {
            expect(mockGetTags).toHaveBeenCalledTimes(1);
        });
    });

    it("Affiche les labels 'API' et 'IHM'", () => {
        render(<Footer darkmode={false} accessibility="conforme" />);
        expect(screen.getByText("API")).toBeDefined();
        expect(screen.getByText("IHM")).toBeDefined();
    });
});
