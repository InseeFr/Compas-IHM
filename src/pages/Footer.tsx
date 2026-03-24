import { Box, Typography } from "@mui/material";
import type { ACCESSIBILITE } from "constantes/constantes";
import { useEffect, useState } from "react";
import "styles/footer.css";
import { getTags, type TagsView } from "todos-api/client.gen";

interface FooterProps {
    accessibility: ACCESSIBILITE;
    darkmode: boolean;
}

export default function Footer({ accessibility }: Readonly<FooterProps>) {
    const [tags, setTags] = useState<TagsView>({});
    useEffect(() => {
        async function Tags(): Promise<void> {
            const data: TagsView = await getTags();
            setTags(data);
        }
        Tags();
    }, []);

    const getAccessibilityConfig = () => {
        switch (accessibility) {
            case "Non-conforme":
                return {
                    label: "Non conforme",
                    color: "#d32f2f",
                    icon: (
                        <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="20"
                            height="20"
                            aria-hidden="true"
                            focusable="false"
                        >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                        </svg>
                    )
                };
            case "partiel":
                return {
                    label: "Partiellement conforme",
                    color: "#f57c00",
                    icon: (
                        <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="20"
                            height="20"
                            aria-hidden="true"
                            focusable="false"
                        >
                            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                        </svg>
                    )
                };
            case "conforme":
                return {
                    label: "Totalement conforme",
                    color: "#388e3c",
                    icon: (
                        <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="20"
                            height="20"
                            aria-hidden="true"
                            focusable="false"
                        >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                    )
                };
        }
    };

    const config = getAccessibilityConfig();

    return (
        <footer id="pied-de-page">
            <Box className="footer-box">
                <output className="footer-box-access" aria-live="polite">
                    <Typography variant="body2" className="footer-typo">
                        Accessibilité :
                    </Typography>
                    <Box
                        className="footer-box-access-icon"
                        style={{ "--main-color": config.color } as React.CSSProperties}
                    >
                        {config.icon}
                        <Typography variant="body2" className="footer-typo">
                            {config.label}
                        </Typography>
                    </Box>
                    <Box className="footer-tags">
                        <Box className="footer-tag-row">
                            <span className="footer-tag-label">API</span>
                            <span className="footer-tag-badge footer-tag-badge--api">
                                {tags.apiTagView?.tag || "Non défini"}
                            </span>
                        </Box>
                        <Box className="footer-tag-row">
                            <span className="footer-tag-label">IHM</span>
                            <span className="footer-tag-badge footer-tag-badge--ihm">
                                {tags.ihmTagView?.tag || "Non défini"}
                            </span>
                        </Box>
                    </Box>
                </output>
            </Box>
        </footer>
    );
}
