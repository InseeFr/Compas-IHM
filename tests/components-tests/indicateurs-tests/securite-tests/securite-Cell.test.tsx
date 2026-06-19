import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CveCell, MajVmCell, DelaiVMCell } from "pages/indicateurs/securite/SecuriteCell";
import type { SecuriteIndicateur } from "models/indicateurs";

// --- Mocks ---

vi.mock("components/ToolTipLayout", () => ({
    ToolTipLayout: ({ content }: { content: React.ReactNode }) => <div>{content}</div>
}));

vi.mock("constantes/trend.constants", () => ({
    TREND_CONFIG: {
        up: { icon: () => <span data-testid="icon-up" />, color: "green" },
        down: { icon: () => <span data-testid="icon-down" />, color: "red" },
        flat: { icon: () => <span data-testid="icon-flat" />, color: "grey" }
    }
}));

// --- Factory ---

function makeRow(overrides: Partial<SecuriteIndicateur> = {}): { original: SecuriteIndicateur } {
    return {
        original: {
            nbCveCritical: "0",
            nbCveHigh: "0",
            nbCveMedium: "0",
            nbCveLow: "0",
            nbCveCriticalPast: "0",
            nbCveHighPast: "0",
            nbCveMediumPast: "0",
            nbCveLowPast: "0",
            lettreCve: "A",
            lettreNiveauCve: undefined,
            lettreMajVm: "B",
            nbVmNonMaj: "0",
            vmCountPast: "0",
            delaiVmNonMiseAjour: "0",
            delaiVmNonMiseAJourPast: "0",
            ...overrides
        } as SecuriteIndicateur
    };
}

const VIDE = " ";

// --- CveCell ---

describe("CveCell", () => {
    it("affiche lettreCve quand lettreNiveauCve est absent", () => {
        render(<CveCell row={makeRow({ lettreCve: "B", lettreNiveauCve: undefined })} />);
        expect(screen.getByText(/B/)).toBeInTheDocument();
    });

    it("affiche lettreNiveauCve en priorité sur lettreCve", () => {
        render(<CveCell row={makeRow({ lettreCve: "B", lettreNiveauCve: "A" })} />);
        expect(screen.getByText(/A/)).toBeInTheDocument();
    });

    it("affiche NR et aucune icône quand les deux lettres sont absentes", () => {
        render(<CveCell row={makeRow({ lettreCve: undefined, lettreNiveauCve: undefined })} />);
        expect(screen.getByText(/NR/)).toBeInTheDocument();
        expect(screen.queryByTestId(/icon-/)).toBeNull();
    });

    it("affiche aucune icône quand les CVE actuels sont vides", () => {
        render(
            <CveCell
                row={makeRow({
                    nbCveCritical: VIDE,
                    nbCveHigh: VIDE,
                    nbCveMedium: VIDE,
                    nbCveLow: VIDE
                })}
            />
        );
        expect(screen.queryByTestId(/icon-/)).toBeNull();
    });

    it("affiche aucune icône quand les CVE past sont vides", () => {
        render(
            <CveCell
                row={makeRow({
                    nbCveCriticalPast: VIDE,
                    nbCveHighPast: VIDE,
                    nbCveMediumPast: VIDE,
                    nbCveLowPast: VIDE
                })}
            />
        );
        expect(screen.queryByTestId(/icon-/)).toBeNull();
    });

    it("affiche flat quand CVE now === CVE past", () => {
        render(
            <CveCell
                row={makeRow({
                    nbCveCritical: "1",
                    nbCveCriticalPast: "1"
                })}
            />
        );
        expect(screen.getByTestId("icon-flat")).toBeInTheDocument();
    });

    it("affiche up quand CVE now < CVE past (amélioration)", () => {
        render(
            <CveCell
                row={makeRow({
                    nbCveCritical: "1",
                    nbCveCriticalPast: "5"
                })}
            />
        );
        expect(screen.getByTestId("icon-up")).toBeInTheDocument();
    });

    it("affiche down quand CVE now > CVE past (dégradation)", () => {
        render(
            <CveCell
                row={makeRow({
                    nbCveCritical: "5",
                    nbCveCriticalPast: "1"
                })}
            />
        );
        expect(screen.getByTestId("icon-down")).toBeInTheDocument();
    });
});

// --- MajVmCell ---

describe("MajVmCell", () => {
    it("affiche NR et aucune icône quand nbVmNonMaj est vide", () => {
        render(<MajVmCell row={makeRow({ nbVmNonMaj: VIDE, vmCountPast: VIDE })} />);
        expect(screen.queryByTestId(/icon-/)).toBeNull();
    });

    it("affiche aucune icône quand vmCountPast est vide", () => {
        render(<MajVmCell row={makeRow({ nbVmNonMaj: "3", vmCountPast: VIDE })} />);
        expect(screen.queryByTestId(/icon-/)).toBeNull();
    });

    it("affiche flat quand nbVmNonMaj === vmCountPast", () => {
        render(<MajVmCell row={makeRow({ nbVmNonMaj: "3", vmCountPast: "3" })} />);
        expect(screen.getByTestId("icon-flat")).toBeInTheDocument();
    });

    it("affiche up quand nbVmNonMaj < vmCountPast (amélioration)", () => {
        render(<MajVmCell row={makeRow({ nbVmNonMaj: "1", vmCountPast: "5" })} />);
        expect(screen.getByTestId("icon-up")).toBeInTheDocument();
    });

    it("affiche down quand nbVmNonMaj > vmCountPast (dégradation)", () => {
        render(<MajVmCell row={makeRow({ nbVmNonMaj: "5", vmCountPast: "1" })} />);
        expect(screen.getByTestId("icon-down")).toBeInTheDocument();
    });
});

// --- DelaiVMCell ---

describe("DelaiVMCell", () => {
    it("affiche NR et aucune icône quand delaiVmNonMiseAjour est vide", () => {
        render(
            <DelaiVMCell row={makeRow({ delaiVmNonMiseAjour: VIDE, delaiVmNonMiseAJourPast: VIDE })} />
        );
        expect(screen.queryByTestId(/icon-/)).toBeNull();
    });

    it("affiche aucune icône quand delaiVmNonMiseAJourPast est vide", () => {
        render(
            <DelaiVMCell row={makeRow({ delaiVmNonMiseAjour: "10", delaiVmNonMiseAJourPast: VIDE })} />
        );
        expect(screen.queryByTestId(/icon-/)).toBeNull();
    });

    it("affiche flat quand delai now === delai past", () => {
        render(
            <DelaiVMCell row={makeRow({ delaiVmNonMiseAjour: "10", delaiVmNonMiseAJourPast: "10" })} />
        );
        expect(screen.getByTestId("icon-flat")).toBeInTheDocument();
    });

    it("affiche up quand delai now < delai past (amélioration)", () => {
        render(
            <DelaiVMCell row={makeRow({ delaiVmNonMiseAjour: "5", delaiVmNonMiseAJourPast: "20" })} />
        );
        expect(screen.getByTestId("icon-up")).toBeInTheDocument();
    });

    it("affiche down quand delai now > delai past (dégradation)", () => {
        render(
            <DelaiVMCell row={makeRow({ delaiVmNonMiseAjour: "20", delaiVmNonMiseAJourPast: "5" })} />
        );
        expect(screen.getByTestId("icon-down")).toBeInTheDocument();
    });
});
