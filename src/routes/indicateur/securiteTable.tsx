import { createFileRoute } from "@tanstack/react-router";
import SecuriteIndicateurTable from "components/indicateurs/securite/SecuriteIndicateur";

export const Route = createFileRoute("/indicateur/securiteTable")({
    component: RouteComponent
});

function RouteComponent() {
    return <SecuriteIndicateurTable />;
}
