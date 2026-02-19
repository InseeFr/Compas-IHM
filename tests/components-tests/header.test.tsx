// tests/header.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Header from "../../src/pages/Header";
import NavBarLayout from "../../src/components/NavBarLayout";
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@tanstack/react-router", async () => {
    return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Link: ({ to, children, ...rest }: any) => (
            <a href={to} {...rest}>
                {children}
            </a>
        )
    };
});

describe("Header et NavBar", () => {
    const toggleDarkMode = vi.fn();
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup();
        toggleDarkMode.mockReset();
    });

    it("affiche correctement le header", () => {
        render(<Header darkMode={false} toggleDarkMode={toggleDarkMode} />);

        expect(screen.getByTestId("header")).toBeVisible();
        expect(screen.getByTestId("header-logo")).toBeVisible();
        expect(screen.getByTestId("header-title")).toHaveTextContent("COMPAS");
    });

    it("redirige vers la home au clic sur le titre", async () => {
        render(<Header darkMode={false} toggleDarkMode={toggleDarkMode} />);
        const title = screen.getByTestId("header-title");

        const link = title.closest("a");

        expect(link).toHaveAttribute("href", "/");
    });

    it("ouvre un menu déroulant de la NavBar et clique sur un sous-item", async () => {
        render(<NavBarLayout darkMode={true} />);
        const mainButton = screen.getByRole("button", { name: "Indicateurs" });

        await user.click(mainButton);

        const subItem = await screen.findByText("Devops");
        expect(subItem).toBeVisible();

        await user.click(subItem);
        expect(subItem.closest("a")).toHaveAttribute("href", "/indicateur/devopsTable");
    });

    it("rend un header avec rôle banner implicite", () => {
        render(<Header darkMode={false} toggleDarkMode={toggleDarkMode} />);
        const header = screen.getByTestId("header");
        expect(header.tagName).toBe("HEADER");
        expect(header).not.toHaveAttribute("role", "header");
    });

    it("le bouton dark mode est cliquable", async () => {
        render(<Header darkMode={false} toggleDarkMode={toggleDarkMode} />);
        const button = screen.getByTestId("toggle-darkmode");

        await user.click(button);
        expect(toggleDarkMode).toHaveBeenCalled();
    });
});
