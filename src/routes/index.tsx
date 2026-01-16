import { createFileRoute } from "@tanstack/react-router";
import HomePageLayout from "../pages/HomePageLayout";
import { CONTENT, LINK, WELCOME_MESSAGE } from "../constantes/constantes";

export const Route = createFileRoute("/")({
    component: IndexPage
});

function IndexPage() {
    return <HomePageLayout title={WELCOME_MESSAGE} content={CONTENT} link={LINK} />;
}
