import { Box, Typography } from "@mui/material";
import type { ACCESSIBILITE } from "constantes/constantes";
import "styles/footer.css";

interface FooterProps {
    accessibility: ACCESSIBILITE;
    darkmode: boolean;
}

export default function Footer({ accessibility }: Readonly<FooterProps>) {
    const getAccessibilityConfig = () => {
        switch (accessibility) {
            case "Non-conforme":
                return {
                    label: "Non conforme",
                    color: "#d32f2f",
                    icon: (
                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                        </svg>
                    )
                };
            case "partiel":
                return {
                    label: "Partiellement conforme",
                    color: "#f57c00",
                    icon: (
                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                        </svg>
                    )
                };
            case "conforme":
                return {
                    label: "Totalement conforme",
                    color: "#388e3c",
                    icon: (
                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                    )
                };
        }
    };

    const config = getAccessibilityConfig();

    return (
        <footer color="inherit" id="pied-de-page">
            <Box className="footer-box">
                <Box
                    className="footer-box-access"
                    role="status"
                    aria-live="polite"
                >
                    <Typography variant="body2" className="footer-typo">
                        Accessibilité :
                    </Typography>
                    <Box className="footer-box-access-icon" style={{ '--main-color': config.color } as React.CSSProperties}>
                        {config.icon}
                        <Typography variant="body2" className="footer-typo">
                            {config.label}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </footer>
    );
}
