import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import MarkdownLink from "components/accueilLayout/custom/LinkWrapper/MarkdownLink";

// Mock dependencies
vi.mock("./external-link", () => ({
    default: ({ href, children }: { href: string; children: React.ReactNode }) => (
        <a href={href} data-testid="external-link">
            {children}
        </a>
    )
}));

vi.mock("./helpers", () => ({
    generateLinkId: vi.fn(() => "test-link-id")
}));

describe("MarkdownLink", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("when href is not provided", () => {
        it("renders a span with the generated link id", () => {
            render(<MarkdownLink>Click me</MarkdownLink>);
            const span = screen.getByText("Click me");
            expect(span.tagName).toBe("SPAN");
            expect(span).toHaveAttribute("id", "link-1");
        });

        it("renders children inside the span", () => {
            render(<MarkdownLink>Some text</MarkdownLink>);
            expect(screen.getByText("Some text")).toBeInTheDocument();
        });
    });

    describe("when href is an http link", () => {
        it("renders ExternalLink for http:// URLs", () => {
            render(<MarkdownLink href="http://example.com">Link</MarkdownLink>);
            expect(screen.getByTestId("external-link")).toBeInTheDocument();
            expect(screen.getByTestId("external-link")).toHaveAttribute("href", "http://example.com");
        });

        it("renders ExternalLink for https:// URLs", () => {
            render(<MarkdownLink href="https://example.com">Link</MarkdownLink>);
            expect(screen.getByTestId("external-link")).toBeInTheDocument();
            expect(screen.getByTestId("external-link")).toHaveAttribute("href", "https://example.com");
        });

        it("renders children inside ExternalLink", () => {
            render(<MarkdownLink href="https://example.com">External</MarkdownLink>);
            expect(screen.getByText("External")).toBeInTheDocument();
        });
    });

    describe("when href is an internal link", () => {
        it("renders a plain anchor tag", () => {
            render(<MarkdownLink href="/about">About</MarkdownLink>);
            const link = screen.getByText("About");
            expect(link.tagName).toBe("A");
            expect(link).toHaveAttribute("href", "/about");
        });

        it("renders children inside the anchor", () => {
            render(<MarkdownLink href="#section">Jump to section</MarkdownLink>);
            expect(screen.getByText("Jump to section")).toBeInTheDocument();
        });

        it("passes through additional props to the anchor", () => {
            render(
                <MarkdownLink href="/contact" aria-label="Contact page">
                    Contact
                </MarkdownLink>
            );
            expect(screen.getByText("Contact")).toHaveAttribute("aria-label", "Contact page");
        });
    });
});
