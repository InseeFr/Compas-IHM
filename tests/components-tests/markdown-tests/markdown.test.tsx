/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import { MarkdownLayout } from "components/accueilLayout/MarkdownLayout";

vi.mock("react-markdown", () => ({
    __esModule: true,
    default: ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>
}));

vi.mock("./custom/TableCustom", () => ({
    CustomTable: {
        table: () => <table />,
        th: () => <th />
    }
}));

vi.mock("./custom/LinkCustom", () => ({
    LinkCustom: {
        a: ({ href, children }: any) => <a href={href}>{children}</a>
    }
}));

vi.mock("utils/markdown-files", () => ({
    markdownFiles: {
        "../../assets/content/test.md": "# Hello world",
        "../../assets/content/other.md": "## Other content"
    }
}));

describe("MarkdownLayout", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("affiche le contenu markdown quand le fichier existe", async () => {
        render(<MarkdownLayout file="test" />);

        expect(await screen.findByTestId("markdown")).toHaveTextContent("# Hello world");
    });

    it("change le contenu quand la prop file change", async () => {
        const { rerender } = render(<MarkdownLayout file="test" />);

        expect(await screen.findByText("# Hello world")).toBeInTheDocument();

        rerender(<MarkdownLayout file="other" />);

        expect(await screen.findByText("## Other content")).toBeInTheDocument();
    });

    it("log une erreur si le fichier n'existe pas", async () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        render(<MarkdownLayout file="unknown" />);

        await vi.waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith("Impossible de charger le fichier: ", "unknown");
        });

        consoleSpy.mockRestore();
    });

    it("rend un container markdown même sans contenu", () => {
        render(<MarkdownLayout file="unknown" />);

        expect(screen.getByTestId("markdown")).toBeInTheDocument();
    });
});
