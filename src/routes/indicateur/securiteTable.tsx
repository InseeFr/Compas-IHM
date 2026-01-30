import { createFileRoute } from "@tanstack/react-router";
import SecuriteIndicateurTable from "pages/indicateurs/securite/SecuriteIndicateur";

export const Route = createFileRoute("/indicateur/securiteTable")({
    component: RouteComponent
});

function RouteComponent() {
    return <SecuriteIndicateurTable />;
}
