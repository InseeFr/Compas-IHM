/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("hooks/useCompasDataDate", () => ({
    useCompasDataDate: vi.fn()
}));

import { useCompasDataDate } from "hooks/useCompasDataDate";
import { GreenItDate } from "components/GreenItDate";

describe("GreenItDate", () => {
    it("affiche le Skeleton pendant le chargement", () => {
        (useCompasDataDate as any).mockReturnValue({
            data: null,
            isLoading: true,
            isError: false
        });

        const { container } = render(<GreenItDate />);
        expect(container.querySelector(".MuiSkeleton-root")).toBeInTheDocument();
    });

    it("retourne null en cas d’erreur", () => {
        (useCompasDataDate as any).mockReturnValue({
            data: null,
            isLoading: false,
            isError: true
        });

        const { container } = render(<GreenItDate />);
        expect(container.firstChild).toBeNull();
    });

    it("affiche la date formatée correctement", () => {
        (useCompasDataDate as any).mockReturnValue({
            data: "2024-01-15T00:00:00.000Z",
            isLoading: false,
            isError: false
        });

        render(<GreenItDate />);

        expect(screen.getByText("Données du 15 janvier 2024")).toBeInTheDocument();
    });

    it("affiche un label personnalisé", () => {
        (useCompasDataDate as any).mockReturnValue({
            data: "2024-01-15T00:00:00.000Z",
            isLoading: false,
            isError: false
        });

        render(<GreenItDate label="Mise à jour du" />);

        expect(screen.getByText("Mise à jour du 15 janvier 2024")).toBeInTheDocument();
    });
});
