import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { GreenItDate } from "components/GreenItDate";

describe("GreenItDate", () => {
    it("renders a skeleton when dates are missing", () => {
        const { container } = render(<GreenItDate lastDate="" penultimateDate="" />);

        expect(container.querySelector(".MuiSkeleton-root")).toBeInTheDocument();
    });

    it("renders the formatted dates with the default label", () => {
        render(<GreenItDate lastDate="15/03/2024" penultimateDate="08/03/2024" />);

        expect(screen.getByText("Données du 15 mars 2024 (du 8 mars 2024)")).toBeInTheDocument();
    });

    it("renders a custom label", () => {
        render(<GreenItDate label="Mis à jour le" lastDate="01/01/2024" penultimateDate="25/12/2023" />);

        expect(
            screen.getByText("Mis à jour le 1 janvier 2024 (du 25 décembre 2023)")
        ).toBeInTheDocument();
    });
});
