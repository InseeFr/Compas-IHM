import { createFileRoute } from "@tanstack/react-router";
import A11yForm from "components/saisies/a11y/a11yForm";

export const Route = createFileRoute("/saisie/accessibilité")({
    component: RouteComponent
});

function RouteComponent() {
    return <A11yForm />;
}
