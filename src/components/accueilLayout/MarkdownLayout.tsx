import ReactMarkdown from "react-markdown";
import { CustomTable } from "./custom/TableCustom";
import { LinkCustom } from "./custom/LinkCustom";
import "styles/markdown.css";
import { Box, Container } from "@mui/material";
import remarkGfm from "remark-gfm";
import { useMarkdown } from "store/MarkdownIndicatorsContext";

interface MarkdownLayoutProps {
    file: string;
}

export const MarkdownLayout: React.FC<MarkdownLayoutProps> = ({ file }) => {
    const { markdowns } = useMarkdown();
    const content = markdowns[file];
    if (!content) {
        console.error("Impossible de charger le fichier: ", file);
        return (
            <div data-testid="markdown-non-trouvé" className="markdown-non-trouvé">
                Fichier Markdown {file} non trouvé
            </div>
        );
    }

    return (
        <Container disableGutters>
            <Box>
                <div className="markdown-content">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            table: CustomTable.table,
                            th: CustomTable.th,
                            a: LinkCustom.a
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                </div>
            </Box>
        </Container>
    );
};
