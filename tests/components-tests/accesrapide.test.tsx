import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AccesRapide from "components/AccesRapide";

describe("AccesRapide", () => {
    it("devrait afficher le composant avec tous les liens", () => {
        render(<AccesRapide darkMode={false} />);

        const nav = screen.getByRole("navigation", { name: /accès rapide/i });
        expect(nav).toBeInTheDocument();

        const contenuLink = screen.getByRole("link", { name: /contenu/i });
        const menuLink = screen.getByRole("link", { name: /menu/i });
        const piedLink = screen.getByRole("link", { name: /pied de page/i });

        expect(contenuLink).toBeInTheDocument();
        expect(menuLink).toBeInTheDocument();
        expect(piedLink).toBeInTheDocument();
    });

    it("devrait avoir les bonnes ancres href", () => {
        render(<AccesRapide darkMode={false} />);

        const contenuLink = screen.getByRole("link", { name: /contenu/i });
        const menuLink = screen.getByRole("link", { name: /menu/i });
        const piedLink = screen.getByRole("link", { name: /pied de page/i });

        expect(contenuLink).toHaveAttribute("href", "#contenu");
        expect(menuLink).toHaveAttribute("href", "#navigation");
        expect(piedLink).toHaveAttribute("href", "#pied-de-page");
    });

    it("devrait appliquer la classe skip-links par défaut", () => {
        render(<AccesRapide darkMode={false} />);

        const nav = screen.getByRole("navigation", { name: /accès rapide/i });
        expect(nav).toHaveClass("skip-links");
        expect(nav).not.toHaveClass("dark-mode");
    });

    it("devrait appliquer la classe dark-mode quand darkMode est true", () => {
        render(<AccesRapide darkMode={true} />);

        const nav = screen.getByRole("navigation", { name: /accès rapide/i });
        expect(nav).toHaveClass("skip-links");
        expect(nav).toHaveClass("dark-mode");
    });

    it("ne devrait pas appliquer la classe dark-mode quand darkMode est false", () => {
        render(<AccesRapide darkMode={false} />);

        const nav = screen.getByRole("navigation", { name: /accès rapide/i });
        expect(nav).toHaveClass("skip-links");
        expect(nav).not.toHaveClass("dark-mode");
    });

    it("devrait avoir l'attribut role navigation", () => {
        render(<AccesRapide darkMode={false} />);

        const nav = screen.getByRole("navigation", { name: /accès rapide/i });
        expect(nav).toHaveAttribute("role", "navigation");
    });

    it("devrait avoir l'attribut aria-label correct", () => {
        render(<AccesRapide darkMode={false} />);

        const nav = screen.getByRole("navigation", { name: /accès rapide/i });
        expect(nav).toHaveAttribute("aria-label", "Accès rapide");
    });

    it("devrait afficher une liste avec 3 éléments", () => {
        const { container } = render(<AccesRapide darkMode={false} />);

        const listItems = container.querySelectorAll("li");
        expect(listItems).toHaveLength(3);
    });
});
