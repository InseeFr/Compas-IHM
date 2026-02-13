import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getIndicatorsMarkdowns } from "todos-api/client.gen";
import { MarkdownProvider, useMarkdown } from "store/MarkdownIndicatorsContext";

vi.mock("todos-api/client.gen", () => ({
    getIndicatorsMarkdowns: vi.fn()
}));

const mockGetIndicatorsMarkdowns = vi.mocked(getIndicatorsMarkdowns);

function TestConsumer() {
    const { markdowns } = useMarkdown();
    return <div data-testid="markdowns">{JSON.stringify(markdowns)}</div>;
}

describe("MarkdownProvider", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("fournit les markdowns récupérés depuis l'API", async () => {
        const mockData = { indicateur1: "# Titre", indicateur2: "## Sous-titre" };
        mockGetIndicatorsMarkdowns.mockResolvedValueOnce(mockData);

        render(
            <MarkdownProvider>
                <TestConsumer />
            </MarkdownProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId("markdowns")).toHaveTextContent(JSON.stringify(mockData));
        });
    });

    it("initialise avec un objet vide avant la résolution de l'API", () => {
        mockGetIndicatorsMarkdowns.mockResolvedValueOnce({});

        render(
            <MarkdownProvider>
                <TestConsumer />
            </MarkdownProvider>
        );

        expect(screen.getByTestId("markdowns")).toHaveTextContent("{}");
    });

    it("log une erreur si l'API échoue", async () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        mockGetIndicatorsMarkdowns.mockRejectedValueOnce(new Error("API error"));

        render(
            <MarkdownProvider>
                <TestConsumer />
            </MarkdownProvider>
        );

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
                "Erreur lors de la récupération des markdowns",
                expect.any(Error)
            );
        });

        consoleSpy.mockRestore();
    });

    it("appelle l'API une seule fois au montage", async () => {
        mockGetIndicatorsMarkdowns.mockResolvedValueOnce({});

        render(
            <MarkdownProvider>
                <TestConsumer />
            </MarkdownProvider>
        );

        await waitFor(() => {
            expect(mockGetIndicatorsMarkdowns).toHaveBeenCalledTimes(1);
        });
    });

    it("lève une erreur si useMarkdown est utilisé hors du provider", () => {
        // Silence l'erreur React dans la console pendant le test
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        expect(() => render(<TestConsumer />)).toThrow(
            "useMarkdown doit être utilisé dans MarkdownProvider"
        );

        consoleSpy.mockRestore();
    });
});
