import { render, screen } from "@testing-library/react";
import { getMeteoIcon } from "utils/meteoIcon";
import { describe, it, expect } from "vitest";

describe("getMeteoIcon", () => {
    it("returns unknown icon when value is undefined", () => {
        render(getMeteoIcon());

        expect(screen.getByTitle("Météo inconnue")).toBeInTheDocument();
    });

    it("returns thunderstorm icon for value 1", () => {
        render(getMeteoIcon(1));

        expect(screen.getByTitle("Orage")).toBeInTheDocument();
    });

    it("returns rain icon for value 2", () => {
        render(getMeteoIcon(2));

        expect(screen.getByTitle("Pluie")).toBeInTheDocument();
    });

    it("returns cloudy icon for value 3", () => {
        render(getMeteoIcon(3));

        expect(screen.getByTitle("Nuageux")).toBeInTheDocument();
    });

    it("returns sunny icon for value 4", () => {
        render(getMeteoIcon(4));

        expect(screen.getByTitle("Ensoleillé")).toBeInTheDocument();
    });

    it("returns unknown icon for unsupported value", () => {
        render(getMeteoIcon(999));

        expect(screen.getByTitle("Météo inconnue")).toBeInTheDocument();
    });
});
