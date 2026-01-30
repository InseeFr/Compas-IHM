import { Box, Container, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import "styles/markdown.css";

const markdowns = import.meta.glob("../assets/content/compas-accueil.md", {
    query: "?raw",
    import: "default"
});

const markdownComponents: Components = {
    a: ({ href, children }) => (
        <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
        </a>
    ),
    h1: ({ children }) => (
        <Typography variant="h1" tabIndex={0}>
            {children}
        </Typography>
    ),
    h2: ({ children }) => (
        <Typography variant="h2" tabIndex={0}>
            {children}
        </Typography>
    ),
    p: ({ children }) => <Typography tabIndex={0}>{children}</Typography>
};

export default function HomePageLayout() {
    const [content, setContent] = useState<string>("");

    useEffect(() => {
        const loadMarkdown = async () => {
            const loader = markdowns["../assets/content/compas-accueil.md"];
            if (!loader) {
                console.error("Markdown not found!");
                return;
            }

            const text = await (loader as () => Promise<string>)();
            setContent(text);
        };

        loadMarkdown();
    }, []);

    return (
        <Container disableGutters>
            <Box>
                <div className="markdown-content">
                    <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
                </div>
            </Box>
        </Container>
    );
}
