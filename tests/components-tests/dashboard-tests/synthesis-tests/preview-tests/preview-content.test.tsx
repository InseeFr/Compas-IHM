import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ApplicationReportPreview, {
    ButtonGenerateReport
} from "pages/dashboards/applications/preview/ApplicationContent";
import type { IndicateurApplicationSynthese } from "models/indicateurs";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("pages/dashboards/applications/RadarChart/RadarQualiteChar.tsx", () => ({
    default: () => <div data-testid="radar-chart-mock">Radar Chart Mock</div>
}));

const mockApp: IndicateurApplicationSynthese = {
    applicationName: "App1",
    sndi: "123",
    domaineFonc: "Finance",
    lettreQualiteGenerale: "A",
    detteTechnique: "840",
    pourcentageCouvertureTestUniaire: "85",
    lettreNiveauCve: "B",
    lettreGreen: "C",
    distanceNote: "A",
    maturite: "B",
    applicationId: 0,
    domaine: "",
    lettreCouvertureTestUnitaire: "",
    nbCveCritical: "",
    nbCveHigh: "",
    nbCveLow: "",
    nbCveMedium: ""
};

const mockModules = [
    { name: "Mod1", qualite: "A", dette: 420, couverture: "90" },
    { name: "Mod2", qualite: "B", dette: 0, couverture: "70" }
];

const mockPopulation = [mockApp];

describe("ApplicationReportPreview & ButtonGenerateReport", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup(); // Nettoie le DOM entre chaque test
    });

    it("renders application details, indicators, modules and handles report generation", async () => {
        render(
            <ApplicationReportPreview
                appDetails={mockApp}
                modules={mockModules}
                population={mockPopulation}
            />
        );

        expect(screen.getByText(/Rapport d'application : App1/)).toBeInTheDocument();
        expect(screen.getByText(/SNDI/)).toBeInTheDocument();
        expect(screen.getByText(c => c.includes("123"))).toBeInTheDocument();
        expect(screen.getByText(/Domaine fonctionnel/)).toBeInTheDocument();
        expect(screen.getByText(c => c.includes("Finance"))).toBeInTheDocument();

        expect(screen.getByText(/Dette technique/)).toBeInTheDocument();
        expect(screen.getByText(/2.0 jours/)).toBeInTheDocument();

        expect(screen.getByText(/Modules associés/)).toBeInTheDocument();
        expect(screen.getByText(/Mod1/)).toBeInTheDocument();
        expect(screen.getByText(/Mod2/)).toBeInTheDocument();

        const handleMock = vi.fn().mockResolvedValue(undefined);
        render(<ButtonGenerateReport handle={handleMock} appName="App1" />);
        const button = screen.getByRole("button", { name: /Générer le rapport/i });
        await userEvent.click(button);

        await waitFor(() => expect(handleMock).toHaveBeenCalledWith("App1"));

        await waitFor(() =>
            expect(screen.getByText(/Rapport App1 généré avec succès/i)).toBeInTheDocument()
        );

        expect(button).toHaveTextContent(/Générer le rapport/i);
        expect(button).not.toBeDisabled();

        cleanup();
        const handleFail = vi.fn().mockRejectedValue(new Error("fail"));
        render(<ButtonGenerateReport handle={handleFail} appName="App1" />);
        const errorButton = screen.getByRole("button", { name: /Générer le rapport/i });
        await userEvent.click(errorButton);

        await waitFor(() =>
            expect(screen.getByText(/Erreur lors de la génération de Rapport App1/i)).toBeInTheDocument()
        );
    });
});
