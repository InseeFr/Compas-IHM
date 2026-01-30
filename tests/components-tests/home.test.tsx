/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import HomePageLayout from "pages/Home";

vi.mock("@tanstack/react-router", () => ({
    Link: ({ children, params }: any) => <a href={`/${params?.pageName}`}>{children}</a>
}));

vi.mock("assets/content/pagesMdConfig.json", () => ({
    default: [
        { parent: "Indicateur", file: "indicateur-dev", page: "Devops" },
        { parent: "Indicateur", file: "indicateur-sec", page: "Sécu" },
        { parent: "Indicateur", file: "indicateur-qual", page: "Qualité" }
    ]
}));

describe("HomePageLayout", () => {
    beforeEach(() => {
        render(<HomePageLayout />);
    });

    it("render le composant", () => {
        expect(screen.getByText("Accueil")).toBeInTheDocument();
    });

    it("affiche le titre principal", () => {
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Accueil");
    });

    it("affiche le texte descriptif", () => {
        expect(screen.getByText(/liste de tous les indicateurs/i)).toBeInTheDocument();
    });

    it("affiche le parent unique", () => {
        expect(screen.getByText("Indicateur")).toBeInTheDocument();
    });

    it("affiche trois liens", () => {
        expect(screen.getAllByRole("link")).toHaveLength(3);
    });

    it("affiche les bons libellés de pages", () => {
        expect(screen.getByText("Devops")).toBeInTheDocument();
        expect(screen.getByText("Sécu")).toBeInTheDocument();
        expect(screen.getByText("Qualité")).toBeInTheDocument();
    });

    it("chaque lien a la bonne route", () => {
        expect(screen.getByText("Devops").closest("a")).toHaveAttribute("href", "/indicateur-dev");

        expect(screen.getByText("Sécu").closest("a")).toHaveAttribute("href", "/indicateur-sec");

        expect(screen.getByText("Qualité").closest("a")).toHaveAttribute("href", "/indicateur-qual");
    });

    it("le parent contient exactement trois liens", () => {
        const li = screen.getByText("Indicateur").closest("li")!;
        const links = within(li).getAllByRole("link");
        expect(links).toHaveLength(3);
    });
});
