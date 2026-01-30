import { createFileRoute } from "@tanstack/react-router";
import { MainIndicator } from "pages/indicateurs/main-indicator/mainIndicator";

export const Route = createFileRoute("/indicateur/mainIndicators")({
    component: RouteComponent
});

function RouteComponent() {
    return <MainIndicator />;
}
