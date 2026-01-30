import { createFileRoute } from "@tanstack/react-router";
import { MeteoForm } from "pages/saisies/meteo/meteoForm";

export const Route = createFileRoute("/saisie/meteo")({
    component: RouteComponent
});

function RouteComponent() {
    return <MeteoForm />;
}
