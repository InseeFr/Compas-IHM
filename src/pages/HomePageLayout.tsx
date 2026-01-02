import { Box, Container } from "@mui/material";

interface HomePageLayoutProps {
    title: string;
}

export default function HomePageLayout({ title }: Readonly<HomePageLayoutProps>) {
    return (
        <Container
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "anchor-center",
                minHeight: "100vh"
            }}
        >
            <Box
                sx={{
                    height: 100,
                    width: 500,
                    display: "flex",
                    justifyContent: "center",
                    p: 2
                }}
            >
                <h3>{title}</h3>
            </Box>
        </Container>
    );
}
