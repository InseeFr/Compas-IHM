import { Typography } from "@mui/material";

export default function ChartTitle({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <Typography
            variant="subtitle1"
            component="h3"
            fontWeight={600}
            textAlign="center"
            color="text.primary"
            gutterBottom
        >
            {children}
        </Typography>
    );
}
