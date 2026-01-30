import { Typography, Box } from "@mui/material";

interface AnimatedTitleProps {
    text: string;
}

export default function AnimatedTitle({ text }: Readonly<AnimatedTitleProps>) {
    return (
        <Typography
            component={"h1"}
            color="inherit"
            tabIndex={0}
            aria-label={text}
            sx={{
                fontFamily: '"Segoe UI Symbol"',
                fontWeight: 500,
                paddingTop: 5,
                fontSize: { xs: "0.875rem", md: "1.75rem" },
                textAlign: "center",
                letterSpacing: "0.08em",
                mb: 5,

                "@keyframes popWord": {
                    "0%": {
                        opacity: 0,
                        transform: "scale(0.8) translateY(10px)"
                    },
                    "100%": {
                        opacity: 1,
                        transform: "scale(1) translateY(0)"
                    }
                }
            }}
        >
            {text.split(" ").map((word, index) => (
                <Box
                    key={word}
                    component={"h1"}
                    sx={{
                        display: "inline-block",
                        opacity: 0,
                        animation: "popWord 0.6s ease-out forwards",
                        animationDelay: `${index * 0.15}s`,
                        mr: 1
                    }}
                >
                    {word}
                </Box>
            ))}
        </Typography>
    );
}
