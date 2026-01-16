import { createFileRoute } from "@tanstack/react-router";
import { ApplicationSynthesis } from "components/dashboards/applications/ApplicationSynthesis";

export const Route = createFileRoute("/dashboard/synthese")({
    component: RouteComponent
});

function RouteComponent() {
    return <ApplicationSynthesis />;
}
