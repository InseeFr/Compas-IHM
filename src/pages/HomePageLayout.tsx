import { Box, Container, Link, Typography } from "@mui/material";

interface HomePageLayoutProps {
    title: string;
    content: string;
    link: string;
}

export default function HomePageLayout(props: Readonly<HomePageLayoutProps>) {
    return (
        <Container
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh"
            }}
        >
            <Box
                sx={{
                    height: 100,
                    width: 500,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 2
                }}
            >
                <h3>{props.title}</h3>
            </Box>
            <Typography>
                {props.content}:{" "}
                <Link href={props.link} target="_blank">
                    Wiki-indicateurs
                </Link>
            </Typography>
        </Container>
    );
}
