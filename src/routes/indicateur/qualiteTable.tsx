import { createFileRoute } from "@tanstack/react-router";
import QualiteIndicateurTable from "components/indicateurs/qualité/QualiteIndicateur";

export const Route = createFileRoute("/indicateur/qualiteTable")({
    component: RouteComponent
});

function RouteComponent() {
    return <QualiteIndicateurTable />;
}
