import { createFileRoute } from "@tanstack/react-router";
import { DevopsIndicateurTable } from "../components/DevopsIndicateur";

export const Route = createFileRoute("/devopsTable")({
    component: RouteComponent
});

function RouteComponent() {
    return <DevopsIndicateurTable />;
}
