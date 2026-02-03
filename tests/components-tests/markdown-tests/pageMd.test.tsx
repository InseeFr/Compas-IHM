/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useParams } from "@tanstack/react-router";
import HomeLayout from "components/accueilLayout/PageMdLayout";

vi.mock("@tanstack/react-router", () => ({
  useParams: vi.fn(),
  Link: ({ to, children, ...rest }: any) => (
            <a href={to} {...rest}>
                {children}
            </a>
        )
}));

vi.mock("components/Ariane", () => ({
  default: ({ items }: any) => (
    <div data-testid="ariane">{items[0].nav}</div>
  ),
}));


describe("HomeLayout", () => {
  it("Envoie un fil d'ariane et une page markdown", () => {
    vi.mocked(useParams).mockReturnValue({ pageName: "indicateurs-généraux" });

    render(<HomeLayout />);

    expect(screen.getByTestId("ariane")).toHaveTextContent("indicateurs-généraux");
    expect(screen.getAllByRole("paragraph")[0]).toHaveTextContent("les indicateurs généraux synthétisent en général un domaine et porte le nom du domaine, cela vaut pour Qualité, Sécurité, Devops, GreenIt, Météo ressentie, Accessibilité et Maturité Cloud.");
  });

});
