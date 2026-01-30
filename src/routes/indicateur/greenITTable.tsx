import { createFileRoute } from "@tanstack/react-router";
import { GreenItTable } from "pages/indicateurs/greenIT/GreenItTable";

export const Route = createFileRoute("/indicateur/greenITTable")({
    component: RouteComponent
});

function RouteComponent() {
    return <GreenItTable />;
}
