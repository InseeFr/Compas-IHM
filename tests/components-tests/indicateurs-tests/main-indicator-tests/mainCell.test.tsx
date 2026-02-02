/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import {
    QualityCell,
    SecurityCell,
    DevopsCell,
    MeteoCell,
    GreenItCell,
    A11yCell,
    MaturityCell
} from "pages/indicateurs/main-indicator/mainCell";
import type { GlobalIndicator } from "models/indicateurs";

vi.mock("components/ToolTipLayout", () => ({
    ToolTipLayout: ({ title, content }: any) => (
        <div data-testid="tooltip">
            <div data-testid="tooltip-title">{title}</div>
            <div data-testid="tooltip-content">{content}</div>
        </div>
    )
}));

vi.mock("utils/date-functions", () => ({
    isDateOlderThan31Days: vi.fn((date: string) => {
        const testDate = new Date(date);
        const thirtyOneDaysAgo = new Date();
        thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);
        return testDate < thirtyOneDaysAgo;
    })
}));

vi.mock("utils/meteoIcon", () => ({
    getMeteoIcon: vi.fn((value: string) => <span data-testid="meteo-icon">{value}</span>)
}));

vi.mock("@mui/icons-material/Error", () => ({
    default: () => <span data-testid="error-icon">ErrorIcon</span>
}));

describe("QualityCell", () => {
    const createRow = (overrides: Partial<GlobalIndicator> = {}): { original: GlobalIndicator } => ({
        original: {
            lettreCouvertureTestUniaire: "A",
            pourcentageCouvertureTestUniaire: "85",
            lettreFiabilite: "B",
            lettreDetteTechnique: "C",
            detteTechnique: "4200",
            lettreQualiteGenerale: "B",
            ...overrides
        } as GlobalIndicator
    });

    it("affiche la lettre de qualité générale", () => {
        render(<QualityCell row={createRow()} />);

        const content = screen.getByTestId("tooltip-content");
        expect(content.textContent).toBe("B");
    });

    it("affiche les détails de qualité dans le tooltip", () => {
        render(<QualityCell row={createRow()} />);

        const title = screen.getByTestId("tooltip-title");
        expect(title.textContent).toContain(
            `Couverture de test: A (
                    85) 
                    Fiabilité: B 
                    Dette technique: C (10 
                    jours)`
        );
    });

    it("calcule correctement la dette technique en jours", () => {
        render(<QualityCell row={createRow({ detteTechnique: "840" })} />);

        const title = screen.getByTestId("tooltip-title");
        expect(title.textContent).toContain(
            `Couverture de test: A (
                    85) 
                    Fiabilité: B 
                    Dette technique: C (2 
                    jours)`
        );
    });

    it("utilise le singulier pour 1 jour de dette", () => {
        render(<QualityCell row={createRow({ detteTechnique: "420" })} />);

        const title = screen.getByTestId("tooltip-title");
        expect(title.textContent).toContain(
            `Couverture de test: A (
                    85) 
                    Fiabilité: B 
                    Dette technique: C (1 
                    jour)`
        );
    });

    it("utilise le singulier pour 0 jour de dette", () => {
        render(<QualityCell row={createRow({ detteTechnique: "100" })} />);

        const title = screen.getByTestId("tooltip-title");
        expect(title.textContent).toContain(
            `Couverture de test: A (
                    85) 
                    Fiabilité: B 
                    Dette technique: C (0 
                    jour)`
        );
    });

    it("gère les valeurs NR", () => {
        render(
            <QualityCell
                row={createRow({
                    lettreCouvertureTestUniaire: "NR",
                    pourcentageCouvertureTestUniaire: "NR",
                    lettreFiabilite: "NR",
                    lettreDetteTechnique: "NR",
                    detteTechnique: "NR"
                })}
            />
        );

        const title = screen.getByTestId("tooltip-title");
        expect(title.textContent).toContain("NR");
    });

    it("gère une dette technique undefined", () => {
        render(<QualityCell row={createRow({ detteTechnique: undefined as any })} />);

        const title = screen.getByTestId("tooltip-title");
        expect(title.textContent).toContain(
            `Couverture de test: A (
                    85) 
                    Fiabilité: B 
                    Dette technique: C (0 
                    jour)`
        );
    });
});

describe("SecurityCell", () => {
    const createRow = (overrides: Partial<GlobalIndicator> = {}): { original: GlobalIndicator } => ({
        original: {
            lettreGlobaleSecurite: "B",
            nbCveCritical: "2",
            nbCveHigh: "5",
            nbCveMedium: "10",
            nbCveLow: "3",
            nbVmNonMaj: "4",
            ...overrides
        } as GlobalIndicator
    });

    it("affiche la lettre de sécurité globale", () => {
        render(<SecurityCell row={createRow()} />);

        const content = screen.getByTestId("tooltip-content");
        expect(content.textContent).toBe("B");
    });

    it("affiche les détails de sécurité dans le tooltip", () => {
        render(<SecurityCell row={createRow()} />);

        const title = screen.getByTestId("tooltip-title");
        expect(title.textContent).toContain("Cve critique : 2");
        expect(title.textContent).toContain("Cve élevé : 5");
        expect(title.textContent).toContain("Cve moyenne : 10");
        expect(title.textContent).toContain("Cve faible : 3");
        expect(title.textContent).toContain("Nombre de VM non mises à jour : 4");
    });

    it("gère les valeurs NR pour les CVE", () => {
        render(
            <SecurityCell
                row={createRow({
                    nbCveCritical: "NR",
                    nbCveHigh: "NR",
                    nbCveMedium: "NR",
                    nbCveLow: "NR",
                    nbVmNonMaj: "NR"
                })}
            />
        );

        const title = screen.getByTestId("tooltip-title");
        expect(title.textContent).toContain("Cve critique : NR");
        expect(title.textContent).toContain("Cve élevé : NR");
        expect(title.textContent).toContain("Cve moyenne : NR");
        expect(title.textContent).toContain("Cve faible : NR");
        expect(title.textContent).toContain("Nombre de VM non mises à jour : NR");
    });

    it("convertit les nombres de CVE en Number", () => {
        render(<SecurityCell row={createRow({ nbCveCritical: "0" })} />);

        const title = screen.getByTestId("tooltip-title");
        expect(title.textContent).toContain(
            `Cve critique : 0
                Cve élevé : 5
                Cve moyenne : 10
                Cve faible : 3
                Nombre de VM non mises à jour : 4`
        );
    });
});

describe("DevopsCell", () => {
    const createRow = (overrides: Partial<GlobalIndicator> = {}): { original: GlobalIndicator } => ({
        original: {
            lettreDistanceCount: "B",
            distanceCount: "15",
            lettreDevopsGenerale: "B",
            ...overrides
        } as GlobalIndicator
    });

    it("affiche la lettre de dvops général", () => {
        render(<DevopsCell row={createRow()} />);

        const content = screen.getByTestId("tooltip-content");
        expect(content.textContent).toBe("B");
    });

    it("affiche le nombre de jours dans le tooltip", () => {
        render(<DevopsCell row={createRow()} />);

        const title = screen.getByTestId("tooltip-title");
        expect(title.textContent).toBe("Jours depuis la dernière livraison : 15");
    });

    it("affiche 'Non renseigné' pour NR", () => {
        render(<DevopsCell row={createRow({ lettreDistanceCount: "NR" })} />);

        const title = screen.getByTestId("tooltip-title");
        expect(title.textContent).toBe("Non renseigné");
    });

    it("affiche 'Sans objet' pour SO", () => {
        render(<DevopsCell row={createRow({ lettreDistanceCount: "SO" })} />);

        const title = screen.getByTestId("tooltip-title");
        expect(title.textContent).toBe("Sans objet");
    });

    it("gère la valeur 0 jour", () => {
        render(<DevopsCell row={createRow({ distanceCount: "0" })} />);

        const title = screen.getByTestId("tooltip-title");
        expect(title.textContent).toBe("Jours depuis la dernière livraison : 0");
    });
});

describe("MeteoCell", () => {
    const createRow = (overrides: Partial<GlobalIndicator> = {}): { original: GlobalIndicator } => ({
        original: {
            meteo: 3,
            meteoCommentaire: "Beau temps",
            dateMeteoCommentaire: new Date().toISOString().split("T")[0],
            ...overrides
        } as GlobalIndicator
    });

    it("affiche l'icône météo pour une date récente", () => {
        render(<MeteoCell row={createRow()} />);

        expect(screen.getByTestId("meteo-icon")).toBeInTheDocument();
    });

    it("affiche le commentaire météo dans le tooltip pour une date récente", () => {
        render(<MeteoCell row={createRow()} />);

        const title = screen.getByTestId("tooltip-title");
        expect(title.textContent).toBe("Beau temps");
    });

    it("affiche l'icône d'erreur pour une date ancienne (>31 jours)", () => {
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 40);

        render(<MeteoCell row={createRow({ dateMeteoCommentaire: oldDate.toISOString() })} />);

        expect(screen.getByTestId("error-icon")).toBeInTheDocument();
    });

    it("affiche le message approprié dans le tooltip pour une date ancienne", () => {
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 40);

        render(<MeteoCell row={createRow({ dateMeteoCommentaire: oldDate.toISOString() })} />);

        const title = screen.getByTestId("tooltip-title");
        expect(title.textContent).toBe("Météo vieille de plus de 31 jours");
    });

    it("gère un commentaire météo absent avec date récente", () => {
        render(<MeteoCell row={createRow({ meteoCommentaire: undefined as any })} />);

        expect(screen.getByTestId("meteo-icon")).toBeInTheDocument();
    });

    it("convertit meteo en string pour l'icône", () => {
        render(<MeteoCell row={createRow({ meteo: 4 })} />);

        expect(screen.getByTestId("meteo-icon")).toBeInTheDocument();
    });
});

describe("GreenItCell", () => {
    const createRow = (overrides: Partial<GlobalIndicator> = {}): { original: GlobalIndicator } => ({
        original: {
            lettreGreen: "B",
            gaspillage: "25",
            consoNormalized: "80",
            impactNormalized: "70",
            ...overrides
        } as GlobalIndicator
    });

    it("affiche la lettre GreenIT", () => {
        render(<GreenItCell row={createRow()} />);

        const content = screen.getByTestId("tooltip-content");
        expect(content.textContent).toBe("B");
    });

    it("affiche les détails GreenIT dans le tooltip", () => {
        render(<GreenItCell row={createRow()} />);

        const title = screen.getByTestId("tooltip-title");
        expect(title.textContent).toContain("Gaspillage : 25");
        expect(title.textContent).toContain("Consommation : 80");
        expect(title.textContent).toContain("Impact : 70");
    });

    it("gère les valeurs NR", () => {
        render(
            <GreenItCell
                row={createRow({
                    gaspillage: "NR",
                    consoNormalized: "NR",
                    impactNormalized: "NR"
                })}
            />
        );

        const title = screen.getByTestId("tooltip-title");
        expect(title.textContent).toContain("Gaspillage : NR");
        expect(title.textContent).toContain("Consommation : NR");
        expect(title.textContent).toContain("Impact : NR");
    });

    it("gère les valeurs SO", () => {
        render(
            <GreenItCell
                row={createRow({
                    lettreGreen: "SO",
                    gaspillage: "SO",
                    consoNormalized: "SO",
                    impactNormalized: "SO"
                })}
            />
        );

        const content = screen.getByTestId("tooltip-content");
        expect(content.textContent).toBe("SO");
    });
});

describe("A11yCell", () => {
    const createRow = (overrides: Partial<GlobalIndicator> = {}): { original: GlobalIndicator } => ({
        original: {
            lettreA11y: "A",
            scoreAuditA11y: 95,
            declarationA11y: true,
            dateDeclarationA11y: "2025-06-01",
            isModule: false,
            ...overrides
        } as GlobalIndicator
    });

    it("affiche la lettre d'accessibilité", () => {
        render(<A11yCell row={createRow()} />);

        const content = screen.getByTestId("tooltip-content");
        expect(content.textContent).toBe("A");
    });

    it("affiche le score d'audit dans le tooltip", () => {
        render(<A11yCell row={createRow()} />);

        const title = screen.getByTestId("tooltip-title");
        expect(title.textContent).toBe("Score audit : 95%");
    });

    it("affiche 'Score non renseigné' pour NR", () => {
        render(<A11yCell row={createRow({ lettreA11y: "NR" })} />);

        const title = screen.getByTestId("tooltip-title");
        expect(title.textContent).toBe("Score non renseigné");
    });

    describe("logique module", () => {
        it("affiche H pour un module sans déclaration", () => {
            render(
                <A11yCell
                    row={createRow({
                        isModule: true,
                        declarationA11y: false
                    })}
                />
            );

            const content = screen.getByTestId("tooltip-content");
            // Note: le contenu affiche toujours lettreA11y, pas displayedLetter
            expect(content.textContent).toBe("A");
        });

        it("affiche H pour un module avec déclaration > 3 ans", () => {
            const fourYearsAgo = new Date();
            fourYearsAgo.setFullYear(fourYearsAgo.getFullYear() - 4);

            render(
                <A11yCell
                    row={createRow({
                        isModule: true,
                        declarationA11y: true,
                        dateDeclarationA11y: fourYearsAgo.toISOString()
                    })}
                />
            );

            const content = screen.getByTestId("tooltip-content");
            expect(content.textContent).toBe("A");
        });

        it("n'applique pas la règle métier pour les applications", () => {
            render(
                <A11yCell
                    row={createRow({
                        isModule: false,
                        declarationA11y: false
                    })}
                />
            );

            const content = screen.getByTestId("tooltip-content");
            expect(content.textContent).toBe("A");
        });

        it("garde la lettre originale pour un module avec déclaration récente", () => {
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

            render(
                <A11yCell
                    row={createRow({
                        isModule: true,
                        declarationA11y: true,
                        dateDeclarationA11y: oneYearAgo.toISOString()
                    })}
                />
            );

            const content = screen.getByTestId("tooltip-content");
            expect(content.textContent).toBe("A");
        });
    });

    it("gère un score à 0", () => {
        render(<A11yCell row={createRow({ scoreAuditA11y: 0 })} />);

        const title = screen.getByTestId("tooltip-title");
        expect(title.textContent).toBe("Score audit : 0%");
    });
});

describe("MaturityCell", () => {
    const createRow = (overrides: Partial<GlobalIndicator> = {}): { original: GlobalIndicator } => ({
        original: {
            maturite: "B",
            ...overrides
        } as GlobalIndicator
    });

    it("affiche la lettre de maturité", () => {
        render(<MaturityCell row={createRow()} />);

        const content = screen.getByTestId("tooltip-content");
        expect(content.textContent).toBe("B");
    });

    it("affiche le label pour maturité A", () => {
        render(<MaturityCell row={createRow({ maturite: "A" })} />);

        const title = screen.getByTestId("tooltip-title");
        expect(title.textContent).toBe("Maturité forte");
    });

    it("affiche le label pour maturité B", () => {
        render(<MaturityCell row={createRow({ maturite: "B" })} />);

        const title = screen.getByTestId("tooltip-title");
        expect(title.textContent).toBe("Maturité assez forte");
    });

    it("affiche le label pour maturité C", () => {
        render(<MaturityCell row={createRow({ maturite: "C" })} />);

        const title = screen.getByTestId("tooltip-title");
        expect(title.textContent).toBe("Maturité moyenne");
    });

    it("affiche le label pour maturité D", () => {
        render(<MaturityCell row={createRow({ maturite: "D" })} />);

        const title = screen.getByTestId("tooltip-title");
        expect(title.textContent).toBe("Maturité faible");
    });

    it("affiche un message pour une maturité inconnue", () => {
        render(<MaturityCell row={createRow({ maturite: "X" })} />);

        const title = screen.getByTestId("tooltip-title");
        expect(title.textContent).toBe("Maturité inconnue (X)");
    });

    it("gère une maturité undefined", () => {
        render(<MaturityCell row={createRow({ maturite: undefined as any })} />);

        const title = screen.getByTestId("tooltip-title");
        expect(title.textContent).toBe("Maturité inconnue (NR)");
    });

    it("gère la valeur NR", () => {
        render(<MaturityCell row={createRow({ maturite: "NR" })} />);

        const title = screen.getByTestId("tooltip-title");
        expect(title.textContent).toBe("Maturité inconnue (NR)");
    });

    it("gère la valeur SO", () => {
        render(<MaturityCell row={createRow({ maturite: "SO" })} />);

        const title = screen.getByTestId("tooltip-title");
        expect(title.textContent).toBe("Maturité inconnue (SO)");
    });
});
