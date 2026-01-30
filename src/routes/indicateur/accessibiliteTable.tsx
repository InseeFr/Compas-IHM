import { createFileRoute } from "@tanstack/react-router";
import { A11yIndicateurTable } from "pages/indicateurs/a11y/A11yIndicateur";

export const Route = createFileRoute("/indicateur/accessibiliteTable")({
    component: RouteComponent
});

function RouteComponent() {
    return <A11yIndicateurTable />;
}
