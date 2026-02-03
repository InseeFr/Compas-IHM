import { useParams } from "@tanstack/react-router";
import { MarkdownLayout } from "./MarkdownLayout";
import Ariane from "components/Ariane";
import "styles/markdown.css";

export default function HomeLayout() {
    const { pageName } = useParams({ from: "/$pageName" });
    return (
        <div className="markdown-content">
            <Ariane items={[{ nav: pageName, link: "" }]} />
            <MarkdownLayout file={pageName ?? ""} />
        </div>
    );
}
