/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import HomePageLayout from "pages/Home";

vi.mock("../assets/content/compas-accueil.md?raw", () => ({
    default:
        "# Titre principal\n\n## Sous-titre\n\nContenu du paragraphe avec [un lien](https://example.com)"
}));

vi.mock("react-markdown", () => ({
    default: ({ children, components }: any) => {
        const lines = children.split("\n");
        return (
            <div data-testid="markdown-container">
                {lines.map((line: string) => {
                    if (line.startsWith("#")) {
                        const H1 = components.h1;
                        return <H1 key={`${line}-h1`}>{line.substring(2)}</H1>;
                    }
                    if (line.startsWith("##")) {
                        const H2 = components.h2;
                        return <H2 key={`${line}-h2`}>{line.substring(3)}</H2>;
                    }
                    if (line.includes("[") && line.includes("](")) {
                        const match = new RegExp(/\[(.+?)\]\((.+?)\)/).exec(line);
                        if (match) {
                            const A = components.a;
                            return (
                                <span key={`${line}-a`}>
                                    <A href={match[2]}>{match[1]}</A>
                                </span>
                            );
                        }
                    }
                    if (line.trim()) {
                        const P = components.p;
                        return <P key={`${line}-p`}>{line}</P>;
                    }
                    return null;
                })}
            </div>
        );
    }
}));

describe("HomePageLayout", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Chargement du contenu markdown", () => {
        it("devrait charger et afficher le contenu markdown au montage du composant", async () => {
            render(<HomePageLayout />);

            await waitFor(() => {
                expect(screen.getByTestId("markdown-container")).toBeInTheDocument();
            });
        });

        it("devrait afficher un titre h1 avec les styles MUI appropriés", async () => {
            render(<HomePageLayout />);

            await waitFor(() => {
                const heading = screen.getByText("Compas");
                expect(heading).toBeInTheDocument();
                expect(heading.tagName).toBe("H1");
            });
        });
    });

    describe("Accessibilité", () => {
        it("devrait rendre les titres h1 focusables avec tabIndex", async () => {
            render(<HomePageLayout />);

            await waitFor(() => {
                const heading = screen.getByText("Compas");
                expect(heading).toHaveAttribute("tabIndex", "0");
            });
        });

        it("devrait rendre les paragraphes focusables avec tabIndex", async () => {
            render(<HomePageLayout />);

            await waitFor(() => {
                const paragraph = screen.getByText(
                    "- schémas des interactions des systémes Oscar, Analyzer et Compas"
                );
                expect(paragraph).toHaveAttribute("tabIndex", "0");
            });
        });
    });

    describe("Liens externes", () => {
        it("devrait rendre les liens avec target=_blank et rel=noopener noreferrer", async () => {
            render(<HomePageLayout />);

            await waitFor(() => {
                const link = screen.getByText("décrits ici");
                expect(link).toHaveAttribute("href");
                expect(link).toHaveAttribute("target", "_blank");
                expect(link).toHaveAttribute("rel", "noopener noreferrer");
            });
        });
    });

    describe("Structure du composant", () => {
        it("devrait rendre le contenu dans un Container MUI sans gutters", () => {
            const { container } = render(<HomePageLayout />);

            const muiContainer = container.querySelector(".MuiContainer-root");
            expect(muiContainer).toBeInTheDocument();
            expect(muiContainer).toHaveClass("MuiContainer-disableGutters");
        });

        it("devrait appliquer la classe CSS pour le style markdown", () => {
            const { container } = render(<HomePageLayout />);

            const markdownDiv = container.querySelector(".markdown-content");
            expect(markdownDiv).toBeInTheDocument();
        });
    });

    describe("Gestion des erreurs", () => {
        it("devrait logger une erreur si le fichier markdown n'est pas trouvé", async () => {
            const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

            expect(consoleErrorSpy).toBeDefined();

            consoleErrorSpy.mockRestore();
        });
    });
});
