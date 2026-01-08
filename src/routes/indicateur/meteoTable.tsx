import { createFileRoute } from "@tanstack/react-router";
import { MeteoTable } from "components/indicateurs/meteo/meteoTable";

export const Route = createFileRoute("/indicateur/meteoTable")({
    component: RouteComponent
});

function RouteComponent() {
    return <MeteoTable />;
}
