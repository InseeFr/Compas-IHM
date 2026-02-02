import { useParams } from "@tanstack/react-router";
import { MarkdownLayout } from "./MarkdownLayout";

export default function HomeLayout() {
    const { pageName } = useParams({ from: "/$pageName" });
    return <MarkdownLayout file={pageName ?? ""} />;
}
