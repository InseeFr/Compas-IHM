import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { CustomTable } from "./custom/TableCustom";
import { LinkCustom } from "./custom/LinkCustom";
import "styles/markdown.css";
import { Box, Container } from "@mui/material";
import remarkGfm from "remark-gfm";
import { markdownFiles } from "utils/markdown-files";

interface MarkdownLayoutProps {
    file: string;
}

export const MarkdownLayout: React.FC<MarkdownLayoutProps> = ({ file }) => {
    const [content, setContent] = useState<string>("");

    useEffect(() => {
        const fetchFile = (file: string): void => {
            const entry: [string, string] | undefined = Object.entries(markdownFiles).find(([path]) =>
                path.endsWith(`${file}.md`)
            );
            if (!entry) {
                console.error("Impossible de charger le fichier: ", file);
                return;
            }
            setContent(entry[1]);
        };
        fetchFile(file);
    }, [file]);
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
