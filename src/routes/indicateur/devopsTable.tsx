import { createFileRoute } from "@tanstack/react-router";
import { DevopsIndicateurTable } from "../../pages/indicateurs/devops/DevopsIndicateur";

export const Route = createFileRoute("/indicateur/devopsTable")({
    component: RouteComponent
});

function RouteComponent() {
    return <DevopsIndicateurTable />;
}
