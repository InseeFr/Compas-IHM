import { render, screen } from "@testing-library/react";
import type { ACCESSIBILITE } from "constantes/constantes";
import Footer from "pages/Footer";

describe("Test Footer", () => {
    it("Affiche l'accessibilité ", () => {
        const access: ACCESSIBILITE[] = ["Non-conforme", "conforme", "partiel"];
        const texts: string[] = ["Non conforme", "Totalement conforme", "Partiellement conforme"];
        access.forEach((a, i) => {
            render(<Footer darkmode={true} accessibility={a} />);
            expect(screen.getByText(texts[i])).toBeDefined();
        });
    });
});
