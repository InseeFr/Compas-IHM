import { Box, Container } from "@mui/material";
import { Link } from "@tanstack/react-router";
import pageTitles from "assets/content/pagesMdConfig.json";
import type { PageItem } from "models/page-markdown";
import "styles/markdown.css";

export default function HomePageLayout() {
    const grouped = pageTitles.reduce<Record<string, PageItem[]>>((acc, curr) => {
        if (!acc[curr.parent]) acc[curr.parent] = [];
        acc[curr.parent].push(curr);
        return acc;
    }, {});
    return (
        <Container disableGutters>
            <Box>
                <div className="markdown-content">
                    <h1>Accueil</h1>
                    <p>La liste de tous les indicateurs de Compas et leur explications :</p>
                    <ul>
                        {Object.entries(grouped).map(([parent, pages]) => (
                            <li key={parent}>
                                <strong>{parent}</strong>
                                <ul>
                                    {pages.map(page => (
                                        <li key={page.page}>
                                            <Link to="/$pageName" params={{ pageName: page.file }}>
                                                {page.page}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </div>
            </Box>
        </Container>
    );
}
